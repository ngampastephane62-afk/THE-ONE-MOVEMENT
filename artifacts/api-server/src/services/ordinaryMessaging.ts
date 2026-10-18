import { db, networkProfiles as profiles, networkThreads as threads, networkMessages as messages } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { NetworkError } from "./networkAuth";

/** First contacts only. Accepted messages never enter this quota path. */
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
    // The lowest message ID is the initial note, inserted atomically with its
    // thread. Read timestamps only; never retrieve private message contents.
    // Validate all surviving outgoing history and fail closed on inconsistencies.
    const usage = await tx.execute<{ recent: number; pending: number; invalid: number }>(sql`
      SELECT
        count(*) FILTER (WHERE initial.created_at > statement_timestamp() - interval '24 hours')::integer AS recent,
        count(*) FILTER (WHERE NOT ${threads.accepted} AND NOT ${threads.declined})::integer AS pending,
        count(*) FILTER (WHERE initial.sender_id IS NULL
          OR initial.sender_id <> ${threads.requestedBy}
          OR initial.created_at IS NULL
          OR initial.created_at > statement_timestamp())::integer AS invalid
      FROM ${threads}
      LEFT JOIN LATERAL (
        SELECT ${messages.senderId} AS sender_id, ${messages.createdAt} AS created_at
        FROM ${messages} WHERE ${messages.threadId} = ${threads.id}
        ORDER BY ${messages.id} ASC LIMIT 1
      ) AS initial ON TRUE
      WHERE ${threads.requestedBy} = ${self}
    `);
    const counts = usage.rows[0];
    if (!counts || ![counts.recent, counts.pending, counts.invalid].every(n => Number.isSafeInteger(n) && n >= 0) || counts.invalid) {
      throw new NetworkError(409, "New conversation requests are temporarily unavailable because their history could not be verified.");
    }
    if (counts.recent >= 5) throw new NetworkError(429, "You can create up to 5 new conversation requests in a rolling 24-hour period. Existing conversations remain available.");
    if (counts.pending >= 10) throw new NetworkError(429, "You already have 10 pending outgoing requests. Wait for a response before contacting someone new.");

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
    // DEFAULT now() would use transaction start, possibly before waiting for a
    // lock. Database wall-clock insertion time keeps the rolling window exact.
    await tx.insert(messages).values({
      threadId: created.id, senderId: self, text: note, createdAt: sql`clock_timestamp()`,
    });
    return created;
  }, { isolationLevel: "read committed" });
}
