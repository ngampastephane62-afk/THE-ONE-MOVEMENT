// Exercise persisted admin review handlers without changing any account's privileges.
import assert from "node:assert/strict";
import router from "../../artifacts/api-server/src/routes/mediaRequests";
import { db, institutionalInquiriesTable as inquiries } from "../../lib/db/src/index";
import { eq } from "drizzle-orm";

async function main() {
  const routes = (router as any).stack.filter((layer: any) => layer.route).map((layer: any) => layer.route);
  const get = routes.find((r: any) => r.path === "/media-requests" && r.methods.get).stack.at(-1).handle;
  const patch = routes.find((r: any) => r.path === "/media-requests/:id" && r.methods.patch).stack.at(-1).handle;
  const response = (founder: boolean) => ({
    locals: { actor: { founder, member: { id: 1 } } },
    result: undefined as any,
    set() { return this; },
    json(value: unknown) { this.result = value; return this; },
  });
  await assert.rejects(() => get({}, response(false)), (e: any) => e.status === 403);
  await assert.rejects(() => patch({ params: { id: "1" }, body: { status: "approved" } }, response(false)), (e: any) => e.status === 403);
  const [fixture] = await db.insert(inquiries).values({
    organizationName: "TEST HANDLER QA DELETE", organizationType: "media-organization", country: "Test",
    contactName: "Synthetic QA", contactRole: "Test", emailNormalized: "media-handler-qa@example.com",
    message: JSON.stringify({ type: "TROPIK_MEDIA_REQUEST", outletId: "outlet-002", format: "CAMPAIGN", brief: "Synthetic handler persistence verification." }),
    consentAccepted: true, consentTextVersion: "tropik-media-request-v1", status: "new",
  }).returning();
  try {
    const inbox = response(true);
    await get({}, inbox);
    assert.equal(inbox.result.find((r: any) => r.id === fixture!.id)?.outletName, "BBC");
    for (const status of ["in_progress", "approved", "declined", "closed", "new"]) {
      const res = response(true);
      await patch({ params: { id: String(fixture!.id) }, body: { status } }, res);
      assert.equal(res.result.status, status);
      const [stored] = await db.select().from(inquiries).where(eq(inquiries.id, fixture!.id));
      assert.equal(stored?.status, status);
    }
    await assert.rejects(() => patch({ params: { id: String(fixture!.id) }, body: { status: "paid" } }, response(true)), (e: any) => e.status === 400);
    console.log("PASS: non-founder handler guards; founder inbox mapping; all five persisted review states; invalid status rejected.");
  } finally {
    await db.delete(inquiries).where(eq(inquiries.id, fixture!.id));
  }
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
