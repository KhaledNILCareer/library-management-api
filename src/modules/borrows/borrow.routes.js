import { Router } from "express";
import {
  borrowBook,
  returnBook,
  getMyBorrows,
  getBorrows,
  getBorrowById,
} from "./borrow.controller.js";

const router = Router();

router.get("/my", getMyBorrows);
router.post("/:id/return", returnBook);
router.get("/", getBorrows);
router.get("/:id", getBorrowById);

export default router;
