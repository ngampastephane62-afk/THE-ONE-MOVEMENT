import { db, networkProfiles as profiles, networkThreads as threads, networkMessages as messages } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { NetworkError } from "./networkAuth";
import { ownThread } from "./networkState";

/** Free first contact: no daily or pending-conversation product quotas. */
export async function startOrdinaryThread(self: number, other: number, initialNote: () => string) {
  return db.transaction(async tx => {
    // Existing PostgreSQL rows provide cross-process serialization, not an
    // in-memory limiter. Lock both members in stable order to cover requests in
    // either direction as well as competing requests from the same sender.
    const locked = await tx.execute(sql`
      SELECT ${profiles.memberId} FROM ${profiles}
      WHERE ${profiles.memberId} IN (${self}, ${other})
      ORDER BY ${profiles.memberId} FOR UPDATE
    `);
    if (locked.rows.length !== 2) throw new NetworkError(409, "The conversation could not be opened. Please try again.");

    const memberA = Math.min(self, other), memberB = Math.max(self, other);
    const [existing] = await tx.select().from(threads)
      .where(and(eq(threads.memberA, memberA), eq(threads.memberB, memberB)));
    if (existing) {
      if (existing.declined) throw new NetworkError(403, "This discussion request was declined.");
      return existing;
    }
    const note = initialNote();
    const [created] = await tx.insert(threads).values({ memberA, memberB, requestedBy: self })
      .onConflictDoNothing().returning();
    if (!created) {
      // Retain the unique-pair protection if another writer outside this path
      // exists. Never add another initial note to an already existing thread.
      const [thread] = await tx.select().from(threads)
        .where(and(eq(threads.memberA, memberA), eq(threads.memberB, memberB)));
      if (!thread || thread.declined) throw new NetworkError(409, "This conversation request is unavailable.");
      return thread;
    }
    // Use the actual insertion time after waiting for concurrent writers.
    await tx.insert(messages).values({
      threadId: created.id, senderId: self, text: note, createdAt: sql`clock_timestamp()`,
    });
    return created;
  }, { isolationLevel: "read committed" });
}

/** Serialize recipient decisions and replies on the same existing thread row. */
async function withOrdinaryThread<T>(
  self: number,
  threadId: number,
  change: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0], thread: Awaited<ReturnType<typeof ownThread>>) => Promise<T>,
) {
  // Do not lock or reveal threads the actor does not participate in.
  await ownThread(threadId, self);
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT ${threads.id} FROM ${threads} WHERE ${threads.id} = ${threadId} FOR UPDATE`);
    // Recheck membership, blocks and the latest consent after acquiring the lock.
    const thread = await ownThread(threadId, self);
    return change(tx, thread);
  }, { isolationLevel: "read committed" });
}

export async function decideOrdinaryThread(self: number, threadId: number, accept: boolean) {
  return withOrdinaryThread(self, threadId, async (tx, thread) => {
    if (thread.requestedBy === self) throw new NetworkError(403, "Only the recipient can accept or decline a request.");
    await tx.update(threads).set({
      accepted: accept, declined: !accept, updatedAt: new Date(),
    }).where(eq(threads.id, thread.id));
  });
}

export async function sendOrdinaryMessage(self: number, threadId: number, content: string) {
  return withOrdinaryThread(self, threadId, async (tx, thread) => {
    if (thread.declined) throw new NetworkError(403, "This discussion request was declined.");
    if (!thread.accepted && thread.requestedBy === self) {
      throw new NetworkError(403, "Your first message has been delivered. Wait for a reply or acceptance before sending more.");
    }
    // A recipient's reply is explicit consent. Insertion and acceptance commit
    // together: a failed send must never silently open a conversation.
    await tx.insert(messages).values({ threadId: thread.id, senderId: self, text: content });
    await tx.update(threads).set({ accepted: true, declined: false, updatedAt: new Date() }).where(eq(threads.id, thread.id));
  });
}
