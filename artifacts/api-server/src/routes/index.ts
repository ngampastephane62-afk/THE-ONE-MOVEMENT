import { Router, type IRouter } from "express";
import healthRouter from "./health";
import joinInterestRouter from "./joinInterest";
import institutionalInquiryRouter from "./institutionalInquiry";
import homeReelsRouter from "./homeReels";
import memberRouter from "./member";
import networkRouter from "./network";

const router: IRouter = Router();

router.use(healthRouter);
router.use(joinInterestRouter);
router.use(institutionalInquiryRouter);
router.use(homeReelsRouter);
router.use(memberRouter);
router.use(networkRouter);

export default router;
