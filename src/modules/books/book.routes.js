import { Router } from "express";
import { borrowBook } from "../borrows/borrow.controller.js";

const router = Router();

router.post("/:id/borrow", borrowBook);

export default router;
