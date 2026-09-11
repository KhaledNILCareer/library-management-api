import { Router } from "express";
import { 
  createAuthor, 
  getAuthors, 
  updateAuthor,
  getAuthorById,
  deleteAuthor
} from "./author.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, getAuthors);
router.get("/:id", authenticate, getAuthorById);

router.post(
  "/",
  authenticate,
  authorizeRole("admin", "librarian"),
  createAuthor
);

router.patch(
  "/:id",
  authenticate,
  authorizeRole("admin", "librarian"),
  updateAuthor
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole("admin", "librarian"),
  deleteAuthor
);

export default router;
