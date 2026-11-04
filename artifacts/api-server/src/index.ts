import app from "./app";
import { logger } from "./lib/logger";
import { initializeStripe } from "./services/networkPayments";
import { stripeStartupMode } from "./lib/previewStartup";
import { startVisitRetention } from "./services/siteVisits";
import { startFounderObserver } from "./services/founderReconciliation";

// Validate before opening a port or scheduling any payment initialization.
const paymentStartup = stripeStartupMode(process.env);

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startVisitRetention(() => logger.warn("Visit retention cleanup unavailable; retrying on the next scheduled pass."));
  startFounderObserver();
});

async function startPayments() {
  try {
    await initializeStripe();
    logger.info("Stripe synchronization ready");
  } catch {
    logger.error("Stripe synchronization unavailable; checkout disabled; retrying in one minute");
    setTimeout(() => void startPayments(), 60_000).unref();
  }
}
if (paymentStartup === "preview-skip") {
  logger.warn("Replit development preview: automatic Stripe initialization disabled explicitly; no payment bootstrap or retry scheduled.");
} else {
  if (process.env.TOMI_PREVIEW_SKIP_STRIPE_INIT) {
    logger.warn("Preview Stripe safeguard is not active; normal payment initialization retained.");
  }
  void startPayments();
}
