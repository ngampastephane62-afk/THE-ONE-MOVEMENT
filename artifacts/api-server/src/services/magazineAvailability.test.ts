import { test } from "node:test";
import assert from "node:assert/strict";
import { readMagazineAvailability } from "./magazineAvailability";

test("magazine availability checks capability without opening checkout", async () => {
  for (const [ready, live, charges, cards, expected] of [
    [false, true, true, "active", false],
    [true, false, true, "active", false],
    [true, true, false, "active", false],
    [true, true, true, "inactive", false],
    [true, true, true, undefined, false],
    [true, true, undefined, "active", false],
    [true, true, true, "active", true],
  ] as const) {
    let clients = 0, accounts = 0;
    const result = await readMagazineAvailability(ready, async () => {
      clients++;
      return {
        balance: { retrieve: async () => ({ livemode: live }) },
        accounts: { retrieve: async (id) => {
          assert.equal(id, null);
          accounts++;
          return { charges_enabled: charges, capabilities: { card_payments: cards } };
        } },
      };
    });
    assert.equal(result.available, expected);
    assert.equal(clients, ready ? 1 : 0);
    assert.equal(accounts, ready && live ? 1 : 0);
    assert.equal(result.testMode, ready && !live);
  }
});

test("client, balance and account errors all keep payment closed", async () => {
  for (const failure of ["client", "balance", "account"]) {
    const result = await readMagazineAvailability(true, async () => {
      if (failure === "client") throw new Error("unavailable");
      return {
        balance: { retrieve: async () => {
          if (failure === "balance") throw new Error("unavailable");
          return { livemode: true };
        } },
        accounts: { retrieve: async () => { throw new Error("unavailable"); } },
      };
    });
    assert.equal(result.available, false);
    assert.match(result.reason, /could not be checked/);
  }
});
