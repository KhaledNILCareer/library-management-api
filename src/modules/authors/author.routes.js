import { Router } from "express";
import { createAuthor } from "./author.controller.js";

const router = Router();

router.post("/", createAuthor);

export default router;