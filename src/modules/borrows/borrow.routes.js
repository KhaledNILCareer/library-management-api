import { Router } from "express";

import {
    returnBook,
    getMyBorrows,
    getBorrows,
    getBorrowById
} from "./borrow.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/my", getMyBorrows);
router.post("/:id/return", returnBook);
router.get("/", getBorrows);
router.get("/:id", getBorrowById);

export default router;
