import { Router, type IRouter } from "express";
import healthRouter from "./health";
import joinInterestRouter from "./joinInterest";
import institutionalInquiryRouter from "./institutionalInquiry";
import homeReelsRouter from "./homeReels";
import memberRouter from "./member";
import networkRouter from "./network";
import mediaRequestsRouter from "./mediaRequests";
import newsArchiveRouter from "./newsArchive";
import humanitarianRouter from "./humanitarian";

const router: IRouter = Router();

router.use(healthRouter);
router.use(joinInterestRouter);
router.use(institutionalInquiryRouter);
router.use(homeReelsRouter);
router.use(memberRouter);
router.use(networkRouter);
router.use(mediaRequestsRouter);
router.use(newsArchiveRouter);
router.use(humanitarianRouter);

export default router;
