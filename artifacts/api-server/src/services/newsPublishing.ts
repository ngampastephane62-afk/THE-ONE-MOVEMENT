import { and, desc, eq, inArray } from "drizzle-orm";
import { db, newsArticles as articles, newsArticleRevisions as revisions, networkAudit, networkUploads as uploads } from "@workspace/db";
import type { NewsActionInput, NewsFounderArticle, NewsPublicArticle, NewsSnapshot } from "@workspace/api-zod";
import { ownedMedia } from "./networkFiles";
import { isEditorialUpload, newsMediaReferences, NewsError, validateNewsSnapshot } from "./newsValidation";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Pick<Tx, "select">;
type Article = typeof articles.$inferSelect;
export const NEWS_PAGE_SIZE = 12;
export const NEWS_HISTORY_SIZE = 20;

export async function validateEditorialMedia(ownerId: number, s: NewsSnapshot) {
  const refs = newsMediaReferences(s);
  const found = await ownedMedia(ownerId, refs.map(ref => ref.id));
  for (const row of found) {
    if (!isEditorialUpload(row)) throw new NewsError(400, "Use a new editorial upload. Private or paid files cannot be republished by ID.");
    for (const ref of refs.filter(ref => ref.id === row.id)) {
      if (ref.kind === "image" ? !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(row.contentType) : !["video/mp4", "video/webm", "video/quicktime"].includes(row.contentType)) {
        throw new NewsError(400, "This media file does not match its editorial field.");
      }
    }
  }
}

export function publicNewsDto(row: Article, snapshot: NewsSnapshot): NewsPublicArticle {
  // Deliberate allowlist: never serialize the root row, pointers or private history.
  return { id: row.id, slug: row.slug, publishedAt: row.publishedAt!.toISOString(), snapshot };
}

export async function founderNewsDto(executor: Executor, row: Article, historyPage?: number): Promise<NewsFounderArticle> {
  const pointers = [row.draftRevisionId, row.publishedRevisionId].filter((id): id is number => id !== null);
  const selected = pointers.length ? await executor.select().from(revisions)
    .where(and(eq(revisions.articleId, row.id), inArray(revisions.id, pointers))) : [];
  const history = historyPage ? await executor.select().from(revisions).where(eq(revisions.articleId, row.id))
    .orderBy(desc(revisions.revisionNo)).limit(NEWS_HISTORY_SIZE + 1).offset((historyPage - 1) * NEWS_HISTORY_SIZE) : [];
  return {
    id: row.id, slug: row.slug, status: row.status as NewsFounderArticle["status"], version: row.version,
    draftRevisionId: row.draftRevisionId, publishedRevisionId: row.publishedRevisionId,
    publishedAt: row.publishedAt?.toISOString() ?? null, updatedAt: row.updatedAt.toISOString(),
    draft: selected.find(revision => revision.id === row.draftRevisionId)?.snapshot ?? null,
    published: selected.find(revision => revision.id === row.publishedRevisionId)?.snapshot ?? null,
    history: history.slice(0, NEWS_HISTORY_SIZE).map(revision => ({
      id: revision.id, revisionNo: revision.revisionNo,
      createdAt: revision.createdAt.toISOString(), snapshot: revision.snapshot,
    })),
    historyHasMore: history.length > NEWS_HISTORY_SIZE,
  };
}

export async function changeNewsArticle(input: NewsActionInput, memberId: number): Promise<NewsFounderArticle> {
  if (input.snapshot) await validateEditorialMedia(memberId, input.snapshot);
  try {
    return await db.transaction(async tx => {
      let row: Article;
      if (input.action === "create") {
        [row] = await tx.insert(articles).values({ slug: input.slug! }).returning();
      } else {
        const [existing] = await tx.select().from(articles).where(eq(articles.id, input.id!)).for("update");
        if (!existing) throw new NewsError(404, "Article not found.");
        if (existing.version !== input.version) throw new NewsError(409, "This article changed in another session. Reload the saved version before continuing; your local text has not been saved.");
        row = existing;
      }
      let snapshot = input.snapshot;
      if (input.action === "restore") {
        const [revision] = await tx.select().from(revisions).where(and(eq(revisions.id, input.revisionId!), eq(revisions.articleId, row.id)));
        if (!revision) throw new NewsError(404, "Revision not found for this article.");
        snapshot = revision.snapshot;
        validateNewsSnapshot(snapshot);
        await validateEditorialMedia(memberId, snapshot);
      }
      const changes: Partial<typeof articles.$inferInsert> = {
        version: row.version + 1, updatedAt: new Date(),
      };
      let revisionId = row.draftRevisionId;
      if (input.action === "create" || input.action === "save" || input.action === "restore") {
        if (input.slug) {
          if (row.publishedAt && row.slug !== input.slug) throw new NewsError(400, "The public slug cannot change after first publication.");
          changes.slug = input.slug;
        }
        const [last] = await tx.select({ number: revisions.revisionNo }).from(revisions)
          .where(eq(revisions.articleId, row.id)).orderBy(desc(revisions.revisionNo)).limit(1);
        const [saved] = await tx.insert(revisions).values({
          articleId: row.id, revisionNo: (last?.number ?? 0) + 1,
          snapshot: snapshot!, createdByMemberId: memberId,
        }).returning({ id: revisions.id });
        revisionId = saved.id;
        changes.draftRevisionId = revisionId;
        if (input.action === "restore" && row.status === "archived") changes.status = "draft";
      } else if (input.action === "publish") {
        const [draft] = await tx.select().from(revisions)
          .where(and(eq(revisions.articleId, row.id), eq(revisions.id, row.draftRevisionId ?? 0)));
        if (!draft) throw new NewsError(400, "Save a draft before publishing.");
        validateNewsSnapshot(draft.snapshot, true);
        await validateEditorialMedia(memberId, draft.snapshot);
        changes.publishedRevisionId = draft.id;
        changes.publishedAt = row.publishedAt ?? new Date();
        changes.status = "published";
      } else {
        changes.status = input.action === "archive" ? "archived" : "draft";
      }
      const [updated] = await tx.update(articles).set(changes).where(eq(articles.id, row.id)).returning();
      await tx.insert(networkAudit).values({
        actorId: memberId, action: `news.${input.action}`, targetId: row.id,
        detail: JSON.stringify({
          version: updated.version, draftRevisionId: revisionId,
          publishedRevisionId: updated.publishedRevisionId,
          restoredFromRevisionId: input.action === "restore" ? input.revisionId : null,
          previousStatus: row.status, status: updated.status,
        }),
      });
      // Built inside the transaction, returned only after COMMIT succeeded.
      return founderNewsDto(tx, updated, 1);
    });
  } catch (error) {
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") throw new NewsError(409, "This slug is already in use. Choose another slug.");
    throw error;
  }
}

export async function findPublicNews(slug: string) {
  const [record] = await db.select({ article: articles, snapshot: revisions.snapshot }).from(articles)
    .innerJoin(revisions, and(eq(articles.id, revisions.articleId), eq(articles.publishedRevisionId, revisions.id)))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")));
  if (!record) throw new NewsError(404, "Article not found.");
  return record;
}

export async function findEditorialUpload(id: string, ownerId?: number) {
  const [row] = await db.select().from(uploads).where(and(eq(uploads.id, id), eq(uploads.ready, true),
    ownerId === undefined ? undefined : eq(uploads.ownerId, ownerId)));
  if (!row || !isEditorialUpload(row)) throw new NewsError(404, "Editorial media not found.");
  return row;
}
