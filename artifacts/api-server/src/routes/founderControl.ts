import { Router } from "express";
import { db, founderControlSettings as settings, founderServiceMessages as messages, founderNotifications as notifications } from "@workspace/db";
import { and, desc, eq, isNull, sql, lte } from "drizzle-orm";
import { ActOnFounderMemberBody, SaveFounderControlPreferencesBody, ReplyToAdministrativeServiceMessageBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { founderAccount, founderOverview, founderPreferences, founderSector, serviceMessageDto } from "../services/founderCommand";
import { founderMemberAction, replyToService } from "../services/founderAdminActions";

const router = Router();
const privateResponse = (_req: unknown, res: import("express").Response, next: import("express").NextFunction) => {
  res.set({ "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Vary": "Cookie, Authorization" });
  next();
};
router.use("/founder", networkAuth, privateResponse, (_req, res, next) => { requireFounder(res); next(); });
router.get("/founder/command-center", async (_req, res) => {
  try { res.json(await founderOverview(actor(res, false).clerkId)); }
  catch (e) { if (e instanceof NetworkError) throw e; throw new NetworkError(503, "Le centre de contrôle ou ses notifications ne sont pas disponibles. Aucun chiffre de remplacement n’est affiché."); }
});
router.get("/founder/registered-members/:clerkId", async (req, res) => {
  res.json(await founderAccount(String(req.params.clerkId), actor(res, false).member.id));
});
router.post("/founder/registered-members/:clerkId/actions", networkWrite, async (req, res) => {
  const parsed = ActOnFounderMemberBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Confirmez l’action, son destinataire et un motif d’au moins dix caractères.");
  await founderMemberAction(actor(res, false), String(req.params.clerkId), parsed.data);
  res.json({ ok: true });
});
router.get("/founder/sectors/:slug", async (req, res) => { res.json(await founderSector(String(req.params.slug))); });
router.post("/founder/command-center/preferences", networkWrite, async (req, res) => {
  const parsed = SaveFounderControlPreferencesBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Préférences invalides.");
  const who = actor(res, false);
  const previous = await founderPreferences(who.clerkId);
  const [latest] = await db.select({ id: sql<number>`coalesce(max(${notifications.id}),0)::integer` }).from(notifications);
  if (parsed.data.readThrough && parsed.data.readThrough > latest!.id) throw new NetworkError(400, "Notification inconnue.");
  await db.update(settings).set({
    ...(parsed.data.enabledKinds ? { enabledKinds: [...new Set(parsed.data.enabledKinds)] } : {}),
    ...(parsed.data.readThrough ? { readThrough: sql`greatest(${settings.readThrough}, ${parsed.data.readThrough})` } : {}),
  }).where(eq(settings.key, previous.key));
  res.json({ ok: true });
});
router.get("/network/service-messages", networkAuth, privateResponse, async (_req, res) => {
  const clerkId = actor(res, false).clerkId;
  const [rows, unread] = await Promise.all([
    db.select().from(messages).where(eq(messages.recipientClerkId, clerkId)).orderBy(desc(messages.id)).limit(100),
    db.select({ n: sql<number>`count(*)::integer` }).from(messages)
      .where(and(eq(messages.recipientClerkId, clerkId), eq(messages.fromAdministration, true), isNull(messages.readAt))),
  ]);
  res.json({ messages: rows.reverse().map(serviceMessageDto), unread: unread[0]!.n });
});
router.post("/network/service-messages", networkAuth, networkWrite, privateResponse, async (req, res) => {
  const parsed = ReplyToAdministrativeServiceMessageBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Réponse invalide.");
  const input = parsed.data, who = actor(res, false);
  if (input.readThrough && input.text === undefined && input.requestId === undefined) {
    await db.update(messages).set({ readAt: new Date() }).where(and(
      eq(messages.recipientClerkId, who.clerkId), eq(messages.fromAdministration, true), lte(messages.id, input.readThrough),
    ));
  } else {
    if (!input.text?.trim() || !input.requestId || input.readThrough !== undefined) throw new NetworkError(400, "Réponse invalide.");
    await replyToService(who, input.text.trim(), input.requestId);
  }
  res.json({ ok: true });
});
export default router;
