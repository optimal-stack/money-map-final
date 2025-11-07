import express from "express";
import {
  getCategoryBreakdown,
  getSpendingTrends,
  getTopCategories,
  getMonthlyComparison,
  getAnalyticsDashboard,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/dashboard/:userId", getAnalyticsDashboard);
router.get("/category-breakdown/:userId", getCategoryBreakdown);
router.get("/trends/:userId", getSpendingTrends);
router.get("/top-categories/:userId", getTopCategories);
router.get("/monthly-comparison/:userId", getMonthlyComparison);

export default router;

