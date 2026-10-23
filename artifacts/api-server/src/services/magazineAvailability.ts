type CapabilityReader = {
  balance: { retrieve(): Promise<{ livemode: boolean }> };
  accounts: { retrieve(id: null): Promise<{
    charges_enabled?: boolean;
    capabilities?: { card_payments?: string };
  }> };
};

// Read-only and fail-closed: neither mode nor a successful connection alone
// proves that this account may accept card payments.
export async function readMagazineAvailability(
  ready: boolean,
  getClient: () => Promise<CapabilityReader>,
) {
  let available = false, testMode = false;
  let reason = "Magazine payments are not ready. No money has been collected.";
  if (ready) {
    try {
      const stripe = await getClient();
      const balance = await stripe.balance.retrieve();
      testMode = !balance.livemode;
      if (testMode) {
        reason = "The connected payment account is in test mode. Magazine sales are not open and no real payment can be taken.";
      } else {
        const account = await stripe.accounts.retrieve(null);
        available = account.charges_enabled === true &&
          account.capabilities?.card_payments === "active";
        reason = available
          ? "One inside printed page costs USD200. Editorial approval and publication conditions are required before payment."
          : "Magazine payments are unavailable: the connected account is not enabled to accept card payments. No checkout has been opened.";
      }
    } catch {
      reason = "Payment availability could not be checked. Please retry later.";
    }
  }
  return { available, testMode, reason };
}
