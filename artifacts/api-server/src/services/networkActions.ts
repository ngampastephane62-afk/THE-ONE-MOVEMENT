import {
  db, networkProfiles as profiles, networkPosts as posts, networkComments as comments,
  networkLikes as likes, networkViews as views, networkFollows as follows, networkBlocks as blocks,
  networkThreads as threads, networkMessages as messages, networkCertifications as certs,
  networkReports as reports, networkAudit as audit,
} from "@workspace/db";
import { NetworkActionBody, type NetworkActionInput } from "@workspace/api-zod";
import { and, eq, inArray, or, ne, isNull } from "drizzle-orm";
import type { Request, Response } from "express";
import { actor, NetworkError, requireFounder } from "./networkAuth";
import { ownedMedia, completeUpload } from "./networkFiles";
import { visibleMember, visiblePost, ownThread, ROLES, PROGRAMS, isBlocked, qualifiedInviteCount, REQUIRED_INVITES } from "./networkState";
import { checkout, PACKAGE_DEFINITIONS, customPackages } from "./networkPayments";

function number(value: unknown) {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new NetworkError(400, "Choose a valid record.");
  return Number(value);
}
function text(value: string | undefined, max = 5000, required = true) {
  const out = (value ?? "").trim();
  if ((required && !out) || out.length > max) throw new NetworkError(400, `Enter text between ${required ? 1 : 0} and ${max} characters.`);
  return out;
}
function accepted(value: boolean | undefined) {
  if (typeof value !== "boolean") throw new NetworkError(400, "Choose the action explicitly.");
  return value;
}
export async function networkAction(req: Request, res: Response) {
  const parsed = NetworkActionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid network action.");
  const input: NetworkActionInput = parsed.data;
  const who = actor(res, !["join", "upload.complete", "profile.media"].includes(input.action));
  const self = who.member.id;
  const id = () => number(input.id);
  const target = () => number(input.targetId);
  let resultId: number | undefined;
  switch (input.action) {
    case "join": {
      await db.update(profiles).set({ enabled: accepted(input.accepted) }).where(eq(profiles.memberId, self));
      break;
    }
    case "referral.claim": {
      if (!res.locals.networkEnabled) throw new NetworkError(409, "Join the network before accepting an invitation.");
      if (input.accepted !== true) throw new NetworkError(400, "Accept the invitation and follow explicitly.");
      const code = input.kind ?? "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code)) throw new NetworkError(400, "Invalid invitation.");
      const [inviter] = await db.select().from(profiles).where(eq(profiles.inviteCode, code)).limit(1);
      if (!inviter || !inviter.enabled || inviter.suspended || inviter.memberId === self) throw new NetworkError(404, "This invitation is unavailable.");
      // A referral only credits a newly created, verified account that did not
      // exist when the invitation became available. Each account has one sponsor.
      if (who.accountCreatedAt < inviter.createdAt.getTime() || who.accountCreatedAt < Date.now() - 24 * 60 * 60 * 1000) {
        throw new NetworkError(403, "Only accounts created after this invitation and within the last 24 hours can be credited.");
      }
      if (await isBlocked(self, inviter.memberId)) throw new NetworkError(403, "This member cannot be followed.");
      await db.transaction(async tx => {
        const [credited] = await tx.update(profiles).set({ referredBy: inviter.memberId })
          .where(and(eq(profiles.memberId, self), isNull(profiles.referredBy), eq(profiles.enabled, true))).returning({ memberId: profiles.memberId });
        if (!credited) throw new NetworkError(409, "This account already accepted an invitation.");
        await tx.insert(follows).values({ followerId: self, followingId: inviter.memberId }).onConflictDoNothing();
      });
      break;
    }
    case "upload.complete": {
      if (!input.mediaIds?.length || input.mediaIds.length > 6) throw new NetworkError(400, "Choose your uploaded file.");
      for (const mediaId of input.mediaIds) await completeUpload(self, mediaId);
      break;
    }
    case "profile.media": {
      if (!["avatar", "cover"].includes(input.kind ?? "")) throw new NetworkError(400, "Choose avatar or cover.");
      if (input.mediaIds?.length !== 1) throw new NetworkError(400, "Choose one image.");
      const media = await ownedMedia(self, input.mediaIds);
      if (!media[0]?.contentType.startsWith("image/")) throw new NetworkError(400, "Choose an image for your profile.");
      await db.update(profiles).set(input.kind === "avatar" ? { avatarId: media[0].id } : { coverId: media[0].id }).where(eq(profiles.memberId, self));
      break;
    }
    case "post.create":
    case "post.edit": {
      if (input.action === "post.create" && !who.founder && await qualifiedInviteCount(self) < REQUIRED_INVITES) {
        throw new NetworkError(403, `Invite ${REQUIRED_INVITES} new members who create accounts and follow you before publishing.`);
      }
      const content = text(input.text, 5000, false);
      const media = await ownedMedia(self, input.mediaIds);
      if (!content && !media.length) throw new NetworkError(400, "Write something or attach media.");
      const kind = input.kind ?? "post";
      if (!["post", "business", "reel"].includes(kind)) throw new NetworkError(400, "Choose post, business or reel.");
      if (kind === "reel" && !media.some(m => m.contentType.startsWith("video/"))) throw new NetworkError(400, "A reel needs an uploaded video.");
      if (input.action === "post.edit") {
        const [row] = await db.select().from(posts).where(and(eq(posts.id, id()), eq(posts.authorId, self)));
        if (!row) throw new NetworkError(404, "Your publication was not found.");
        await db.update(posts).set({ text: content, mediaIds: media.map(m => m.id), kind, updatedAt: new Date() }).where(eq(posts.id, row.id));
        resultId = row.id;
      } else {
        const [row] = await db.insert(posts).values({ authorId: self, text: content, mediaIds: media.map(m => m.id), kind }).returning();
        resultId = row!.id;
      }
      break;
    }
    case "post.delete": {
      const [row] = await db.select().from(posts).where(and(eq(posts.id, id()), eq(posts.authorId, self)));
      if (!row) throw new NetworkError(404, "Your publication was not found.");
      await db.delete(posts).where(and(eq(posts.id, row.id), eq(posts.authorId, self)));
      break;
    }
    case "post.like": {
      const post = await visiblePost(id(), self);
      if (accepted(input.accepted)) await db.insert(likes).values({ postId: post.id, memberId: self }).onConflictDoNothing();
      else await db.delete(likes).where(and(eq(likes.postId, post.id), eq(likes.memberId, self)));
      break;
    }
    case "post.view": {
      const post = await visiblePost(id(), self);
      if (post.authorId !== self) await db.insert(views).values({ postId: post.id, memberId: self }).onConflictDoNothing();
      break;
    }
    case "comment.create": {
      const post = await visiblePost(id(), self);
      const [row] = await db.insert(comments).values({ postId: post.id, authorId: self, text: text(input.text, 2000) }).returning();
      resultId = row!.id;
      break;
    }
    case "comment.delete": {
      const [row] = await db.select().from(comments).where(and(eq(comments.id, id()), eq(comments.authorId, self)));
      if (!row) throw new NetworkError(404, "Your comment was not found.");
      await db.delete(comments).where(eq(comments.id, row.id));
      break;
    }
    case "follow": {
      const other = target();
      if (other === self) throw new NetworkError(400, "You cannot follow yourself.");
      await visibleMember(other, self);
      if (accepted(input.accepted)) await db.insert(follows).values({ followerId: self, followingId: other }).onConflictDoNothing();
      else await db.delete(follows).where(and(eq(follows.followerId, self), eq(follows.followingId, other)));
      break;
    }
    case "block": {
      const other = target();
      if (other === self) throw new NetworkError(400, "You cannot block yourself.");
      if (accepted(input.accepted)) {
        await visibleMember(other, self);
        await db.transaction(async tx => {
          await tx.insert(blocks).values({ blockerId: self, blockedId: other }).onConflictDoNothing();
          await tx.delete(follows).where(or(and(eq(follows.followerId, self), eq(follows.followingId, other)), and(eq(follows.followerId, other), eq(follows.followingId, self))));
        });
      } else await db.delete(blocks).where(and(eq(blocks.blockerId, self), eq(blocks.blockedId, other)));
      break;
    }
    case "thread.start": {
      const other = target();
      if (other === self) throw new NetworkError(400, "Choose another member.");
      await visibleMember(other, self);
      const a = Math.min(self, other), b = Math.max(self, other);
      let [thread] = await db.select().from(threads).where(and(eq(threads.memberA, a), eq(threads.memberB, b)));
      if (thread?.declined) throw new NetworkError(403, "This discussion request was declined.");
      if (!thread) {
        const initial = text(input.text, 3000);
        thread = await db.transaction(async tx => {
          const [created] = await tx.insert(threads).values({ memberA: a, memberB: b, requestedBy: self })
            .onConflictDoNothing().returning();
          if (!created) {
            const [existing] = await tx.select().from(threads).where(and(eq(threads.memberA, a), eq(threads.memberB, b)));
            return existing!;
          }
          await tx.insert(messages).values({ threadId: created.id, senderId: self, text: initial });
          return created;
        });
      }
      resultId = thread.id;
      break;
    }
    case "thread.accept":
    case "thread.decline": {
      const thread = await ownThread(id(), self);
      if (thread.requestedBy === self) throw new NetworkError(403, "Only the recipient can accept or decline a request.");
      await db.update(threads).set({
        accepted: input.action === "thread.accept", declined: input.action === "thread.decline", updatedAt: new Date(),
      }).where(eq(threads.id, thread.id));
      break;
    }
    case "message.send": {
      const thread = await ownThread(id(), self);
      if (!thread.accepted || thread.declined) throw new NetworkError(403, "The recipient must accept the discussion request first.");
      await db.transaction(async tx => {
        await tx.insert(messages).values({ threadId: thread.id, senderId: self, text: text(input.text, 3000) });
        await tx.update(threads).set({ updatedAt: new Date() }).where(eq(threads.id, thread.id));
      });
      break;
    }
    case "message.read": {
      const thread = await ownThread(id(), self);
      await db.update(messages).set({ read: true }).where(and(eq(messages.threadId, thread.id), ne(messages.senderId, self)));
      break;
    }
    case "certification.request": {
      const role = input.role ?? "", program = input.program ?? "";
      if (!ROLES.has(role) || !PROGRAMS.has(program)) throw new NetworkError(400, "Choose an official role and programme.");
      const packageSlug = input.packageSlug ?? "";
      const pack = [...PACKAGE_DEFINITIONS, ...customPackages].find(p => p.slug === packageSlug);
      if (packageSlug && (!pack || pack.audience !== role)) throw new NetworkError(400, "Choose a package that matches this participation role.");
      const pending = await db.select().from(certs).where(and(eq(certs.memberId, self), inArray(certs.status, ["pending", "approved"])));
      if (pending.filter(c => c.status === "pending").length >= 10) throw new NetworkError(429, "Please wait for your pending applications to be reviewed.");
      if (pending.some(c => c.role === role && c.program === program && c.packageSlug === packageSlug && (!c.expiresAt || c.expiresAt.getTime() > Date.now()))) throw new NetworkError(409, "You already have a current application for this role and programme.");
      const evidence = await ownedMedia(self, input.mediaIds);
      const [row] = await db.insert(certs).values({
        memberId: self, role, program, packageSlug, note: text(input.text, 3000),
        evidenceIds: evidence.map(m => m.id),
      }).returning();
      resultId = row!.id;
      break;
    }
    case "certification.decide": {
      requireFounder(res);
      const [application] = await db.select().from(certs).where(eq(certs.id, id()));
      if (!application) throw new NetworkError(404, "Application not found.");
      const decision = input.decision ?? "";
      if (!["approved", "rejected", "revoked"].includes(decision)) throw new NetworkError(400, "Choose an approval decision.");
      const note = text(input.text, 1000);
      const commercial = ["partner", "sponsor", "designer", "exhibitor"].includes(application.role);
      const agreement = input.agreementConfirmed ?? application.agreementConfirmed;
      const payment = input.paymentConfirmed ?? application.paymentConfirmed;
      if (decision === "approved" && commercial && !agreement) throw new NetworkError(400, "Confirm receipt of the written agreement before approving this commercial package.");
      const expiry = new Date();
      expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
      await db.transaction(async tx => {
        await tx.update(certs).set({
          status: decision, decisionNote: note, agreementConfirmed: agreement, paymentConfirmed: payment,
          expiresAt: decision === "approved" ? expiry : application.expiresAt, updatedAt: new Date(),
        }).where(eq(certs.id, application.id));
        await tx.insert(audit).values({ actorId: self, action: `certification.${decision}`, targetId: application.id, detail: JSON.stringify({ note, agreement, payment }) });
      });
      break;
    }
    case "report": {
      const reason = text(input.text, 1000);
      const postId = input.id ? number(input.id) : null;
      const memberId = input.targetId ? number(input.targetId) : null;
      if (!postId && !memberId) throw new NetworkError(400, "Choose a publication or member to report.");
      if (postId) await visiblePost(postId, self);
      if (memberId) await visibleMember(memberId, self);
      await db.insert(reports).values({ reporterId: self, postId, memberId, reason });
      break;
    }
    case "moderate.post": {
      requireFounder(res);
      const [post] = await db.select().from(posts).where(eq(posts.id, id()));
      if (!post) throw new NetworkError(404, "Publication not found.");
      const hidden = accepted(input.accepted), note = text(input.text, 1000);
      await db.transaction(async tx => {
        await tx.update(posts).set({ hidden }).where(eq(posts.id, post.id));
        await tx.insert(audit).values({ actorId: self, action: hidden ? "post.hide" : "post.restore", targetId: post.id, detail: note });
      });
      break;
    }
    case "moderate.member": {
      requireFounder(res);
      const memberId = target();
      if (memberId === self) throw new NetworkError(400, "You cannot suspend your Founder account.");
      const suspended = accepted(input.accepted), note = text(input.text, 1000);
      const [profile] = await db.select().from(profiles).where(eq(profiles.memberId, memberId));
      if (!profile) throw new NetworkError(404, "Network member not found.");
      await db.transaction(async tx => {
        await tx.update(profiles).set({ suspended }).where(eq(profiles.memberId, memberId));
        await tx.insert(audit).values({ actorId: self, action: suspended ? "member.suspend" : "member.restore", targetId: memberId, detail: note });
      });
      break;
    }
    case "report.resolve": {
      requireFounder(res);
      await db.update(reports).set({ resolved: true }).where(eq(reports.id, id()));
      await db.insert(audit).values({ actorId: self, action: "report.resolve", targetId: id() });
      break;
    }
    case "checkout": {
      return { ok: true, url: await checkout(who, id(), new URL(req.get("origin")!).origin, accepted(input.accepted)) };
    }
    default: throw new NetworkError(400, "Unknown network action.");
  }
  return { ok: true, ...(resultId ? { id: resultId } : {}) };
}
