import { Router } from "express";

import {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook
} from "./book.controller.js";

const router = Router();

router.post("/", createBook);

router.get("/", getBooks);

router.get("/:id", getBookById);

router.patch("/:id", updateBook);

router.delete("/:id", deleteBook);

export default router;