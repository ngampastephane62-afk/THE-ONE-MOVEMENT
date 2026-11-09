import {
  db, connectCallBudgets as budgets, connectCallSessions as sessions,
  ecosystemMembersTable as members, networkProfiles as profiles,
} from "@workspace/db";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import type { NetworkActor } from "./networkAuth";
import { NetworkError } from "./networkAuth";
import { ownThread } from "./networkState";
import {
  CALL_LIVE_STATUSES,
  CALL_RATE_MICRO_USD, CALL_RESERVATION_MICRO_USD, admissionFits, callWindow, dailyPilotAllowed,
} from "./callPolicy";
import { createDailyRoom, dailyDomain, dailyMeetings, dailyToken, ejectDailyRoom } from "./dailyProvider";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Session = typeof sessions.$inferSelect;
const live = [...CALL_LIVE_STATUSES];
const locked = <T>(work: (tx: Tx) => Promise<T>) => db.transaction(async tx => {
  // One cross-process ordering for admissions, decisions, expiry and refunds.
  // Budget rows are also locked explicitly. No network await extends this lock
  // except the bounded, read-only reconciliation during admission.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(173667201)`);
  return work(tx);
});
function enabled() {
  if (!dailyPilotAllowed()) throw new NetworkError(503, "Private calls are available only in the authorized development pilot.");
}
async function authorized(threadId: number, self: number) {
  const t = await ownThread(threadId, self);
  if (!t.accepted || t.declined) throw new NetworkError(403, "Accept the conversation before starting a private call.");
  const p = await db.select().from(profiles).where(inArray(profiles.memberId, [t.memberA, t.memberB]));
  if (p.length !== 2 || p.some(v => !v.enabled || v.suspended)) throw new NetworkError(403, "Both members must have an active network account.");
  return t;
}
function participant(call: Session, self: number) {
  if (call.initiatorId !== self && call.recipientId !== self) throw new NetworkError(404, "Call not found.");
}
async function lockSession(tx: Tx, id: string, self: number) {
  const [row] = await tx.select().from(sessions).where(eq(sessions.id, id)).for("update");
  if (!row) throw new NetworkError(404, "Call not found.");
  participant(row, self);
  await tx.select().from(budgets).where(eq(budgets.monthUtc, row.budgetMonthUtc)).for("update");
  return row;
}
async function settle(tx: Tx, row: Session, status: string, release: boolean) {
  if (row.reservationState === "reserved") {
    await tx.update(budgets).set({
      reservedMicroUsd: sql`${budgets.reservedMicroUsd} - ${row.reservedMicroUsd}`,
      committedMicroUsd: release ? budgets.committedMicroUsd : sql`${budgets.committedMicroUsd} + ${row.reservedMicroUsd}`,
      updatedAt: new Date(),
    }).where(eq(budgets.monthUtc, row.budgetMonthUtc));
  }
  const [updated] = await tx.update(sessions).set({
    status, endedAt: new Date(), updatedAt: new Date(),
    reservationState: row.reservationState === "reserved" ? release ? "released" : "committed" : row.reservationState,
  }).where(eq(sessions.id, row.id)).returning();
  return updated!;
}
async function expire(tx: Tx) {
  const now = new Date();
  const rows = await tx.select().from(sessions).where(inArray(sessions.status, live)).for("update");
  for (const row of rows) {
    if (row.providerExpiresAt <= now || (row.status === "ringing" && row.ringExpiresAt <= now)) {
      await tx.select().from(budgets).where(eq(budgets.monthUtc, row.budgetMonthUtc)).for("update");
      // Only unprovisioned invitations can be refunded without consulting Daily.
      await settle(tx, row, row.status === "ringing" ? "missed" : "ended", !row.providerRoomName);
    }
  }
}
async function dto(row: Session) {
  const people = await db.select({ id: members.id, name: members.fullName }).from(members)
    .where(inArray(members.id, [row.initiatorId, row.recipientId]));
  const names = new Map(people.map(p => [p.id, p.name]));
  return {
    id: row.id, threadId: row.threadId, initiatorId: row.initiatorId, recipientId: row.recipientId,
    initiatorName: names.get(row.initiatorId) ?? "Member", recipientName: names.get(row.recipientId) ?? "Member",
    mode: row.mode as "audio" | "video", status: row.status as "ringing" | "provisioning" | "active" | "declined" | "missed" | "cancelled" | "ended" | "failed" | "uncertain",
    ringExpiresAt: row.ringExpiresAt.toISOString(), expiresAt: row.providerExpiresAt.toISOString(), createdAt: row.createdAt.toISOString(),
  };
}
export async function listDirectCalls(actor: NetworkActor) {
  if (!dailyPilotAllowed()) return { enabled: false, reason: "Private calls are not enabled in this environment.", calls: [], budget: null };
  const self = actor.member!.id;
  await locked(expire);
  const rows = await db.select().from(sessions).where(or(eq(sessions.initiatorId, self), eq(sessions.recipientId, self)))
    .orderBy(desc(sessions.createdAt)).limit(30);
  const visible: Session[] = [];
  for (const row of rows) {
    try { await authorized(row.threadId, self); visible.push(row); } catch { /* Never return a blocked participant's call details. */ }
  }
  const [b] = await db.select().from(budgets).where(eq(budgets.monthUtc, new Date().toISOString().slice(0, 7)));
  const paused = !!b?.paused;
  const available = !b || admissionFits(b.committedMicroUsd, b.reservedMicroUsd, b.providerObservedMicroUsd ?? 0, b.admissionLimitMicroUsd);
  return {
    // A paused ledger can be reconciled by retrying an invitation. The POST
    // always rechecks full provider usage before reserving or creating anything.
    enabled: available,
    reason: paused ? "Calls are paused until provider usage can be verified." : !available ? "The pilot's estimated monthly calling allowance is reached." : null,
    calls: await Promise.all(visible.map(dto)),
    budget: actor.founder && b ? {
      month: b.monthUtc, limitUsd: b.limitMicroUsd / 1e6, admissionLimitUsd: b.admissionLimitMicroUsd / 1e6,
      reservedUsd: b.reservedMicroUsd / 1e6, committedUsd: b.committedMicroUsd / 1e6,
      remainingEstimatedUsd: Math.max(0, b.admissionLimitMicroUsd - Math.max(b.committedMicroUsd, b.providerObservedMicroUsd ?? 0) - b.reservedMicroUsd) / 1e6,
      paused,
    } : null,
  };
}
export async function inviteCall(self: number, input: { threadId: number; mode: "audio" | "video"; clientRequestId: string }) {
  enabled();
  const window = callWindow();
  if (!window) throw new NetworkError(409, "Please wait until the next UTC month before starting a call.");
  // Fetch failures never create a budget or silently assume no provider usage.
  const domain = await dailyDomain();
  const result = await locked(async tx => {
    await expire(tx);
    const thread = await authorized(input.threadId, self);
    const [repeat] = await tx.select().from(sessions)
      .where(and(eq(sessions.initiatorId, self), eq(sessions.clientRequestId, input.clientRequestId)));
    if (repeat) {
      if (repeat.threadId !== input.threadId || repeat.mode !== input.mode) throw new NetworkError(409, "This request identifier was already used.");
      return { row: repeat };
    }
    const [previousBudget] = await tx.select().from(budgets).orderBy(desc(budgets.monthUtc)).limit(1);
    if (previousBudget && previousBudget.providerDomainId !== domain.id) throw new NetworkError(409, "The Daily account changed. Budget reconciliation is required.");
    await tx.insert(budgets).values({ monthUtc: window.month, providerDomainId: domain.id }).onConflictDoNothing();
    const [b] = await tx.select().from(budgets).where(eq(budgets.monthUtc, window.month)).for("update");
    if (!b || b.providerDomainId !== domain.id) throw new NetworkError(409, "The calling account could not be reconciled.");
    const known = await tx.select({ room: sessions.providerRoomName }).from(sessions).where(eq(sessions.budgetMonthUtc, window.month));
    const knownNames = new Set(known.map(c => c.room).filter(Boolean));
    let observed = 0, unknown = false;
    try {
      const meetings = await dailyMeetings(window.month);
      for (const m of meetings) {
        if (!knownNames.has(m.room) || m.maxParticipants > 2) unknown = true;
        observed += (Math.ceil(m.duration / 60) + 2) * m.maxParticipants * CALL_RATE_MICRO_USD;
      }
      if (!Number.isSafeInteger(observed) || observed < 0 || observed > 2_000_000_000) unknown = true;
    } catch { unknown = true; }
    await tx.update(budgets).set({ paused: unknown, providerObservedMicroUsd: unknown ? null : observed,
      providerCheckedAt: unknown ? null : new Date(), updatedAt: new Date() }).where(eq(budgets.monthUtc, window.month));
    if (unknown) return { error: "Calls are paused because complete Daily usage could not be reconciled." };
    if (!admissionFits(b.committedMicroUsd, b.reservedMicroUsd, observed, b.admissionLimitMicroUsd)) {
      return { error: "The pilot's estimated monthly calling allowance is reached." };
    }
    const other = thread.memberA === self ? thread.memberB : thread.memberA;
    const busy = await tx.select({ id: sessions.id }).from(sessions).where(and(inArray(sessions.status, live),
      or(inArray(sessions.initiatorId, [self, other]), inArray(sessions.recipientId, [self, other])))).limit(1);
    if (busy.length) throw new NetworkError(409, "One participant already has an invitation or call in progress.");
    const [row] = await tx.insert(sessions).values({
      budgetMonthUtc: window.month, threadId: thread.id, initiatorId: self, recipientId: other,
      mode: input.mode, clientRequestId: input.clientRequestId, reservedMicroUsd: CALL_RESERVATION_MICRO_USD,
      ringExpiresAt: window.ringExpires, providerExpiresAt: window.expires, createdAt: window.now,
    }).returning();
    await tx.update(budgets).set({ reservedMicroUsd: sql`${budgets.reservedMicroUsd} + ${CALL_RESERVATION_MICRO_USD}`, updatedAt: new Date() })
      .where(eq(budgets.monthUtc, window.month));
    return { row: row! };
  });
  if ("error" in result) throw new NetworkError(409, result.error!);
  return dto(result.row!);
}
async function ownCall(id: string, self: number) {
  const [row] = await db.select().from(sessions).where(eq(sessions.id, id));
  if (!row) throw new NetworkError(404, "Call not found.");
  participant(row, self);
  return row;
}
export async function decideCall(self: number, id: string, action: "accept" | "decline" | "cancel" | "end") {
  enabled();
  await ownCall(id, self);
  let provision = false;
  const call = await locked(async tx => {
    await expire(tx);
    const row = await lockSession(tx, id, self);
    // Ending/cancelling remains possible after a block or conversation decline.
    if (action === "accept" || action === "decline") {
      if (row.recipientId !== self) throw new NetworkError(403, "Only the invited member can answer this call.");
    }
    if (action === "cancel" && row.initiatorId !== self) throw new NetworkError(403, "Only the caller can cancel an invitation.");
    if (!live.includes(row.status as typeof live[number])) return row;
    if (action === "accept") {
      await authorized(row.threadId, self);
      if (row.status !== "ringing") return row;
      if (row.ringExpiresAt <= new Date()) throw new NetworkError(409, "The invitation expired.");
      const name = `tomi-dev-${row.id.replaceAll("-", "")}`;
      const [updated] = await tx.update(sessions).set({ status: "provisioning", providerRoomName: name,
        answeredAt: new Date(), updatedAt: new Date() }).where(eq(sessions.id, id)).returning();
      provision = true;
      return updated!;
    }
    if (action === "decline" && row.status !== "ringing") throw new NetworkError(409, "This call is no longer ringing.");
    if (action === "cancel" && row.status !== "ringing") throw new NetworkError(409, "End the call instead.");
    return settle(tx, row, action === "decline" ? "declined" : action === "cancel" ? "cancelled" : "ended", !row.providerRoomName);
  });
  if (provision) {
    // Only the first accept creates the deterministic private room. Duplicate
    // provisioning requests cannot create another billable room.
    try {
      await createDailyRoom(call.providerRoomName!, call.mode, call.providerExpiresAt);
      const updated = await locked(async tx => {
        const current = await lockSession(tx, id, self);
        if (current.status !== "provisioning") return current;
        try { await authorized(current.threadId, self); }
        catch { return settle(tx, current, "ended", false); }
        const [row] = await tx.update(sessions).set({ status: "active", updatedAt: new Date() }).where(eq(sessions.id, id)).returning();
        return row!;
      });
      if (updated.status !== "active") await ejectDailyRoom(call.providerRoomName!, [call.initiatorId, call.recipientId]).catch(() => {});
      return dto(updated);
    } catch {
      // A timeout/409 might mean the room exists. Keep the full reservation;
      // no credentials are issued while state is uncertain.
      await locked(async tx => {
        const current = await lockSession(tx, id, self);
        if (current.status === "provisioning") await tx.update(sessions).set({ status: "uncertain", updatedAt: new Date() }).where(eq(sessions.id, id));
      });
      throw new NetworkError(503, "Daily could not confirm the private room. No participant has been joined; the reservation is kept until expiry.");
    }
  }
  if (action === "end" && call.providerRoomName) {
    try { await ejectDailyRoom(call.providerRoomName, [call.initiatorId, call.recipientId]); }
    catch { throw new NetworkError(503, "The call is closed in TOMI, but Daily termination is unconfirmed. Close your call window; provider expiry remains enforced."); }
  }
  return dto(call);
}
export async function joinCall(self: number, id: string) {
  enabled();
  const row = await ownCall(id, self);
  await authorized(row.threadId, self);
  if (row.status !== "active" || !row.providerRoomName || row.providerExpiresAt.getTime() - Date.now() < 1000) {
    throw new NetworkError(409, "This call is not available to join.");
  }
  const domain = await dailyDomain();
  const [budget] = await db.select().from(budgets).where(eq(budgets.monthUtc, row.budgetMonthUtc));
  if (!budget || budget.providerDomainId !== domain.id) throw new NetworkError(409, "Calling account changed.");
  const [member] = await db.select({ name: members.fullName }).from(members).where(eq(members.id, self));
  const token = await dailyToken(row.providerRoomName, self, member?.name ?? "Member", row.mode, row.providerExpiresAt);
  // Recheck consent after the external request. A concurrent stop must not
  // return a credential to a caller who has just been blocked.
  const current = await ownCall(id, self);
  await authorized(current.threadId, self);
  if (current.status !== "active" || current.providerExpiresAt <= new Date()) throw new NetworkError(409, "This call has ended.");
  return { url: `https://${domain.name}.daily.co/${row.providerRoomName}`, token, expiresAt: row.providerExpiresAt.toISOString(), mode: row.mode as "audio" | "video" };
}
export async function stopCallsBetween(self: number, other: number) {
  if (!dailyPilotAllowed()) return;
  const rows = await db.select().from(sessions).where(and(inArray(sessions.status, live),
    or(and(eq(sessions.initiatorId, self), eq(sessions.recipientId, other)),
      and(eq(sessions.initiatorId, other), eq(sessions.recipientId, self)))));
  for (const row of rows) await decideCall(self, row.id, "end");
}
