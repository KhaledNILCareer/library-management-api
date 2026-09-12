import { Router } from "express";

import {
    getUsers,
    updateUserRole,
    deleteUser
} from "./user.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.use(authorizeRole("admin"));

router.get("/", getUsers);

router.patch("/:id/role", updateUserRole);

router.delete("/:id", deleteUser);

export default router;
