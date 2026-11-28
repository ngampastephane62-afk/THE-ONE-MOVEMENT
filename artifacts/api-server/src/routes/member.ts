import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, ecosystemMembersTable as members, networkProfiles, networkUploads } from "@workspace/db";
import { SaveMemberProfileBody, ToggleMemberSavedItemBody } from "@workspace/api-zod";
import { desc, eq, sql, and, or, isNull } from "drizzle-orm";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";
import { SOCIAL_PROFILES, normalizeSocialProfile, activeSectorIssue } from "@workspace/shared";
import { projectOwnerProfile, projectPublicProfile } from "../services/profileProjection";
import { invalidateMemberDashboard } from "../services/membershipDashboard";
import { requireVerifiedIdentity } from "../services/networkAuth";

const router = Router();
const savedIds = new Set([
  ...["diplomatic-gala", "summit", "fashion-week", "awards", "fashion-night", "investment-forum"].map((id) => `program:${id}`),
  ...["sdgs", "unesco-culture", "who-health", "ocha-humanitarian", "global-compact"].map((id) => `resource:${id}`),
]);

// Authenticated requests are always scoped to Clerk's validated session,
// never to a user ID, role or email supplied by the browser.
function memberAuth(req: Request, res: Response, next: NextFunction) {
  res.set("Cache-Control", "no-store");
  if (!getAuth(req).userId) {
    res.status(401).json({ error: "Sign in to access your member space." });
    return;
  }
  next();
}

const mutationWindows = new Map<string, { start: number; count: number }>();
function memberWrite(req: Request, res: Response, next: NextFunction) {
  const origin = req.get("origin");
  const host = getClerkProxyHost(req);
  try {
    if (!origin || !host || new URL(origin).host !== host || req.get("sec-fetch-site") === "cross-site") {
      res.status(403).json({ error: "Use the member space on this website to make changes." });
      return;
    }
  } catch {
    res.status(403).json({ error: "Invalid request origin." });
    return;
  }
  const now = Date.now();
  for (const [key, value] of mutationWindows) {
    if (now - value.start > 60_000) mutationWindows.delete(key);
  }
  const key = getAuth(req).userId!;
  const window = mutationWindows.get(key) ?? { start: now, count: 0 };
  window.count++;
  mutationWindows.set(key, window);
  if (window.count > 60) {
    res.status(429).set("Retry-After", "60").json({ error: "Please wait a minute before making more changes." });
    return;
  }
  next();
}

router.get("/ecosystem/members", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  const rows = await db.select({ member: members, avatarId: networkUploads.id, enabled: networkProfiles.enabled }).from(members)
    .leftJoin(networkProfiles, eq(members.id, networkProfiles.memberId))
    .leftJoin(networkUploads, and(
      eq(networkUploads.id, networkProfiles.avatarId),
      eq(networkUploads.ownerId, members.id),
      eq(networkUploads.ready, true),
      eq(members.publicMedia, true),
      eq(networkProfiles.enabled, true),
    ))
    .where(and(eq(members.isPublic, true), or(eq(networkProfiles.suspended, false), isNull(networkProfiles.memberId))))
    .orderBy(desc(members.updatedAt)).limit(100);
  res.json({ members: rows.map(row => ({
    ...projectPublicProfile(row.member),
    avatarUrl: row.avatarId ? `/api/community/media/${row.avatarId}` : null,
    enabled: row.enabled === true,
  })) });
});

router.get("/member/profile", memberAuth, async (req, res) => {
  const [row] = await db.select().from(members).where(eq(members.clerkId, getAuth(req).userId!)).limit(1);
  res.json({ profile: row ? projectOwnerProfile(row) : null });
});

router.put("/member/profile", memberAuth, memberWrite, requireVerifiedIdentity, async (req, res) => {
  const parsed = SaveMemberProfileBody.strict().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check your profile fields. Choose up to three active sectors and up to eight interests." });
    return;
  }
  const input = parsed.data;
  if (input.mainSector !== undefined || input.activeSectors !== undefined) {
    const [current] = await db.select({ mainSector: members.mainSector, activeSectors: members.activeSectors })
      .from(members).where(eq(members.clerkId, getAuth(req).userId!)).limit(1);
    const issue = activeSectorIssue(input, current);
    if (issue) { res.status(400).json({ error: issue }); return; }
  }
  for (const { field } of SOCIAL_PROFILES) {
    // Omission preserves existing links for older clients; an empty string clears one.
    if (input[field] === undefined) continue;
    try { input[field] = normalizeSocialProfile(field, input[field]!); }
    catch (error) {
      res.status(400).json({ error: (error as Error).message });
      return;
    }
  }
  const data = {
    ...input,
    fullName: input.fullName.trim(),
    profession: input.profession.trim(),
    organization: input.organization.trim(),
    country: input.country.trim(),
    bio: input.bio.trim(),
    offering: input.offering.trim(),
    lookingFor: input.lookingFor.trim(),
    website: input.website.trim(),
    sectors: [...new Set(input.sectors)],
    ...(input.cityRegion !== undefined ? { cityRegion: input.cityRegion?.trim() ?? null } : {}),
    ...(input.organizationType !== undefined ? { organizationType: input.organizationType?.trim() ?? null } : {}),
    ...(input.contactName !== undefined ? { contactName: input.contactName?.trim() ?? null } : {}),
    ...(input.otherProfessionalActivity !== undefined ? { otherProfessionalActivity: input.otherProfessionalActivity?.trim() ?? null } : {}),
  };
  if (data.fullName.length < 2) {
    res.status(400).json({ error: "Your name needs at least two characters." });
    return;
  }
  if (data.website) {
    try {
      const website = new URL(data.website);
      if (!["https:", "http:"].includes(website.protocol) || website.username || website.password) throw new Error("Invalid website");
      data.website = website.toString();
    } catch {
      res.status(400).json({ error: "Use a complete http:// or https:// website address, or leave it empty." });
      return;
    }
  }
  const [row] = await db.insert(members)
    .values({ ...data, clerkId: getAuth(req).userId! })
    .onConflictDoUpdate({
      target: members.clerkId,
      set: { ...data, updatedAt: new Date() },
    }).returning();
  invalidateMemberDashboard();
  res.json({ profile: projectOwnerProfile(row!) });
});

router.post("/member/saved", memberAuth, memberWrite, requireVerifiedIdentity, async (req, res) => {
  const parsed = ToggleMemberSavedItemBody.strict().safeParse(req.body);
  if (!parsed.success || !savedIds.has(parsed.data.itemId)) {
    res.status(400).json({ error: "Choose an existing programme or official resource." });
    return;
  }
  const { itemId, saved } = parsed.data;
  const [row] = await db.update(members).set({
    savedItems: saved
      ? sql`CASE WHEN ${members.savedItems} @> ARRAY[${itemId}]::text[] THEN ${members.savedItems} ELSE array_append(${members.savedItems}, ${itemId}) END`
      : sql`array_remove(${members.savedItems}, ${itemId})`,
    updatedAt: new Date(),
  }).where(eq(members.clerkId, getAuth(req).userId!)).returning();
  if (!row) {
    res.status(409).json({ error: "Complete your member profile before saving items." });
    return;
  }
  res.json({ profile: projectOwnerProfile(row) });
});

export default router;
