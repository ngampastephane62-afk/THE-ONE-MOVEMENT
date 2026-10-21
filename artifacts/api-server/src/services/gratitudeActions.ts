import { db, gratitudeReports as reports } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import type { Response } from "express";
import { RunGratitudeActionBody } from "@workspace/api-zod";
import { actor, NetworkError, requireFounder } from "./networkAuth";
import {
  campaigns, contributions, comments, engagement, media, members, profiles,
  lockedStory, requirePublic, validateSubmission, rate, log,
} from "./gratitudeStore";
import { positiveId, validateCountryTheme, versionMatch, identityStyles } from "./gratitudePolicy";
import { GRATITUDE_CONSENT_VERSION } from "@workspace/shared";

export async function gratitudeAction(body: unknown, res: Response) {
  const parsed = RunGratitudeActionBody.strict().safeParse(body);
  if (!parsed.success) throw new NetworkError(400, "Check the campaign action and its fields.");
  const input = parsed.data;
  const who = actor(res, false);
  const self = who.member.id;
  return db.transaction(async tx => {
    if (input.action === "campaign") {
      requireFounder(res);
      if (!input.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug) || !input.name?.trim() || !input.campaignStatus) throw new NetworkError(400, "Add a valid campaign name, slug and status.");
      if (!input.identity || !identityStyles.has(input.identity)) throw new NetworkError(400, "Choose a campaign identity.");
      // Serialize hierarchy changes, including concurrent parent changes.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(73521901)`);
      const id = input.id ? positiveId(input.id) : undefined;
      const parentId = input.parentId == null ? null : positiveId(input.parentId);
      let parent = parentId;
      const visited = new Set<number>();
      while (parent != null) {
        if (parent === id || visited.has(parent) || visited.size > 50) throw new NetworkError(400, "Campaign hierarchy cannot contain a cycle.");
        visited.add(parent);
        const [row] = await tx.select().from(campaigns).where(eq(campaigns.id, parent));
        if (!row) throw new NetworkError(400, "Parent campaign not found.");
        parent = row.parentId;
      }
      const values = {
        slug: input.slug, name: input.name.trim(), description: input.description?.trim() ?? "",
        status: input.campaignStatus, parentId, identity: { style: input.identity }, updatedBy: self, updatedAt: new Date(),
      };
      const [saved] = id
        ? await tx.update(campaigns).set(values).where(eq(campaigns.id, id)).returning()
        : await tx.insert(campaigns).values({ ...values, createdBy: self }).returning();
      if (!saved) throw new NetworkError(404, "Campaign not found.");
      await log(tx, self, "campaign.save", saved.id, { status: saved.status, style: input.identity });
      return { id: saved.id };
    }
    if (input.action === "save" && !input.id) {
      const campaignId = positiveId(input.campaignId);
      const [campaign] = await tx.select().from(campaigns).where(eq(campaigns.id, campaignId)).for("share");
      if (!campaign || campaign.status !== "active") throw new NetworkError(409, "Choose an active campaign.");
      validateCountryTheme(input.countryCode, input.theme);
      await rate(tx, self, "submit"); // Draft creation also bounded against spam.
      const [saved] = await tx.insert(contributions).values({
        authorId: self, campaignId, title: input.title?.trim() ?? "", body: input.body?.trim() ?? "",
        countryCode: input.countryCode ?? null, theme: input.theme ?? null,
      }).returning();
      await log(tx, self, "draft.create", saved.id, { version: saved.version });
      return { id: saved.id };
    }
    if (input.action === "resolveReport") {
      requireFounder(res);
      if (!input.reason || input.reason.trim().length < 3) throw new NetworkError(400, "Add a decision reason.");
      const [row] = await tx.update(reports).set({
        status: "resolved", resolvedBy: self, resolvedAt: new Date(), resolutionReason: input.reason.trim(),
      }).where(and(eq(reports.id, positiveId(input.id)), eq(reports.status, "open"))).returning();
      if (!row) throw new NetworkError(404, "Open report not found.");
      await log(tx, self, "report.resolve", row.id, { contributionId: row.contributionId, reason: input.reason.trim() });
      return { id: row.id };
    }
    const id = positiveId(input.id);
    const story = await lockedStory(tx, id);
    if (["save", "submit", "archive", "removeMedia"].includes(input.action)) {
      if (story.authorId !== self) throw new NetworkError(404, "Your story was not found.");
      versionMatch(story.version, input.version);
      if (input.action === "archive") {
        await tx.update(contributions).set({ status: "archived", featured: false, updatedAt: new Date() }).where(eq(contributions.id, id));
        await log(tx, self, "archive", id, { from: story.status, version: story.version });
      } else if (input.action === "submit") {
        if (!["draft", "rejected", "archived"].includes(story.status)) throw new NetworkError(409, "This story cannot be submitted in its current state.");
        if (!input.consent || !input.rights) throw new NetworkError(400, "Confirm public publication consent and media rights.");
        await validateSubmission(tx, story);
        await rate(tx, self, "submit");
        await tx.update(contributions).set({
          status: "pending_review", featured: false, approvedVersion: null,
          publicConsentAt: new Date(), rightsConfirmedAt: new Date(), consentVersion: GRATITUDE_CONSENT_VERSION,
          decisionReason: "", submittedAt: new Date(), updatedAt: new Date(),
        }).where(eq(contributions.id, id));
        await log(tx, self, "submit", id, { from: story.status, version: story.version, consentVersion: GRATITUDE_CONSENT_VERSION });
      } else {
        if (input.action === "save") {
          validateCountryTheme(input.countryCode, input.theme);
          if (input.campaignId != null && input.campaignId !== story.campaignId) throw new NetworkError(400, "Create a separate draft to choose a different campaign.");
          await tx.update(contributions).set({
            title: input.title?.trim() ?? story.title, body: input.body?.trim() ?? story.body,
            countryCode: input.countryCode === undefined ? story.countryCode : input.countryCode,
            theme: input.theme === undefined ? story.theme : input.theme,
          }).where(eq(contributions.id, id));
        } else {
          const [removed] = await tx.delete(media).where(and(eq(media.id, positiveId(input.mediaId)), eq(media.contributionId, id))).returning();
          if (!removed) throw new NetworkError(404, "Attachment not found.");
        }
        await tx.update(contributions).set({
          status: "draft", featured: false, version: story.version + 1, approvedVersion: null,
          publicConsentAt: null, rightsConfirmedAt: null, consentVersion: null,
          updatedAt: new Date(),
        }).where(eq(contributions.id, id));
        await log(tx, self, input.action, id, { from: story.status, version: story.version + 1 });
      }
      return { id };
    }
    if (input.action === "moderate") {
      requireFounder(res);
      versionMatch(story.version, input.version);
      if (self === story.authorId) throw new NetworkError(403, "You cannot moderate your own contribution.");
      const reason = input.reason?.trim() ?? "";
      if (reason.length < 3) throw new NetworkError(400, "Add a moderation reason.");
      const decision = input.decision;
      let status = story.status;
      let approvedVersion = story.approvedVersion;
      let featured = story.featured;
      if (decision === "publish" || decision === "restore") {
        if (decision === "publish" && story.status !== "pending_review") throw new NetworkError(409, "Only submitted stories can be approved.");
        if (decision === "restore" && (story.status !== "hidden" || story.approvedVersion !== story.version)) throw new NetworkError(409, "This story needs a new submission and review.");
        await validateSubmission(tx, story);
        const [owner] = await tx.select({ public: members.isPublic, suspended: profiles.suspended }).from(members)
          .innerJoin(profiles, eq(profiles.memberId, members.id)).where(eq(members.id, story.authorId));
        if (!owner?.public || owner.suspended) throw new NetworkError(409, "The author must allow a public profile and remain eligible before publication.");
        if (!story.publicConsentAt || !story.rightsConfirmedAt || story.consentVersion !== GRATITUDE_CONSENT_VERSION) throw new NetworkError(409, "The author needs to renew publication consent.");
        status = "published"; approvedVersion = story.version;
      } else if (decision === "reject") {
        if (story.status !== "pending_review") throw new NetworkError(409, "Only a submitted story can be rejected.");
        status = "rejected"; approvedVersion = null; featured = false;
      } else if (decision === "hide") {
        if (story.status !== "published") throw new NetworkError(409, "Only a published story can be suspended.");
        status = "hidden"; featured = false;
      } else if (decision === "feature" || decision === "unfeature") {
        await requirePublic(tx, id);
        featured = decision === "feature";
      } else throw new NetworkError(400, "Choose a moderation decision.");
      await tx.update(contributions).set({
        status, approvedVersion, featured, decisionReason: reason, reviewedBy: self, reviewedAt: new Date(),
        publishedAt: status === "published" ? story.publishedAt ?? new Date() : story.publishedAt,
        updatedAt: new Date(),
      }).where(eq(contributions.id, id));
      await log(tx, self, `moderation.${decision}`, id, { from: story.status, to: status, reason, version: story.version });
      return { id };
    }
    if (input.action === "deleteComment" || input.action === "moderateComment") {
      const commentId = positiveId(input.commentId);
      const [comment] = await tx.select().from(comments).where(and(eq(comments.id, commentId), eq(comments.contributionId, id))).for("update");
      if (!comment) throw new NetworkError(404, "Comment not found.");
      if (input.action === "deleteComment") {
        if (comment.authorId !== self) throw new NetworkError(404, "Your comment was not found.");
        // Logical removal keeps report references stable and removes the text.
        await tx.update(comments).set({ hidden: true, body: "[removed]", updatedAt: new Date() }).where(eq(comments.id, commentId));
      } else {
        requireFounder(res);
        if (!input.reason || input.reason.trim().length < 3) throw new NetworkError(400, "Add a moderation reason.");
        if (comment.body === "[removed]" && input.accepted === false) throw new NetworkError(409, "An author-deleted comment cannot be restored.");
        await tx.update(comments).set({ hidden: input.accepted !== false, updatedAt: new Date() }).where(eq(comments.id, commentId));
      }
      await log(tx, self, input.action, commentId, { contributionId: id, reason: input.reason ?? "" });
      return { id };
    }
    await requirePublic(tx, id, self, input.action === "report");
    if (input.action === "report") {
      if (!input.reason || input.reason.trim().length < 3) throw new NetworkError(400, "Explain the concern.");
      await rate(tx, self, "comment");
      const commentId = input.commentId == null ? null : positiveId(input.commentId);
      if (commentId) {
        const [comment] = await tx.select().from(comments).where(and(eq(comments.id, commentId), eq(comments.contributionId, id)));
        if (!comment) throw new NetworkError(404, "Comment not found.");
      }
      await tx.insert(reports).values({ contributionId: id, commentId, reporterId: self, reason: input.reason.trim() }).onConflictDoNothing();
    } else if (input.action === "comment") {
      const body = input.body?.trim() ?? "";
      if (!body || body.length > 2000) throw new NetworkError(400, "Comments need 1–2000 characters.");
      await rate(tx, self, "comment");
      const duplicate = await tx.select({ id: comments.id }).from(comments).where(and(
        eq(comments.authorId, self), eq(comments.body, body),
        sql`${comments.createdAt} > now() - interval '10 minutes'`,
      )).limit(1);
      if (duplicate.length) throw new NetworkError(429, "This comment was already sent recently.");
      await tx.insert(comments).values({ contributionId: id, authorId: self, body });
    } else if (["view", "like", "share"].includes(input.action)) {
      const kind = input.action === "share" ? "share_intent" : input.action as "view" | "like";
      if (self === story.authorId) throw new NetworkError(400, "Your own engagement does not count toward discovery.");
      await rate(tx, self, kind);
      if (kind === "like" && input.accepted === false) {
        await tx.delete(engagement).where(and(eq(engagement.contributionId, id), eq(engagement.memberId, self), eq(engagement.kind, kind)));
      } else await tx.insert(engagement).values({ contributionId: id, memberId: self, kind }).onConflictDoNothing();
    } else throw new NetworkError(400, "Unknown campaign action.");
    return { id };
  });
}
