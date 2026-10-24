import { test } from "node:test";
import assert from "node:assert/strict";
import { articleIdentityUrl, uniquePublishedMedia } from "../../../artifacts/web/src/lib/media-publication-identity";

const article = {
  status: "published", publisher: "Radio Okapi",
  externalUrl: "https://www.radiookapi.net/article?id=12",
  title: "One sourced story", publicationDate: "2026-01-01",
  description: "Original source context", coverUrl: null, embed: null,
};
test("URL identity removes tracking but preserves article identifiers and path case", () => {
  assert.equal(articleIdentityUrl(article.externalUrl + "&utm_source=share#top"), "radiookapi.net/article?id=12");
  assert.notEqual(articleIdentityUrl(article.externalUrl), articleIdentityUrl(article.externalUrl.replace("12", "13")));
  assert.notEqual(articleIdentityUrl("https://example.org/Article"), articleIdentityUrl("https://example.org/article"));
  assert.equal(articleIdentityUrl("javascript:alert(1)"), null);
});
test("only exact published clones are collapsed, without mutating input", () => {
  const rows = [{ ...article, id: 1 }, { ...article, id: 2, externalUrl: article.externalUrl + "&utm_campaign=test" }];
  assert.deepEqual(uniquePublishedMedia(rows).map((r) => r.id), [1]);
  assert.equal(rows.length, 2);
  assert.equal(uniquePublishedMedia([{ ...article, status: "draft" }]).length, 0);
});
test("distinct article identity, dates, screenshots and source context remain available", () => {
  for (const change of [
    { externalUrl: article.externalUrl.replace("12", "13") },
    { title: "Different story" }, { publicationDate: "2026-01-02" },
    { publisher: "Different publisher" }, { coverUrl: "/another-screenshot" },
    { description: "Additional source context" },
    { embed: { provider: "youtube", videoId: "different" } },
  ]) assert.equal(uniquePublishedMedia([article, { ...article, ...change }]).length, 2);
  assert.equal(uniquePublishedMedia([{ ...article, externalUrl: "" }, { ...article, externalUrl: "" }]).length, 2);
});
