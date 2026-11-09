import { Router } from "express";
import {
  GetDirectCallsResponse, InviteDirectCallBody, InviteDirectCallResponse,
  DecideDirectCallParams, DecideDirectCallBody, DecideDirectCallResponse,
  JoinDirectCallParams, JoinDirectCallResponse,
} from "@workspace/api-zod";
import { actor, networkAuth, networkEnabled, networkWrite, NetworkError } from "../services/networkAuth";
import { DailyProviderError } from "../services/dailyProvider";
import { decideCall, inviteCall, joinCall, listDirectCalls } from "../services/directCalls";

const router = Router();
router.use("/network/calls", networkAuth, networkEnabled, (_req, res, next) => {
  res.set({ "Cache-Control": "no-store, private", "Pragma": "no-cache", "Referrer-Policy": "no-referrer" });
  next();
});
router.get("/network/calls", async (_req, res): Promise<void> => {
  const who = actor(res);
  res.json(GetDirectCallsResponse.parse(await listDirectCalls(who)));
});
router.post("/network/calls", networkWrite, async (req, res): Promise<void> => {
  const who = actor(res);
  const input = InviteDirectCallBody.strict().safeParse(req.body);
  if (!input.success) throw new NetworkError(400, "Invalid call invitation.");
  res.json(InviteDirectCallResponse.parse(await inviteCall(who.member.id, input.data)));
});
router.post("/network/calls/:callId/action", networkWrite, async (req, res): Promise<void> => {
  const who = actor(res);
  const params = DecideDirectCallParams.safeParse(req.params), input = DecideDirectCallBody.strict().safeParse(req.body);
  if (!params.success || !input.success) throw new NetworkError(400, "Invalid call decision.");
  res.json(DecideDirectCallResponse.parse(await decideCall(who.member.id, params.data.callId, input.data.action)));
});
router.post("/network/calls/:callId/join", networkWrite, async (req, res): Promise<void> => {
  const who = actor(res);
  const params = JoinDirectCallParams.safeParse(req.params);
  if (!params.success || (req.body && Object.keys(req.body).length)) throw new NetworkError(400, "Invalid call credential request.");
  res.json(JoinDirectCallResponse.parse(await joinCall(who.member.id, params.data.callId)));
});
router.use((error: unknown, _req: unknown, res: import("express").Response, next: import("express").NextFunction) => {
  if (error instanceof DailyProviderError) { res.status(error.status).json({ error: error.message }); return; }
  next(error);
});
export default router;
