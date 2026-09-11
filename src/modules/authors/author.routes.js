import { Router } from "express";
import { 
  createAuthor, 
  getAuthors, 
  updateAuthor,
  getAuthorById } from "./author.controller.js";

const router = Router();

router.post("/", createAuthor);
router.get("/", getAuthors);
router.get("/:id", getAuthorById);
router.patch("/:id", updateAuthor);

export default router;