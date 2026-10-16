import { createHash } from "node:crypto";
import type { Request } from "express";
import { and, eq } from "drizzle-orm";
import { db, mediaItemsTable as newsItems } from "@workspace/db";
import { NetworkError } from "./networkAuth";

const founderPhotos = new Set([
  "runway-white", "runway-cultural", "community-gathering", "human-connection",
  "community-outreach", "conversation", "runway-edition-five", "summit-goma",
  "diplomatic-encounter", "global-encounter", "institutional-dialogue", "office-encounter",
  "casting-group", "runway-wide", "cultural-performance", "designer-portrait",
  "casting-portrait", "audience",
]);
const programmePhotos = new Set([
  "fashion-night-runway-group", "archive-speaker-microphone", "fashion-portrait", "gala-ambassador",
  "gala-private-office", "gala-diplomatic-handshake", "gala-partner-meeting", "gala-partner-handshake",
  "gala-media-dialogue", "gala-founder-speaking", "awards-winnie-harlow", "awards-nominees-poster", "awards-ciara-poster", "awards-kevin-hart",
]);
const publicPortraits = new Set([
  "mukesh-ambani", "gina-rinehart", "mansour-bin-zayed", "maktoum-bin-mohammed", "mohammed-bin-rashid",
  "hamdan-bin-mohammed", "saif-bin-zayed", "abdulrahman-al-owais", "abdullah-bin-zayed", "mohamed-al-hussaini",
  "mohammad-al-gergawi", "nahayan-bin-mabarak", "thani-al-zeyoudi", "sultan-al-jaber", "reem-al-hashimy",
  "ahmad-al-falasi", "suhail-al-mazrouei", "ahmed-al-sayegh", "shamma-al-mazrui", "sarah-al-amiri",
  "abdulrahman-al-awar", "abdulla-al-marri", "abdullah-al-nuaimi", "amna-al-dahak", "sana-suhail",
  "mohamed-alsuwaidi", "salem-al-qassimi", "maryam-al-hammadi", "omar-al-olama", "mohamed-al-mazrouei",
  "ben-amadasun", "denis-mukwege", "amina-mohammed", "david-jonsson-poster", "mohombi-poster", "ciara-poster",
  "navi-pillay", "antonio-guterres", "bernard-arnault", "lula-da-silva", "jorge-paulo-lemann", "cathy-freeman",
  "aliko-dangote", "mo-ibrahim", "strive-masiyiwa", "oprah-winfrey", "warren-buffett", "robert-f-smith",
  "chimamanda-ngozi-adichie", "angelique-kidjo", "wole-soyinka", "ava-duvernay", "lin-manuel-miranda",
  "beyonce", "patrick-awuah", "fred-swaniker", "michelle-obama", "geoffrey-canada", "sal-khan", "leymah-gbowee",
  "desmond-tutu", "jose-andres", "melinda-french-gates", "jimmy-carter", "wangari-maathai", "juliana-rotich",
  "jennifer-doudna", "katalin-kariko", "kizzmekia-corbett", "nelson-mandela", "ellen-johnson-sirleaf",
  "ngozi-okonjo-iweala", "barack-obama", "john-lewis", "stacey-abrams", "david-jonsson", "ciara", "mohombi",
  "winnie-harlow", "nancy-isime", "kevin-hart", "mohamed-bin-zayed", "graca-machel", "tebello-nyokong",
  "hussain-sajwani", "abdulla-al-futtaim", "abdulla-al-ghurair", "waleed-al-zaabi", "mohamed-alabbar",
  "hussain-binghatti", "abbas-sajwani", "humaid-al-nuaimi", "hamad-al-sharqi", "saud-al-mualla",
  "sultan-al-qasimi", "saud-al-qasimi", "malala-yousafzai",
]);

/** Only known public editorial resources get a discussion. Never fetch a caller's URL. */
export async function editorialPhotoId(source: unknown, req: Request): Promise<string> {
  if (typeof source !== "string" || source.length > 1500) throw new NetworkError(400, "Choose a public photograph.");
  let url: URL;
  try { url = new URL(source, "https://editorial.invalid"); }
  catch { throw new NetworkError(400, "Choose a valid photograph."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new NetworkError(400, "Invalid media source.");
  if (url.hostname !== "editorial.invalid") {
    const hosts = [req.get("host"), req.get("x-forwarded-host")?.split(",")[0]?.trim()];
    if (!hosts.includes(url.host)) throw new NetworkError(404, "This photograph is not registered.");
  }
  let path: string;
  try { path = decodeURIComponent(url.pathname); } catch { throw new NetworkError(400, "Invalid media path."); }
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) throw new NetworkError(400, "Invalid media path.");
  let approved =
    /^\/api\/magazine\/assets\/(artwork-(0[1-9]|1[0-6])|kit-page-(0[1-9]|10)|heritage-0[1-4]|print-reader-01|audience-reel-0[1-6]|audience-proof-(overview|week|instagram))\.webp$/.test(path) ||
    /^\/api\/official-meetings\/photos\/(0[1-9]|10)\.webp$/.test(path) ||
    /^\/api\/documentary\/media\/(tfm-portrait-(0[1-9]|1\d|2[0-6])|documentary-teaser-0[1-4]|fashion-week-tv5-runway|goma|radio-okapi|ben-amadasun)\.webp$/.test(path) ||
    path === "/api/editorial/assets/pink-october-burj-khalifa.webp";
  if (/^\/assets\/media\/editorial\/(fashion-three-models|awards-naomi)\.webp$/.test(path) ||
      /^\/brand-photos\/(photo-(0[1-9]|1[0-3])|vision-(hero|bukavu|culture-peace|global-community))\.jpg$/.test(path)) approved = true;
  const founder = path.match(/^\/brand-photos\/founder\/([a-z-]+?)(?:-(?:800|1600))?\.webp$/);
  if (founder && founderPhotos.has(founder[1])) {
    approved = true;
    path = `/brand-photos/founder/${founder[1]}.webp`;
  }
  const programme = path.match(/^\/assets\/media\/programs\/([a-z-]+)\.webp$/);
  if (programme && programmePhotos.has(programme[1])) approved = true;
  const portrait = path.match(/^\/api\/editorial-portraits\/([a-z-]+)\.webp$/);
  if (portrait && publicPortraits.has(portrait[1])) approved = true;
  const news = path.match(/^\/api\/news\/([1-9]\d*)\/assets\/(\d+)$/);
  if (news) {
    const [entry] = await db.select({ body: newsItems.body }).from(newsItems)
      .where(and(eq(newsItems.id, Number(news[1])), eq(newsItems.status, "published"), eq(newsItems.type, "press-coverage-v1"))).limit(1);
    if (entry?.body) {
      try {
        const data = JSON.parse(entry.body) as { evidence?: unknown[] };
        approved = !!data.evidence && Number(news[2]) < data.evidence.length;
      } catch { approved = false; }
    }
  }
  if (!approved) throw new NetworkError(404, "This photograph is not registered for public discussion.");
  return `photo-${createHash("sha256").update(path).digest("hex").slice(0, 40)}`;
}
