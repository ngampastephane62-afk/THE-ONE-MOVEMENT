import { Router } from "express";
import { objectFile } from "../services/networkFiles";

const router = Router();
const allowed = new Set(Array.from({ length: 10 }, (_, index) => `${String(index + 1).padStart(2, "0")}.webp`));
const cache = new Map<string, Promise<Buffer>>();

router.get("/official-meetings/photos/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!allowed.has(filename)) return void res.sendStatus(404);
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) return void res.sendStatus(503);
  try {
    let download = cache.get(filename);
    if (!download) {
      download = objectFile(`/${bucket}/public/official-meetings/${filename}`).download()
        .then(([bytes]) => bytes).catch(error => { cache.delete(filename); throw error; });
      cache.set(filename, download);
    }
    const bytes = await download;
    if (!res.destroyed) res.set({ "Content-Type": "image/webp", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" }).send(bytes);
  } catch {
    if (!res.destroyed) res.sendStatus(503);
  }
});

export default router;
