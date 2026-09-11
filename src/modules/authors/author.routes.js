import { Router } from "express";
import { 
  createAuthor, 
  getAuthors, 
  updateAuthor,
  getAuthorById,
  deleteAuthor } from "./author.controller.js";

const router = Router();

router.post("/", createAuthor);
router.get("/", getAuthors);
router.get("/:id", getAuthorById);
router.patch("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);

export default router;