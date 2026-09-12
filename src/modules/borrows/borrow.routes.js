import { Router } from "express";

import {
    returnBook,
    getMyBorrows,
    getBorrows,
    getBorrowById
} from "./borrow.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
    "/my",
    authorizeRole("member"),
    getMyBorrows
);

router.post(
    "/:id/return",
    authorizeRole("member", "librarian"),
    returnBook
);

router.get(
    "/",
    authorizeRole("admin", "librarian"),
    getBorrows
);

router.get(
    "/:id",
    authorizeRole("admin", "librarian"),
    getBorrowById
);

export default router;