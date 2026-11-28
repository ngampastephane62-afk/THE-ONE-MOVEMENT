import { Router } from "express";
import { streamStoredObject } from "../services/storedObjectStream";

const router = Router();

// Only the explicitly curated public media files can be served here.
router.get(["/home-reels/:filename", "/program-media/:filename", "/humanitarian-media/:filename", "/editorial-media/:filename", "/editorial-portraits/:filename", "/nominee-media/:filename"], async (req, res) => {
  const filename = String(req.params.filename);
  const isProgramMedia = req.path.startsWith("/program-media/");
  const isHumanitarianMedia = req.path.startsWith("/humanitarian-media/");
  const isEditorialMedia = req.path.startsWith("/editorial-media/");
  const isPortrait = req.path.startsWith("/editorial-portraits/");
  const isNominee = req.path.startsWith("/nominee-media/");
  const allowed = isPortrait
    ? /^[a-z][a-z0-9-]{1,65}\.webp$/.test(filename)
    : isNominee
    ? /^(mohombi|ciara)-announcement\.(mp4|webm)$/.test(filename)
    : isEditorialMedia
    ? /^(goma-donation|previous-editions)\.(mp4|webm|webp)$/.test(filename)
    : isHumanitarianMedia
    ? /^(?:(panzi-appeal|tomi-fonarev-story)\.(mp4|webm|webp)|photo-0[1-9]\.webp)$/.test(filename)
    : isProgramMedia
    ? /^(awards-(nominees|ciara)\.mp4|(nancy-isime-supplied|ciara-supplied|rosina-peace-supplied)\.(mp4|webp)|(fashion-knight-2026|awards-rosina-2027)\.(mp4|webm|webp))$/.test(filename)
    : /^(reel-[123]\.(mp4|webp)|(we-are-one-2026|movement-vision-2026|movement-together-2026)\.(mp4|webm|webp))$/.test(filename);
  if (!allowed) {
    res.sendStatus(404);
    return;
  }
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) {
    res.sendStatus(503);
    return;
  }
  try {
    const folder = isPortrait ? "people" : isNominee ? "nominee-videos" : isEditorialMedia ? "editorial-media" : isHumanitarianMedia ? "humanitarian-media" : isProgramMedia ? "program-media" : "home-reels";
    const type = filename.endsWith(".webm") ? "video/webm" : filename.endsWith(".mp4") ? "video/mp4" : "image/webp";
    await streamStoredObject(req, res, `/${bucket}/public/${folder}/${filename}`, type, { maxAge: 86400 });
  } catch (error) {
    req.log.error({ err: error }, "Curated media unavailable");
    if (!res.headersSent) res.sendStatus(502);
  }
});

export default router;
