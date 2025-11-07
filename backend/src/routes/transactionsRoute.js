import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getSummaryByUserId,
  getTransactionsByUserId,
  getTransactionsByFestival,
  getFestivalSummary,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/:userId", getTransactionsByUserId);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/:userId", getSummaryByUserId);
router.get("/festival/:festival/:userId", getTransactionsByFestival);
router.get("/festival-summary/:festival/:userId", getFestivalSummary);

export default router;
