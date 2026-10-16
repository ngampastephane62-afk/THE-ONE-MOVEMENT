/**
 * Materialise editorial portraits in App Storage; no third-party hotlinks at runtime.
 * Wikimedia portrait file pages are retained for licensing/attribution.
 * Usage: pnpm --filter @workspace/scripts exec tsx src/store-person-directory.ts
 */
import { Storage } from "@google-cloud/storage";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { IMPACT_LEADERS, AMBASSADOR_NOMINEES } from "@workspace/shared";
import { UAE_CABINET, UAE_RULERS, UAE_BILLIONAIRES } from "../../artifacts/web/src/lib/emirates-directory";
process.chdir(fileURLToPath(new URL("../../", import.meta.url)));
const dir = "generated-artifacts/people";
await mkdir(dir, { recursive: true });
const storage = new Storage({ projectId: "", credentials: {
  audience: "replit", subject_token_type: "access_token", token_url: "http://127.0.0.1:1106/token",
  type: "external_account", credential_source: { url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" } }, universe_domain: "googleapis.com",
}});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required");
type Portrait = { path: string; credit: string; source: string; width: number; height: number };
const result: Record<string, Portrait> = JSON.parse(await readFile("artifacts/web/src/lib/person-media.json", "utf8").catch(() => "{}"));
async function store(slug: string, source: string, credit: string, url: string, filter = "scale=640:-2") {
  const raw = `${dir}/${slug}.source`, out = `${dir}/${slug}.webp`;
  if (source.startsWith("attached_assets/") || source.startsWith(dir)) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-frames:v", "1", "-vf", filter, "-quality", "82", out]);
  } else {
    const response = await fetch(source, { signal: AbortSignal.timeout(30000), headers: { "User-Agent": "TOMI-Editorial/1.0 (portrait attribution retained)" } });
    if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
    await writeFile(raw, Buffer.from(await response.arrayBuffer()));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-frames:v", "1", "-vf", filter, "-quality", "82", out]);
  }
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", out], { encoding: "utf8" }));
  const path = `people/${slug}.webp`;
  await storage.bucket(bucket!).upload(out, { destination: `public/${path}`, resumable: false, metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" } });
  result[slug] = { path, credit, source: url, width: probe.streams[0].width, height: probe.streams[0].height };
}
const cabinet = JSON.parse(await readFile(`${dir}/cabinet-images.json`, "utf8")) as { image: string; profile: string }[];
if (cabinet.length !== UAE_CABINET.length) throw new Error("Cabinet image order/length mismatch");
const people = [
  ...IMPACT_LEADERS.map(p => ({ slug: p.slug, wiki: p.sources.find(s => s.url.includes("wikipedia.org"))?.url.split("/wiki/")[1] || ({ "amina-mohammed": "Amina_J._Mohammed", "navi-pillay": "Navi_Pillay", "antonio-guterres": "António_Guterres" } as Record<string, string>)[p.slug] })),
  ...AMBASSADOR_NOMINEES.map(p => ({ slug: p.slug, wiki: p.sources.find(s => s.url.includes("wikipedia.org"))?.url.split("/wiki/")[1] })),
  ...UAE_RULERS, ...UAE_BILLIONAIRES,
];
if (process.argv.includes("--supplements")) people.length = 0;
for (let start = 0; start < people.length; start += 1) {
  await Promise.all(people.slice(start, start + 1).map(async p => {
    if (!p.wiki || (result[p.slug] && !/\/File:[0-9a-f]{1,2}$/.test(result[p.slug]!.source)) || ["amina-mohammed", "denis-mukwege"].includes(p.slug)) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail%7Coriginal&pithumbsize=330&redirects=1&titles=${encodeURIComponent(decodeURIComponent(p.wiki).replaceAll("_", " "))}`, { signal: AbortSignal.timeout(25000) });
      const json = await r.json() as { query?: { pages: Record<string, { thumbnail?: { source: string }; original?: { source: string } }> } };
      const info = Object.values(json.query?.pages || {})[0];
      const page = { thumbnail: info?.thumbnail, originalimage: info?.original };
      // Wikimedia thumbnails only permit specific preset widths. Use the returned URL verbatim.
      const image = page.thumbnail?.source || page.originalimage?.source;
      if (!image) throw new Error("No portrait");
      const file = page.originalimage?.source.split("/").at(-1)?.split("?")[0];
      const source = file ? `https://commons.wikimedia.org/wiki/File:${file}` : `https://en.wikipedia.org/wiki/${p.wiki}`;
      await store(p.slug, image, "Wikimedia Commons · see original file for author and licence", source);
      console.log(`Portrait stored: ${p.slug}`);
    } catch (e) { console.error(`Portrait unavailable: ${p.slug}: ${String(e)}`); }
  }));
}
const supplements = JSON.parse(await readFile(`${dir}/supplement-portraits.json`, "utf8").catch(() => "[]")) as { slug: string; image: string; credit: string; source: string }[];
for (const p of supplements) {
  if (!result[p.slug]) {
    await store(p.slug, p.image, p.credit, p.source);
    console.log(`Supplementary portrait stored: ${p.slug}`);
  }
}
// Missing page portraits: explicitly selected editorial image-search results.
for (const [slug, image, credit, source] of [
  ["graca-machel", "https://sahistory.org.za/sites/default/files/bio_pics/graca-machel-300x234.jpg", "South African History Archive · Graça Machel portrait", "https://sahistory.org.za/people/graca-simbine-machel"],
  ["tebello-nyokong", "https://www.litnet.co.za/wp-content/uploads/2026/08/Tebello-Nyokong-Foto-erkenning_verskaf-deur-Rhodes-universiteit-se-mediaspan-600x400.jpg", "Rhodes University media team / LitNet", "https://www.litnet.co.za/"],
]) {
  if (!result[slug!]) await store(slug!, image!, credit!, source!);
}
for (let start = 0; start < cabinet.length; start += 5) {
  await Promise.all(cabinet.slice(start, start + 5).map(async (p, i) => {
    const person = UAE_CABINET[start + i]!;
    if (result[person.slug]) return;
    await store(person.slug, p.image, "UAE Cabinet · official portrait", p.profile);
    console.log(`Official portrait stored: ${person.slug}`);
  }));
}
await store("ben-amadasun", "attached_assets/IMG_9240_1792125639933.jpeg", "Portrait supplied by TOMI", "https://mg.co.za/friday/2026-09-11-ten-years-in-netflix-announces-new-expansive-slate-for-the-rest-of-2026");
await store("denis-mukwege", "attached_assets/IMG_9260_1792125639933.jpeg", "Portrait supplied by TOMI · photographer signature retained", "https://www.nobelprize.org/prizes/peace/2018/mukwege/facts/");
// Supplied screenshot: retain only the UN portrait, not the browser interface.
await store("amina-mohammed", "attached_assets/IMG_9254_1792125639933.png", "United Nations · portrait supplied by TOMI", "https://www.un.org/sg/en/content/dsg/biography", "crop=iw*0.875:ih*0.61:iw*0.06:ih*0.20,scale=640:-2");
await store("david-jonsson-poster", "attached_assets/Katie_jensen_1792125639933.png", "TOMI · supplied nomination poster", "", "scale=1000:-2");
await store("mohombi-poster", `${dir}/video-one.jpg`, "TOMI · supplied announcement film", "");
await store("ciara-poster", `${dir}/video-two.jpg`, "TOMI · supplied announcement film", "");
await writeFile("artifacts/web/src/lib/person-media.json", JSON.stringify(result, null, 2) + "\n");
console.log(`Stored ${Object.keys(result).length} portraits/artworks`);
process.exit(0);
