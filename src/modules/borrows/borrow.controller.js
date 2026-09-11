import * as borrowService from "./borrow.service.js";

// ============================================================
// Controllers are THIN: they read the request, call the service
// (where the business logic lives) and send the response.
// All errors are passed to the shared error middleware with
// next(err) — we never send error responses directly here.
// ============================================================

// ============================================================
// POST /api/books/:id/borrow  (SCRUM-37)
// ------------------------------------------------------------
// req.params.id = the book id (the :id part of the URL)
// req.user.id   = the logged-in member (from the JWT)
//
// NOTE (temporary): until the shared auth middleware
// (SCRUM-25, auth module) is merged, we do a simple manual
// guard — no token means no req.user means 401.
// When protect() lands this guard can be removed.
// ============================================================
export const borrowBook = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const borrow = await borrowService.borrowBook(req.user.id, req.params.id);

    res.status(201).json({
      message: "Book borrowed successfully",
      data: borrow,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/borrows/:id/return  (SCRUM-38)
// req.params.id = the borrowing record id
// req.user      = { id, role } from the JWT payload
// ============================================================
export const returnBook = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const borrow = await borrowService.returnBorrow(req.params.id, req.user);

    res.status(200).json({
      message: "Book returned successfully",
      data: borrow,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/borrows/my  (SCRUM-39)
// Member's own borrowing history — no admin/librarian access
// needed, only the logged-in member's records are returned.
// ============================================================
export const getMyBorrows = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const borrows = await borrowService.getMyBorrows(req.user.id);

    res.status(200).json({
      message: "Borrowing history retrieved successfully",
      data: borrows,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/borrows  (SCRUM-40)
// All borrowing records — will be restricted to
// admin / librarian with the shared authorize middleware:
//   router.get("/", protect, authorize("admin", "librarian"), getBorrows);
// ============================================================
export const getBorrows = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Temporary manual role check until the shared
    // authorize middleware (SCRUM-26) is merged into main.
    if (req.user.role === "member") {
      return res.status(403).json({
        message: "Only admin and librarian can view borrowing records",
      });
    }

    const borrows = await borrowService.getAllBorrows(req.query);

    res.status(200).json({
      message: "Borrowing records retrieved successfully",
      data: borrows,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/borrows/:id  (SCRUM-40)
// One record: admin/librarian can view any,
// member can only view their own (checked in the service).
// ============================================================
export const getBorrowById = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role === "member") {
      return res.status(403).json({
        message: "Only admin and librarian can view borrowing records",
      });
    }

    const borrow = await borrowService.getBorrowById(req.params.id, req.user);

    res.status(200).json({
      message: "Borrow record retrieved successfully",
      data: borrow,
    });
  } catch (err) {
    next(err);
  }
};
