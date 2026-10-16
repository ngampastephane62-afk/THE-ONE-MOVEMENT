import { db, mediaItemsTable as news, pool } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { storage } from "../services/networkFiles";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const privateDir = process.env.PRIVATE_OBJECT_DIR;
if (!bucket || !privateDir) throw new Error("App Storage is required.");
const folder = new URL("../../../../generated-artifacts/press-archive/", import.meta.url);
for (const filename of await readdir(folder)) {
  if (!/^(licence|tv5monde|monusco|acp)-(logo\.png|\d{2}\.webp)$/.test(filename)) continue;
  await storage.bucket(bucket).upload(fileURLToPath(new URL(filename, folder)), {
    destination: `public/press-archive/${filename}`, resumable: false,
    metadata: { contentType: filename.endsWith(".png") ? "image/png" : "image/webp" },
  });
  console.log(`Stored press asset: ${filename}`);
}
const [privateBucket, ...prefix] = privateDir.replace(/^\/+/, "").replace(/\/$/, "").split("/");
const originals = (await readdir(fileURLToPath(new URL("../../../../attached_assets/", import.meta.url))))
  .filter(name => name.includes("_1792108614500."));
for (const filename of originals) {
  await storage.bucket(privateBucket!).upload(fileURLToPath(new URL(`../../../../attached_assets/${filename}`, import.meta.url)), {
    destination: `${prefix.join("/")}/press-originals/${filename}`, resumable: false,
    metadata: { contentType: filename.endsWith(".png") ? "image/png" : "image/jpeg", cacheControl: "private,no-store" },
  });
}
const entries = [
  {
    slug: "licence", count: 9, outlet: "Licence News", category: "editions",
    title: "The One Fashion Week: Africa’s Creative Brilliance Shines on the Global Stage",
    dateLabel: "7 September 2025", websiteUrl: "https://licence.news/",
    summary: "Licence News traces The One Fashion Week’s roots in Kinshasa, its African creative voices and its international ambitions. The feature presents fashion as a platform for cultural identity, collaboration, unity and peace.",
  },
  {
    slug: "tv5monde", count: 3, outlet: "TV5MONDE Afrique", category: "editions",
    title: "The One Fashion Week — Le 22 février à Kinshasa",
    dateLabel: "Featured edition · February 2025", websiteUrl: "https://www.tv5monde.com/",
    summary: "TV5MONDE Afrique’s event feature presents The One Fashion Week in Kinshasa, its founder Yuston Nessy and its message of peace and unity. The archived article describes the edition’s intended support for displaced people and families affected by war in Goma.",
  },
  {
    slug: "monusco", count: 3, outlet: "MONUSCO", category: "humanitarian",
    title: "MONUSCO supports the fifth edition: Peace and Unity",
    dateLabel: "Official social posts · 11 August (year not displayed)", websiteUrl: "https://www.instagram.com/monusco_officiel/",
    summary: "Official MONUSCO posts document support for the fifth edition of The One Fashion Week in Kinshasa, under the theme Peace and Unity. The posts highlight inclusion and solidarity with people affected by conflict in eastern DRC. The supplied evidence includes X, Facebook and Instagram captures of the same announcement.",
  },
  {
    slug: "acp", count: 3, outlet: "Agence Congolaise de Presse (ACP)", category: "humanitarian",
    title: "Personnes atteintes d’albinisme et PVH invitées à lutter contre la désinformation",
    dateLabel: "9 August 2025", websiteUrl: "https://acp.cd/",
    summary: "ACP reports on the fifth edition of The One Fashion Week in Kinshasa, with a focus on the inclusion and rights of people with disabilities and people with albinism. The report describes MONUSCO’s participation and messages against disinformation, hate speech and discrimination.",
  },
];
for (const entry of entries) {
  const key = `press-archive:${entry.slug}`;
  const [existing] = await db.select({ id: news.id }).from(news).where(and(eq(news.type, "press-coverage-v1"), eq(news.mediaUrl, key)));
  if (existing) { console.log(`Already seeded: ${entry.outlet}`); continue; }
  await db.insert(news).values({
    title: entry.title, category: entry.outlet, type: "press-coverage-v1",
    status: "published", mediaUrl: key, publishedAt: new Date(),
    body: JSON.stringify({
      summary: entry.summary, category: entry.category, dateLabel: entry.dateLabel,
      // Exact article URLs are not visible in these captures; never invent slugs.
      // The Founder can add the direct URL in the News editor without losing evidence.
      sourceUrl: "", websiteUrl: entry.websiteUrl,
      evidence: Array.from({ length: entry.count }, (_, i) => ({ archive: `${entry.slug}-${String(i+1).padStart(2, "0")}.webp` })),
      logo: { archive: `${entry.slug}-logo.png` },
    }),
  });
  console.log(`Seeded press feature: ${entry.outlet}`);
}
await pool.end();
process.exit(0);
