import { Router } from "express";
import { db, memberProfileRemindersTable as reminders } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SendProfileReminderBody, RecordSiteVisitBody } from "@workspace/api-zod";
import { parseMembershipDashboardQuery } from "../lib/membershipDashboardQuery";
import { networkAuth, networkWrite, requireFounder, actor, NetworkError } from "../services/networkAuth";
import { memberAccountSnapshot, accountTotals, trafficSummary, reminderConfiguration, invalidateMemberDashboard } from "../services/membershipDashboard";
import { previewReminder, sendReminder, optOutSignature, safeEqual } from "../services/profileReminders";
import { recordVisit, pruneVisits } from "../services/siteVisits";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";

const router = Router();
router.get("/founder/membership-dashboard", networkAuth, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private, no-store");
  const parsed = parseMembershipDashboardQuery(req.query);
  if (!parsed.success) throw new NetworkError(400, "Filtres invalides.");
  const { search = "", status = "all", days = 30, page = 1 } = parsed.data;
  try {
    await pruneVisits();
    const [snapshot, traffic] = await Promise.all([memberAccountSnapshot(), trafficSummary(days)]);
    const q = search.trim().toLowerCase();
    const filtered = snapshot.accounts.filter(a =>
      (!q || `${a.name} ${a.email}`.toLowerCase().includes(q)) &&
      (status === "all" || (status === "active"
        ? a.profileStatus === "complete" && a.networkEnabled && !a.suspended : a.profileStatus === status)));
    const pages = Math.max(1, Math.ceil(filtered.length / 25));
    const currentPage = Math.min(page, pages);
    const config = reminderConfiguration();
    res.json({
      refreshedAt: snapshot.refreshedAt, environment: process.env.REPLIT_DEPLOYMENT === "1" ? "production" : "development",
      totals: accountTotals(snapshot.accounts), accounts: filtered.slice((currentPage - 1) * 25, currentPage * 25),
      page: currentPage, pages, filteredCount: filtered.length, traffic,
      emailSetup: { configured: config.configured, message: config.message },
    });
  } catch (error) {
    if (error instanceof NetworkError) throw error;
    throw new NetworkError(503, "Les comptes ou les statistiques ne peuvent pas être vérifiés. Aucun total de remplacement n’est affiché.");
  }
});
router.get("/founder/profile-reminders/:clerkId", networkAuth, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private, no-store");
  res.json(await previewReminder(String(req.params.clerkId)));
});
router.post("/founder/profile-reminders/:clerkId", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private, no-store");
  const parsed = SendProfileReminderBody.strict().safeParse(req.body);
  if (!parsed.success || parsed.data.confirmed !== true) throw new NetworkError(400, "Confirmez explicitement l’aperçu de cet email.");
  res.json(await sendReminder(String(req.params.clerkId), actor(res, false).clerkId, parsed.data.previewToken));
});

const windows = new Map<string, { start: number; count: number }>();
router.post("/site-visits", async (req, res) => {
  const parsed = RecordSiteVisitBody.strict().safeParse(req.body);
  if (!parsed.success || parsed.data.consent !== true) throw new NetworkError(400, "Visit measurement requires explicit agreement.");
  try {
    if (new URL(req.get("origin") ?? "").host !== getClerkProxyHost(req) || req.get("sec-fetch-site") === "cross-site")
      throw Error("Cross-site measurement");
  } catch { throw new NetworkError(403, "Use this website to record an agreed visit."); }
  const now = Date.now();
  for (const [key, window] of windows) if (now - window.start >= 60_000) windows.delete(key);
  // This transient anti-abuse key is never written to the database.
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
  if (!windows.has(key) && windows.size >= 5000) throw new NetworkError(429, "Visit measurement is temporarily busy.");
  const window = windows.get(key) ?? { start: now, count: 0 };
  windows.set(key, window);
  if (++window.count > 60) return void res.set("Retry-After", "60").status(429).end();
  if (!process.env.SESSION_SECRET) throw new NetworkError(503, "Visit measurement is not configured.");
  await recordVisit(parsed.data.sessionId);
  res.status(204).end();
});

const preferencePage = (done: boolean) => `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Préférences de rappel — The One Movement</title><body style="font-family:system-ui;background:#f7f3e8;color:#153d3f;padding:2rem;max-width:42rem;margin:auto"><h1>${done ? "Rappels désactivés" : "Gérer les rappels de profil"}</h1><p>${done ? "Vous ne recevrez plus de rappels pour compléter votre profil. Votre compte et vos choix de visibilité ne changent pas." : "Vous pouvez arrêter les emails de rappel sans supprimer votre compte."}</p>${done ? "" : '<form method="post"><button type="submit" style="padding:1rem">Ne plus recevoir de rappels</button></form>'}</body></html>`;
router.all("/profile-reminders/preferences/:id/:signature", async (req, res) => {
  res.set({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'" });
  const id = String(req.params.id), signature = String(req.params.signature);
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(signature) || !safeEqual(optOutSignature(id), signature))
    return void res.status(404).send("Ce lien de préférence est invalide.");
  const [row] = await db.select({ id: reminders.id }).from(reminders).where(eq(reminders.id, id)).limit(1);
  if (!row) return void res.status(404).send("Ce lien de préférence est indisponible.");
  if (req.method === "POST") {
    await db.update(reminders).set({ optOutAt: new Date(), updatedAt: new Date() }).where(eq(reminders.id, id));
    invalidateMemberDashboard();
    res.type("html").send(preferencePage(true));
  } else if (req.method === "GET" || req.method === "HEAD") res.type("html").send(preferencePage(false));
  else res.set("Allow", "GET, HEAD, POST").status(405).end();
});
export default router;
