import { Router } from "express";

import {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook
} from "./book.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorizeRole("admin", "librarian"),
    createBook
);

router.get("/", getBooks);

router.get("/:id", getBookById);

router.patch(
    "/:id",
    authenticate,
    authorizeRole("admin", "librarian"),
    updateBook
);

router.delete(
    "/:id",
    authenticate,
    authorizeRole("admin", "librarian"),
    deleteBook
);

export default router;
