import app from "./app";
import { logger } from "./lib/logger";
import { initializeStripe } from "./services/networkPayments";

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
void startPayments();
