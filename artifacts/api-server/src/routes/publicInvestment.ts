import { Router } from "express";
import { NetworkError } from "../services/networkAuth";
import { streamStoredObject } from "../services/storedObjectStream";

const router = Router();
// A separate owner-approved PUBLIC copy; restricted member documents stay restricted.
router.get(["/investment/presentation/:filename", "/partnership/presentation/:filename"], async (req, res) => {
  const name = String(req.params.filename);
  if (!/^(presentation\.pdf|page-(0[1-9]|1[0-8])\.jpg)$/.test(name)) return void res.sendStatus(404);
  const folder = req.path.startsWith("/partnership/") ? "partnership-presentation" : "investment-presentation";
  const key = `${folder}/${name}`;
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) throw new NetworkError(503, "The investment presentation is unavailable.");
  if (name.endsWith(".pdf")) res.set("Content-Disposition", `inline; filename="The-One-Movement-${folder}.pdf"`);
  await streamStoredObject(req, res, `/${bucket}/public/${key}`, name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
});
export default router;
