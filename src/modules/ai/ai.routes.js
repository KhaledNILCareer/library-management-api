import express from "express";

import { summarizeBookController } from "./ai.controller.js";

const router = express.Router();

router.post("/summarize-book", summarizeBookController);

export default router;