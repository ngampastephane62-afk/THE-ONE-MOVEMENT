import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, ecosystemMembersTable as members, networkProfiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";

export class NetworkError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type NetworkActor = {
  member: typeof members.$inferSelect | null;
  clerkId: string;
  email: string;
  accountCreatedAt: number;
  founder: boolean;
};
const identities = new Map<string, { email: string; fullName: string; verified: boolean; restricted: boolean; accountCreatedAt: number; expires: number }>();
export function invalidateNetworkIdentity(clerkId: string) { identities.delete(clerkId); }
export async function networkAuth(req: Request, res: Response, next: NextFunction) {
  res.set("Cache-Control", "no-store");
  const clerkId = getAuth(req).userId;
  if (!clerkId) return void res.status(401).json({ error: "Sign in to access the member network." });
  let identity = identities.get(clerkId);
  if (!identity || identity.expires < Date.now()) {
    try {
      const user = await clerkClient.users.getUser(clerkId);
      const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
      identity = {
        email: primary?.emailAddress.toLowerCase() ?? "",
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        verified: primary?.verification?.status === "verified",
        restricted: user.banned || user.locked,
        accountCreatedAt: user.createdAt,
        expires: Date.now() + 60_000,
      };
      if (identities.size > 2000) identities.clear();
      identities.set(clerkId, identity);
    } catch {
      return void res.status(503).json({ error: "Your verified identity could not be checked. Please try again." });
    }
  }
  if (!identity.verified) return void res.status(403).json({ error: "Verify your primary email before joining the network." });
  if (identity.restricted) return void res.status(403).json({ error: "This account is restricted by the authentication service." });
  const founder = !!process.env.TOMI_FOUNDER_EMAIL &&
    identity.email === process.env.TOMI_FOUNDER_EMAIL.trim().toLowerCase();
  let [member] = await db.select().from(members).where(eq(members.clerkId, clerkId)).limit(1);
  if (!member) {
    const name = identity.fullName.trim().slice(0, 100);
    [member] = await db.insert(members).values({
      clerkId, fullName: name.length >= 2 ? name : founder ? "Founder" : "Member",
      profession: founder ? "Founder & CEO" : "",
      organization: founder ? "The One Movement International" : "",
      sectors: founder ? ["business", "humanitarian-action"] : [],
    }).onConflictDoNothing().returning();
    if (!member) [member] = await db.select().from(members).where(eq(members.clerkId, clerkId)).limit(1);
  }
  if (member) {
    await db.insert(networkProfiles).values({ memberId: member.id, founder, enabled: false })
      .onConflictDoUpdate({ target: networkProfiles.memberId, set: { founder } });
    const [profile] = await db.select().from(networkProfiles).where(eq(networkProfiles.memberId, member.id));
    if (profile?.suspended && !founder) return void res.status(403).json({ error: "This network account is suspended. Contact TOMI through the inquiry pathway." });
  }
  res.locals.actor = { member: member ?? null, clerkId, email: identity.email, accountCreatedAt: identity.accountCreatedAt, founder } satisfies NetworkActor;
  next();
}
export function actor(res: Response, enabled = true) {
  const value = res.locals.actor as NetworkActor;
  if (!value.member) throw new NetworkError(409, "Your member space could not be opened. Please try again.");
  if (enabled && !res.locals.networkEnabled) throw new NetworkError(409, "Join the member network before taking part.");
  return { ...value, member: value.member };
}
export async function networkEnabled(_req: Request, res: Response, next: NextFunction) {
  const value = res.locals.actor as NetworkActor;
  if (value.member) {
    const [profile] = await db.select().from(networkProfiles).where(eq(networkProfiles.memberId, value.member.id));
    res.locals.networkEnabled = !!profile?.enabled;
  }
  next();
}
const windows = new Map<string, { start: number; count: number }>();
export function networkWrite(req: Request, res: Response, next: NextFunction) {
  try {
    const origin = req.get("origin");
    if (!origin || new URL(origin).host !== getClerkProxyHost(req) || req.get("sec-fetch-site") === "cross-site") {
      return void res.status(403).json({ error: "Use this website to make network changes." });
    }
  } catch { return void res.status(403).json({ error: "Invalid request origin." }); }
  const now = Date.now();
  for (const [k, v] of windows) if (now - v.start > 60_000) windows.delete(k);
  const key = getAuth(req).userId!;
  const window = windows.get(key) ?? { start: now, count: 0 };
  window.count++;
  windows.set(key, window);
  if (window.count > 120) return void res.status(429).set("Retry-After", "60").json({ error: "Please wait a minute before trying again." });
  next();
}
export function requireFounder(res: Response) {
  if (!(res.locals.actor as NetworkActor).founder) throw new NetworkError(403, "Only the verified Founder can approve official status.");
}
