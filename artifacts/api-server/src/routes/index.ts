import { Router, type IRouter } from "express";
import healthRouter from "./health";
import joinInterestRouter from "./joinInterest";
import institutionalInquiryRouter from "./institutionalInquiry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(joinInterestRouter);
router.use(institutionalInquiryRouter);

export default router;
