import { test, after } from "node:test";
import assert from "node:assert/strict";
import { pool, type MagazineOrderRow } from "@workspace/db";
import { magazineOrderView, magazineConfiguration } from "./magazinePayments";

function row(changes: Partial<MagazineOrderRow> = {}): MagazineOrderRow {
  return {
    id: 1, memberId: 1, format: "digital", status: "paid", itemAmount: 1000,
    shippingAmount: 0, currency: "usd", email: "reader@example.invalid",
    fullName: null, address: null, country: null, phone: null, requestId: "unit-only",
    stripeSessionId: null, paymentIntentId: null, liveMode: true, refundedAmount: 0,
    consentVersion: "test", quotedAt: null, paidAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...changes,
  };
}
after(async () => { await pool.end(); });

test("only a paid, real, unrefunded digital order receives PDF access", () => {
  assert.equal(magazineOrderView(row()).canDownload, true);
  for (const changes of [
    { status: "pending" }, { status: "checkout_pending" }, { status: "refunded" },
    { status: "disputed" }, { liveMode: false }, { refundedAmount: 1 }, { format: "print" as const },
  ]) assert.equal(magazineOrderView(row(changes)).canDownload, false, JSON.stringify(changes));
});
test("a print request has no payable total until delivery is quoted", () => {
  assert.equal(magazineOrderView(row({ format: "print", itemAmount: 2500, shippingAmount: null })).totalAmount, null);
  assert.equal(magazineOrderView(row({ format: "print", itemAmount: 2500, shippingAmount: 1000 })).totalAmount, 3500);
  assert.equal(magazineOrderView(row({ format: "print", itemAmount: 2500, shippingAmount: 3000 })).totalAmount, 5500);
  assert.equal(magazineOrderView(row()).totalAmount, 1000);
});
test("configuration preserves owner prices and cannot open before Stripe is ready", async () => {
  const config = await magazineConfiguration();
  assert.deepEqual([config.digitalUsd, config.printUsd, config.shippingMinUsd, config.shippingMaxUsd, config.pageCount], [10, 25, 10, 30, 10]);
  assert.equal(config.available, false);
});
