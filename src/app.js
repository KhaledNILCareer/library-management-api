import "dotenv/config";
import express from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import authorRoutes from "./modules/authors/author.routes.js";
import bookRoutes from "./modules/books/book.routes.js";
import borrowRoutes from "./modules/borrows/borrow.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import userRoutes from "./modules/users/user.routes.js";

import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Library Management API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
