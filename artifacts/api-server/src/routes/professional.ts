import { Router, type Request } from "express";
import {
  db, professionalBusinesses as businesses, businessAttestations as attestations,
  professionalIntroductions as introductions, networkProfiles as profiles,
  networkBlocks as blocks, ecosystemMembersTable as members,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { ProfessionalActionBody, CreateProfessionalIntroductionBody } from "@workspace/api-zod";
import { networkAuth, networkWrite, actor, requireFounder, NetworkError } from "../services/networkAuth";
import { MONTHLY_PLANS, monthlyMode, monthlyMembership, refreshMonthly, monthlyCheckout, cancelMonthly, requireMonthly } from "../services/monthlyMembership";
import { getUncachableStripeClient } from "../stripeClient";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";
import { isBlocked, visibleMember } from "../services/networkState";
import { AMBASSADOR_SLUGS } from "@workspace/shared";

const router = Router();
const RESOURCES = [
  {
    slug: "networking-guide", title: "The TOMI professional networking guide",
    description: "How to build a credible profile, approach other sectors and request introductions responsibly.",
    sections: [
      { heading: "Build a useful professional identity", text: "State your actual role, organisation, location and work. Link to an official business website. Explain what you can offer and which collaborations you are seeking. Membership does not prove identity, licensure, financial standing or legal registration." },
      { heading: "Earn your publishing access", text: "Invite ten new members through your personal invitation link. They must verify their email, explicitly accept your invitation and follow you. Invitations sent and artificial accounts do not count. A basic publication is free once this condition is met; business publications and reels are professional services." },
      { heading: "Request a permission-based introduction", text: "Identify the person or sector, describe a specific mutually useful proposal and include a realistic scope. Requests to nominated ambassadors go to TOMI for review. The person remains free to decline; neither payment nor membership guarantees a reply, a meeting, financing or a commercial agreement." },
      { heading: "Protect your contacts", text: "Use the member messaging request mechanism. Do not publish private contact details, share another person's documents without consent, send unsolicited bulk pitches or transfer money before your own checks and written agreements." },
    ],
  },
  {
    slug: "sponsor-brief", title: "Business and sponsor collaboration brief",
    description: "A practical framework for presenting an organisation and proposing a TOMI collaboration.",
    sections: [
      { heading: "Present the organisation", text: "Provide your legal business name, official website and a public registration reference. Explain your activities and target markets using verifiable statements. Do not submit passwords, banking credentials or personal identity-document numbers through a public reference field." },
      { heading: "Community attestations and review", text: "Ten distinct verified members may describe their genuine knowledge of the business. They may withdraw their statements. These statements support, but do not replace, an independent review of official registration evidence. A reviewed business label describes TOMI's review; it is not a government licence or a guarantee of legality." },
      { heading: "Propose the collaboration", text: "Describe the programme, proposed contribution, deliverables, timing and points of contact. Separate editorial coverage, sponsorship, exhibition, speaker participation and humanitarian donations. Event places, red-carpet access and institutional status require a separate confirmed arrangement." },
      { heading: "Agree before announcing", text: "Obtain written approval for names, logos, deliverables, costs, dates and public claims. Do not announce investment returns, broadcaster acquisitions, government endorsement or an ambassador's acceptance without documentation." },
    ],
  },
];
function positive(value: unknown) {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new NetworkError(400, "Choose a valid member or record.");
  return Number(value);
}
function clean(value: string | undefined, min: number, max: number) {
  const result = (value ?? "").trim();
  if (result.length < min || result.length > max) throw new NetworkError(400, `Enter between ${min} and ${max} characters.`);
  return result;
}
function requestOrigin(req: Request) {
  const value = req.get("origin");
  try {
    const parsed = new URL(value ?? "");
    if (parsed.host !== getClerkProxyHost(req)) throw new Error();
    return parsed.origin;
  } catch { throw new NetworkError(403, "Use this website to manage membership."); }
}
async function businessDto(memberId: number, viewerId: number, founder: boolean) {
  const [row] = await db.select().from(businesses).where(eq(businesses.memberId, memberId));
  if (!row) return null;
  const counts = await db.select({ id: attestations.attesterId, statementId: attestations.id, name: members.fullName, statement: attestations.statement }).from(attestations)
    .innerJoin(profiles, eq(profiles.memberId, attestations.attesterId))
    .innerJoin(members, eq(members.id, attestations.attesterId))
    .where(and(eq(attestations.ownerId, memberId), eq(profiles.enabled, true), eq(profiles.suspended, false),
      sql`not exists (select 1 from ${blocks} where (${blocks.blockerId} = ${memberId} and ${blocks.blockedId} = ${attestations.attesterId}) or (${blocks.blockedId} = ${memberId} and ${blocks.blockerId} = ${attestations.attesterId}))`));
  return {
    memberId, name: row.name, website: row.website, attestationCount: counts.length,
    hasAttested: counts.some(a => a.id === viewerId),
    attestations: counts.slice(0, 50).map(a => ({ id: a.statementId, memberId: a.id, name: a.name, statement: a.statement })),
    status: row.status === "approved" && counts.length < 10 ? "review_required" : row.status,
    decisionNote: row.decisionNote,
    ...(viewerId === memberId || founder ? { registrationReference: row.registrationReference } : {}),
  };
}
router.use("/professional", networkAuth);
router.get("/professional/state", async (_req, res) => {
  const who = actor(res, false);
  await refreshMonthly(who.member.id);
  const mode = await monthlyMode();
  const ownIntroductions = await db.select({
    id: introductions.id, targetSlug: introductions.targetSlug, message: introductions.message,
    status: introductions.status, createdAt: introductions.createdAt, memberName: members.fullName,
  }).from(introductions).innerJoin(members, eq(members.id, introductions.memberId))
    .where(who.founder ? undefined : eq(introductions.memberId, who.member.id)).orderBy(desc(introductions.id)).limit(200);
  const reviewRows = who.founder ? await db.select({ id: businesses.memberId }).from(businesses).limit(200) : [];
  const reviews = (await Promise.all(reviewRows.map(row => businessDto(row.id, who.member.id, true)))).filter(Boolean);
  res.json({
    available: mode.available, testMode: mode.testMode, plans: MONTHLY_PLANS,
    membership: await monthlyMembership(who.member.id),
    business: await businessDto(who.member.id, who.member.id, who.founder), reviews,
    introductions: ownIntroductions.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })),
    resources: RESOURCES.map(({ slug, title, description }) => ({ slug, title, description })),
  });
});
router.get("/professional/business/:memberId", async (req, res) => {
  const who = actor(res, false), memberId = positive(Number(req.params.memberId));
  if (!who.founder) await visibleMember(memberId, who.member.id);
  const business = await businessDto(memberId, who.member.id, who.founder);
  if (!business) throw new NetworkError(404, "This member has not submitted a business review.");
  res.json(business);
});
router.get("/professional/resources/:slug", async (req, res) => {
  const who = actor(res, false);
  if (!who.founder) await requireMonthly(who.member.id);
  const resource = RESOURCES.find(r => r.slug === req.params.slug);
  if (!resource) throw new NetworkError(404, "Resource not found.");
  res.set("Cache-Control", "private,no-store").json({ title: resource.title, sections: resource.sections });
});
router.post("/professional/actions", networkWrite, async (req, res) => {
  const parsed = ProfessionalActionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid professional-services action.");
  const input = parsed.data, who = actor(res, false), self = who.member.id;
  switch (input.action) {
    case "checkout":
      if (input.accepted !== true) throw new NetworkError(400, "Accept the monthly recurring payment terms.");
      return void res.json({ url: await monthlyCheckout(who, input.tier ?? "", requestOrigin(req)) });
    case "cancel":
      if (input.accepted !== true) throw new NetworkError(400, "Confirm cancellation of renewal.");
      await refreshMonthly(self, true); await cancelMonthly(self); break;
    case "portal": {
      const [profile] = await db.select().from(profiles).where(eq(profiles.memberId, self));
      if (!profile?.stripeCustomerId) throw new NetworkError(404, "No billing account was found.");
      try {
        const session = await (await getUncachableStripeClient()).billingPortal.sessions.create({
          customer: profile.stripeCustomerId, return_url: `${requestOrigin(req)}/member/membership`,
        });
        return void res.json({ url: session.url });
      } catch { throw new NetworkError(503, "The provider billing portal is not configured. You can cancel renewal directly on this membership page."); }
    }
    case "business.submit": {
      if (!who.founder) await requireMonthly(self, true);
      if (input.accepted !== true) throw new NetworkError(400, "Confirm that the business details are truthful.");
      const name = clean(input.name, 2, 160), registrationReference = clean(input.registrationReference, 5, 300);
      let website: string;
      try {
        const parsedUrl = new URL(input.website ?? "");
        if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) throw new Error();
        website = parsedUrl.href;
      } catch { throw new NetworkError(400, "Enter an official HTTPS business website."); }
      await db.transaction(async tx => {
        // Statements refer to a specific business identity. An amended dossier must earn fresh attestations.
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"business:" + self}))`);
        const [old] = await tx.select().from(businesses).where(eq(businesses.memberId, self));
        if (old && (old.name !== name || old.website !== website || old.registrationReference !== registrationReference)) {
          await tx.delete(attestations).where(eq(attestations.ownerId, self));
        }
        await tx.insert(businesses).values({ memberId: self, name, website, registrationReference })
          .onConflictDoUpdate({ target: businesses.memberId, set: { name, website, registrationReference, status: "pending", decisionNote: "", submittedAt: new Date() } });
      });
      break;
    }
    case "business.attest":
    case "business.withdraw": {
      const memberId = positive(input.memberId);
      if (memberId === self) throw new NetworkError(400, "You cannot attest to your own business.");
      const [business] = await db.select().from(businesses).where(eq(businesses.memberId, memberId));
      if (!business || await isBlocked(self, memberId)) throw new NetworkError(404, "This business is unavailable.");
      if (input.action === "business.withdraw") {
        await db.delete(attestations).where(and(eq(attestations.ownerId, memberId), eq(attestations.attesterId, self)));
      } else {
        if (input.accepted !== true) throw new NetworkError(400, "Confirm your genuine knowledge of this business.");
        const statement = clean(input.text, 20, 2000);
        await db.insert(attestations).values({ ownerId: memberId, attesterId: self, statement }).onConflictDoNothing();
      }
      break;
    }
    case "business.review": {
      requireFounder(res);
      const memberId = positive(input.memberId);
      if (!["approved", "rejected", "pending"].includes(input.status ?? "")) throw new NetworkError(400, "Choose a valid review decision.");
      const business = await businessDto(memberId, self, true);
      if (!business) throw new NetworkError(404, "Business not found.");
      if (input.status === "approved" && business.attestationCount < 10) throw new NetworkError(409, "Ten distinct qualifying community attestations are required before approval.");
      const note = clean(input.text, 10, 2000);
      await db.update(businesses).set({ status: input.status!, decisionNote: note }).where(eq(businesses.memberId, memberId));
      break;
    }
    case "introduction.status":
      requireFounder(res);
      if (!["received", "reviewing", "introduced", "closed"].includes(input.status ?? "")) throw new NetworkError(400, "Choose a valid introduction status.");
      if (!(await db.update(introductions).set({ status: input.status! }).where(eq(introductions.id, positive(input.id))).returning()).length) throw new NetworkError(404, "Request not found.");
      break;
  }
  res.json({});
});
router.post("/professional/introductions", networkWrite, async (req, res) => {
  const who = actor(res, false);
  if (!who.founder) await requireMonthly(who.member.id);
  const parsed = CreateProfessionalIntroductionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Describe your collaboration in 20–2,000 characters.");
  const input = parsed.data;
  if (!AMBASSADOR_SLUGS.includes(input.targetSlug)) throw new NetworkError(400, "Choose an ambassador profile from the official catalogue.");
  const message = clean(input.message, 20, 2000);
  const [recent] = await db.select({ id: introductions.id }).from(introductions).where(and(
    eq(introductions.memberId, who.member.id), eq(introductions.targetSlug, input.targetSlug),
    sql`${introductions.createdAt} > now() - interval '1 day'`,
  ));
  if (recent) throw new NetworkError(409, "A recent request for this profile is already recorded. See its status in Membership.");
  const [row] = await db.insert(introductions).values({ memberId: who.member.id, targetSlug: input.targetSlug, message }).returning({ id: introductions.id });
  res.status(201).json(row);
});
export default router;
