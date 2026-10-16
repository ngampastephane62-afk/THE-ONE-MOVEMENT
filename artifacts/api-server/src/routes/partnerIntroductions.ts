import { Router } from "express";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db, institutionalInquiriesTable as inquiries } from "@workspace/db";
import { PARTNER_INTRODUCTION_TARGETS, PARTNER_LEADERSHIP } from "@workspace/shared";
import { CreatePartnerIntroductionBody, UpdatePartnerIntroductionBody } from "@workspace/api-zod";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";

const router = Router();
const VERSION = "partner-introduction-v1";
const limiter = createRateLimiter();
type Stored = { partnerId: number; partnerName: string; leaderName: string | null; leaderRole: string | null; brief: string };
function dto(row: typeof inquiries.$inferSelect) {
  const data = JSON.parse(row.message) as Stored;
  return {
    id: row.id, partnerId: data.partnerId, partnerName: data.partnerName,
    leaderName: data.leaderName, leaderRole: data.leaderRole, message: data.brief,
    contactName: row.contactName, organizationName: row.organizationName, country: row.country,
    email: row.emailNormalized, status: row.status, createdAt: row.createdAt.toISOString(),
  };
}

// The only destination is this application's private Founder inbox. No mail is forwarded.
router.post("/partner-introductions", limiter, async (req, res) => {
  const parsed = CreatePartnerIntroductionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Check your contact details and write a brief of 10–800 characters.");
  const input = parsed.data;
  const target = PARTNER_INTRODUCTION_TARGETS.find(p => p.id === input.partnerId);
  if (!target) throw new NetworkError(404, "Partner not found.");
  if (input.website?.trim()) throw new NetworkError(400, "This request could not be submitted.");
  if (!input.consentAccepted) throw new NetworkError(400, "Consent is required.");
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !input.contactName.trim() ||
      !input.organizationName.trim() || !input.country.trim() || input.message.trim().length < 10) {
    throw new NetworkError(400, "Enter valid contact details and a brief of at least 10 characters.");
  }
  const leader = PARTNER_LEADERSHIP[target.id];
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const row = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`partner-introduction:${email}`}))`);
    const [total] = await tx.select({ value: count() }).from(inquiries)
      .where(and(eq(inquiries.emailNormalized, email), eq(inquiries.consentTextVersion, VERSION), gte(inquiries.createdAt, today)));
    if ((total?.value ?? 0) >= 3) throw new NetworkError(429, "Please wait before sending another introduction request.");
    const [created] = await tx.insert(inquiries).values({
      organizationName: input.organizationName.trim(), organizationType: "partner",
      country: input.country.trim(), contactName: input.contactName.trim(), contactRole: "Introduction requester",
      emailNormalized: email, consentAccepted: true, consentTextVersion: VERSION, status: "new",
      message: JSON.stringify({
        partnerId: target.id, partnerName: target.name, leaderName: leader?.name ?? null,
        leaderRole: leader?.role ?? null, brief: input.message.trim(),
      } satisfies Stored),
    }).returning();
    return created;
  });
  res.status(201).json({ id: row.id, status: "new", message: "Your request has been received by The One Movement. It has not been sent to the partner." });
});
router.get("/partner-introductions", networkAuth, async (_req, res) => {
  requireFounder(res);
  const rows = await db.select().from(inquiries).where(eq(inquiries.consentTextVersion, VERSION)).orderBy(desc(inquiries.id));
  res.set("Cache-Control", "private, no-store").json(rows.map(dto));
});
router.patch("/partner-introductions/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const id = Number(req.params.id);
  const parsed = UpdatePartnerIntroductionBody.strict().safeParse(req.body);
  if (!Number.isSafeInteger(id) || id < 1 || !parsed.success) throw new NetworkError(400, "Choose a valid request and status.");
  const [row] = await db.update(inquiries).set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(inquiries.id, id), eq(inquiries.consentTextVersion, VERSION))).returning();
  if (!row) throw new NetworkError(404, "Request not found.");
  res.json(dto(row));
});
export default router;
