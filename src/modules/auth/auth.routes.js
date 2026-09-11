import { Router } from "express";
import { register, getMe, logout, login } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;