import { Router } from "express";
import {
  borrowBook,
  returnBook,
  getMyBorrows,
  getBorrows,
  getBorrowById,
} from "./borrow.controller.js";

// ============================================================
// Borrowing routes — mounted on /api/borrows by src/app.js
//
// NOTE (authentication): when the auth module (SCRUM-25/26)
// is merged into main, EVERY route here gets the shared
// middlewares, for example:
//   router.post("/:id/return", protect, returnBook);
//   router.get("/", protect, authorize("admin", "librarian"), getBorrows);
// Until then the controllers do a manual guard (401/403)
// so the module already behaves correctly.
//
// Also note: POST /api/books/:id/borrow is registered inside
// src/modules/books/book.routes.js (shared file change —
// explained in the Pull Request).
// ============================================================


const router = Router();

router.get("/my", getMyBorrows);
router.post("/:id/return", returnBook);
router.get("/", getBorrows);
router.get("/:id", getBorrowById);

export default router;
