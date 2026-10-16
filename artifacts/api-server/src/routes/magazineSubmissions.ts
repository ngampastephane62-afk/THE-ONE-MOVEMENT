import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, magazineOrders as orders, magazineSubmissions as submissions, type MagazineOrderRow } from "@workspace/db";
import { CreateMagazineSubmissionBody, UpdateMagazineSubmissionBody, ReviewMagazineSubmissionBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { magazineOrderView, FEATURE_PRICE } from "../services/magazinePayments";

const router = Router();
router.use("/magazine/submissions", networkAuth);
router.use("/magazine/admin/submissions", networkAuth);
const writes = createRateLimiter({ maxRequests: 15, windowMs: 60_000 });
const editable = new Set(["submitted", "approved", "declined"]);
type Proposal = { submission: typeof submissions.$inferSelect; order: MagazineOrderRow };
const selection = { submission: submissions, order: orders };
function id(value: unknown) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new NetworkError(400, "Invalid article proposal.");
  return n;
}
function view(row: Proposal) {
  return {
    id: row.submission.id, fullName: row.order.fullName ?? "",
    title: row.submission.title, body: row.submission.body, photoUrl: row.submission.photoUrl,
    reviewNote: row.submission.reviewNote, updatedAt: row.submission.updatedAt.toISOString(),
    order: magazineOrderView(row.order),
  };
}
async function own(proposalId: number, memberId?: number): Promise<Proposal> {
  const [row] = await db.select(selection).from(submissions).innerJoin(orders, eq(orders.id, submissions.orderId))
    .where(and(eq(submissions.id, proposalId), memberId === undefined ? undefined : eq(orders.memberId, memberId))).limit(1);
  if (!row) throw new NetworkError(404, "Article proposal not found.");
  return row;
}
function content(input: { fullName: string; title: string; body: string; photoUrl?: string; accepted: boolean }) {
  if (!input.accepted || input.fullName.trim().length < 2 || input.title.trim().length < 5 || input.body.trim().length < 100) {
    throw new NetworkError(400, "Complete your name, headline and article, and accept the publication conditions.");
  }
  const photoUrl = input.photoUrl?.trim() ?? "";
  if (photoUrl) {
    let url: URL;
    try { url = new URL(photoUrl); } catch { throw new NetworkError(400, "Use an HTTPS link for your photo or press folder."); }
    if (url.protocol !== "https:" || url.username || url.password) throw new NetworkError(400, "Use an HTTPS link without credentials.");
  }
  return { fullName: input.fullName.trim(), title: input.title.trim(), body: input.body.trim(), photoUrl };
}
router.get("/magazine/submissions", async (_req, res) => {
  const who = actor(res, false);
  const rows = await db.select(selection).from(submissions).innerJoin(orders, eq(orders.id, submissions.orderId))
    .where(eq(orders.memberId, who.member.id)).orderBy(desc(orders.createdAt)).limit(100);
  res.set("Cache-Control", "private,no-store").json({ submissions: rows.map(view), founder: who.founder });
});
router.post("/magazine/submissions", networkWrite, writes, async (req, res) => {
  const parsed = CreateMagazineSubmissionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Check the article details.");
  const input = parsed.data, data = content(input), who = actor(res, false);
  const requestId = `feature:${who.member.id}:${input.requestId}`;
  const proposalId = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${requestId}))`);
    const [old] = await tx.select(selection).from(submissions).innerJoin(orders, eq(orders.id, submissions.orderId))
      .where(and(eq(orders.requestId, requestId), eq(orders.memberId, who.member.id)));
    if (old) {
      if (old.order.fullName !== data.fullName || old.submission.title !== data.title ||
          old.submission.body !== data.body || old.submission.photoUrl !== data.photoUrl) {
        throw new NetworkError(409, "The request changed. Start a new article proposal.");
      }
      return old.submission.id;
    }
    const [order] = await tx.insert(orders).values({
      memberId: who.member.id, format: "feature", status: "submitted", itemAmount: FEATURE_PRICE,
      shippingAmount: 0, currency: "usd", email: who.email, fullName: data.fullName, requestId,
      consentVersion: "tropik-inside-page-200-usd-v1",
    }).returning();
    const [proposal] = await tx.insert(submissions).values({
      orderId: order!.id, title: data.title, body: data.body, photoUrl: data.photoUrl,
    }).returning();
    return proposal!.id;
  });
  res.status(201).json(view(await own(proposalId, who.member.id)));
});
router.patch("/magazine/submissions/:id", networkWrite, writes, async (req, res) => {
  const parsed = UpdateMagazineSubmissionBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Check the article details.");
  const input = parsed.data, data = content(input), who = actor(res, false);
  const initial = await own(id(req.params.id), who.member.id);
  await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"magazine:" + initial.order.id}))`);
    const [order] = await tx.select().from(orders).where(eq(orders.id, initial.order.id));
    const [current] = await tx.select().from(submissions).where(eq(submissions.id, initial.submission.id));
    if (!order || !current || !editable.has(order.status) || order.stripeSessionId) throw new NetworkError(409, "This proposal can no longer be edited.");
    if (current.updatedAt.getTime() !== Date.parse(input.expectedUpdatedAt ?? "")) throw new NetworkError(409, "This proposal changed. Refresh before editing.");
    const now = new Date();
    await tx.update(submissions).set({ title: data.title, body: data.body, photoUrl: data.photoUrl, reviewNote: "", updatedAt: now }).where(eq(submissions.id, current.id));
    await tx.update(orders).set({ fullName: data.fullName, status: "submitted", updatedAt: now }).where(eq(orders.id, order.id));
  });
  res.json(view(await own(initial.submission.id, who.member.id)));
});
router.delete("/magazine/submissions/:id", networkWrite, writes, async (req, res) => {
  const initial = await own(id(req.params.id), actor(res, false).member.id);
  await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"magazine:" + initial.order.id}))`);
    const [order] = await tx.select().from(orders).where(eq(orders.id, initial.order.id));
    if (!order || !editable.has(order.status) || order.stripeSessionId) throw new NetworkError(409, "A checkout or paid proposal cannot be withdrawn here.");
    await tx.update(orders).set({ status: "withdrawn", updatedAt: new Date() }).where(eq(orders.id, order.id));
    await tx.update(submissions).set({ updatedAt: new Date() }).where(eq(submissions.id, initial.submission.id));
  });
  res.sendStatus(204);
});
router.get("/magazine/admin/submissions", async (_req, res) => {
  requireFounder(res);
  const rows = await db.select(selection).from(submissions).innerJoin(orders, eq(orders.id, submissions.orderId))
    .orderBy(desc(orders.createdAt)).limit(200);
  res.set("Cache-Control", "private,no-store").json(rows.map(view));
});
router.patch("/magazine/admin/submissions/:id", networkWrite, writes, async (req, res) => {
  requireFounder(res);
  const parsed = ReviewMagazineSubmissionBody.strict().safeParse(req.body);
  if (!parsed.success || parsed.data.note.trim().length < 5) throw new NetworkError(400, "Include the edition and publication conditions, or explain the decision.");
  const input = parsed.data, initial = await own(id(req.params.id));
  await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"magazine:" + initial.order.id}))`);
    const [order] = await tx.select().from(orders).where(eq(orders.id, initial.order.id));
    const [current] = await tx.select().from(submissions).where(eq(submissions.id, initial.submission.id));
    if (!order || !current || !editable.has(order.status) || order.stripeSessionId) throw new NetworkError(409, "This proposal is no longer awaiting review.");
    if (current.updatedAt.getTime() !== Date.parse(input.expectedUpdatedAt)) throw new NetworkError(409, "The author updated this proposal. Refresh and review the latest version.");
    const now = new Date();
    await tx.update(submissions).set({ reviewNote: input.note.trim(), updatedAt: now }).where(eq(submissions.id, current.id));
    await tx.update(orders).set({ status: input.decision, updatedAt: now }).where(eq(orders.id, order.id));
  });
  res.json(view(await own(initial.submission.id)));
});
export default router;
