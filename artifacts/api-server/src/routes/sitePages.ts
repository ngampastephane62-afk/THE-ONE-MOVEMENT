import { Router } from "express";
import { actor, networkAuth, networkWrite, requireFounder } from "../services/networkAuth";
import { editablePageKey, sitePageDocument, saveSiteCopy } from "../services/sitePages";

const router = Router();
router.get("/site-pages/:pageKey", async (req, res) => {
  res.set("Cache-Control", "no-store").json(await sitePageDocument(editablePageKey(req.params.pageKey)));
});
router.get("/founder/site-pages/:pageKey", networkAuth, async (req, res) => {
  requireFounder(res);
  res.set({ "Cache-Control": "private,no-store", "X-Robots-Tag": "noindex,nofollow", Vary: "Cookie, Authorization" })
    .json(await sitePageDocument(editablePageKey(req.params.pageKey), true));
});
router.put("/founder/site-pages/:pageKey", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private,no-store")
    .json(await saveSiteCopy(editablePageKey(req.params.pageKey), req.body, actor(res, false).clerkId));
});
export default router;
