import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, ecosystemMembersTable as members, networkProfiles } from "@workspace/db";
import { SaveMemberProfileBody, ToggleMemberSavedItemBody } from "@workspace/api-zod";
import { desc, eq, sql, and, or, isNull } from "drizzle-orm";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";

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

function publicProfile(row: typeof members.$inferSelect) {
  return {
    id: row.id,
    fullName: row.fullName,
    profession: row.profession,
    organization: row.organization,
    country: row.country,
    bio: row.bio,
    offering: row.offering,
    lookingFor: row.lookingFor,
    website: row.website,
    sectors: row.sectors,
    isPublic: row.isPublic,
  };
}

function privateProfile(row: typeof members.$inferSelect) {
  return { ...publicProfile(row), savedItems: row.savedItems };
}

router.get("/ecosystem/members", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  const rows = await db.select({ member: members }).from(members)
    .leftJoin(networkProfiles, eq(members.id, networkProfiles.memberId))
    .where(and(eq(members.isPublic, true), or(eq(networkProfiles.suspended, false), isNull(networkProfiles.memberId))))
    .orderBy(desc(members.updatedAt)).limit(100);
  res.json({ members: rows.map(row => publicProfile(row.member)) });
});

router.get("/member/profile", memberAuth, async (req, res) => {
  const [row] = await db.select().from(members).where(eq(members.clerkId, getAuth(req).userId!)).limit(1);
  res.json({ profile: row ? privateProfile(row) : null });
});

router.put("/member/profile", memberAuth, memberWrite, async (req, res) => {
  const parsed = SaveMemberProfileBody.strict().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check your profile fields and choose between one and eight sectors." });
    return;
  }
  const input = parsed.data;
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
  };
  if (data.fullName.length < 2 || data.profession.length < 2) {
    res.status(400).json({ error: "Your name and profession need at least two characters." });
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
  res.json({ profile: privateProfile(row!) });
});

router.post("/member/saved", memberAuth, memberWrite, async (req, res) => {
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
  res.json({ profile: privateProfile(row) });
});

export default router;
