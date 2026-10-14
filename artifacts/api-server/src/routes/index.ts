import { Router, type IRouter } from "express";
import healthRouter from "./health";
import joinInterestRouter from "./joinInterest";
import institutionalInquiryRouter from "./institutionalInquiry";
import homeReelsRouter from "./homeReels";

const router: IRouter = Router();

router.use(healthRouter);
router.use(joinInterestRouter);
router.use(institutionalInquiryRouter);
router.use(homeReelsRouter);

export default router;
