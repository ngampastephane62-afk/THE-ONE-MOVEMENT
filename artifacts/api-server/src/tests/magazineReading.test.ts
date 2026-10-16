/** Development-only integration check; removes only its own randomly identified test sessions. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { db, magazineReadingEvents } from "@workspace/db";
import { GetMagazineStatisticsResponse } from "@workspace/api-zod";

async function main() {
  assert(process.argv.includes("--development"), "Pass --development to verify the development API.");
  assert(process.env.REPLIT_DEV_DOMAIN, "Development preview domain is unavailable.");
  const base = `https://${process.env.REPLIT_DEV_DOMAIN}/api/magazine`;
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  const hashes = ids.map(id => createHash("sha256").update(id).digest("hex"));
  const send = (event: string, extra: Record<string, unknown> = {}, userAgent = "Mozilla/5.0 TOMI development verification") =>
    fetch(`${base}/reading-events`, {
      method: "POST", headers: { "Content-Type": "application/json", "User-Agent": userAgent },
      body: JSON.stringify({ editionId: "tropik-editorial-2026", sessionId: ids[0], event, ...extra }),
    });
  try {
    const beforeResponse = await fetch(`${base}/statistics`);
    assert.equal(beforeResponse.status, 200);
    const before = GetMagazineStatisticsResponse.parse(await beforeResponse.json());
    const at = Date.now();
    const opens = await Promise.all([send("open"), send("open"), send("open")]);
    assert(opens.every(r => r.status === 200), "Concurrent duplicate opens must succeed idempotently.");
    for (const page of [0, 0, 1]) assert.equal((await send("page", { page })).status, 200);
    assert.equal((await send("engaged")).status, 400, "Engagement must not be counted early.");
    for (const [event, extra] of [
      ["page", {}], ["page", { page: 13 }], ["open", { page: 0 }],
      ["open", { unknown: true }], ["open", { editionId: "invented-issue" }],
      ["page", { sessionId: ids[1], page: 0 }],
    ] as const) assert.equal((await send(event, extra)).status, 400);
    const bot = await send("open", { sessionId: ids[2] }, "HeadlessChrome");
    assert.equal(bot.status, 200);
    assert.deepEqual(await bot.json(), { recorded: false });
    const own = await db.select().from(magazineReadingEvents).where(inArray(magazineReadingEvents.sessionHash, hashes));
    assert.equal(own.length, 3, "Exactly one open and two pages; no bot or invalid events.");
    const duringResponse = await fetch(`${base}/statistics`);
    assert.equal(duringResponse.status, 200);
    const during = GetMagazineStatisticsResponse.parse(await duringResponse.json());
    assert(during.opens >= before.opens + 1);
    assert(during.pagesViewed >= before.pagesViewed + 2);
    assert(during.startedAt && Number.isFinite(Date.parse(during.startedAt)));
    console.log("Duplicates, concurrent requests, validation, bot exclusion and aggregate statistics passed.");
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 31_000 - (Date.now() - at))));
    assert.equal((await send("engaged")).status, 200);
    assert.equal((await send("engaged")).status, 200);
    const final = await db.select().from(magazineReadingEvents).where(inArray(magazineReadingEvents.sessionHash, hashes));
    assert.equal(final.length, 4, "An engaged session is counted once.");
    console.log("Thirty-second gate and idempotent engagement passed.");
  } finally {
    await db.delete(magazineReadingEvents).where(inArray(magazineReadingEvents.sessionHash, hashes));
    console.log("Removed only this run's test events; real reader activity is unchanged.");
  }
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
