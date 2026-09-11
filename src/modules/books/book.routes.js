import { Router } from "express";
import { borrowBook } from "../borrows/borrow.controller.js";


const router = Router();

// ============================================================
// SHARED FILE (owned by the Books module — Ahmed, SCRUM-28+)
// ------------------------------------------------------------
// This route is added by the Borrowing module (Amr, SCRUM-37).
// The path /api/books/:id/borrow starts with /api/books, so it
// must live in the books router, but its logic belongs to the
// borrows module. Disclosed in the Pull Request per
// docs/DEVELOPMENT.md section 12 (Shared Files).
// ============================================================
router.post("/:id/borrow", borrowBook);

export default router;
