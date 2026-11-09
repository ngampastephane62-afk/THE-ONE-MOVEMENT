import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const requireDb = createRequire(new URL("../../../lib/db/package.json", import.meta.url));
const { Pool } = requireDb("pg");

test("PostgreSQL reservations serialize concurrent admissions and enforce financial constraints", async () => {
  assert.notEqual(process.env.REPLIT_DEPLOYMENT, "1", "Never run fixture writes in production");
  assert.ok(process.env.DATABASE_URL, "Development database must be configured");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 6 });
  const domain = `tomi-test-${crypto.randomUUID()}`, month = "1999-12";
  let created = false;
  try {
    await pool.query(`INSERT INTO connect_call_budgets
      (month_utc,provider_domain_id,admission_limit_micro_usd,paused) VALUES ($1,$2,320000,false)`, [month, domain]);
    created = true;
    const attempts = await Promise.all(Array.from({ length: 12 }, async () => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows: [b] } = await client.query(`SELECT reserved_micro_usd,committed_micro_usd,admission_limit_micro_usd
          FROM connect_call_budgets WHERE month_utc=$1 AND provider_domain_id=$2 FOR UPDATE`, [month, domain]);
        const admitted = b.reserved_micro_usd + b.committed_micro_usd + 160000 <= b.admission_limit_micro_usd;
        if (admitted) await client.query(`UPDATE connect_call_budgets SET reserved_micro_usd=reserved_micro_usd+160000
          WHERE month_utc=$1 AND provider_domain_id=$2`, [month, domain]);
        await client.query("COMMIT");
        return admitted;
      } catch (e) { await client.query("ROLLBACK"); throw e; }
      finally { client.release(); }
    }));
    assert.equal(attempts.filter(Boolean).length, 2);
    const { rows: [result] } = await pool.query("SELECT reserved_micro_usd FROM connect_call_budgets WHERE month_utc=$1 AND provider_domain_id=$2", [month, domain]);
    assert.equal(result.reserved_micro_usd, 320000);
    await assert.rejects(pool.query("UPDATE connect_call_budgets SET reserved_micro_usd=320001 WHERE month_utc=$1 AND provider_domain_id=$2", [month, domain]), { code: "23514" });
    await assert.rejects(pool.query("UPDATE connect_call_budgets SET limit_micro_usd=20000001 WHERE month_utc=$1 AND provider_domain_id=$2", [month, domain]), { code: "23514" });
    await assert.rejects(pool.query("UPDATE connect_call_budgets SET reserved_micro_usd=-1 WHERE month_utc=$1 AND provider_domain_id=$2", [month, domain]), { code: "23514" });
  } finally {
    // Only this isolated, synthetic budget row; never touch a real ledger.
    if (created) await pool.query("DELETE FROM connect_call_budgets WHERE month_utc=$1 AND provider_domain_id=$2", [month, domain]);
    await pool.end();
  }
});
