import Borrow, { LOAN_PERIOD_DAYS } from "./borrow.model.js";

// ============================================================
// NOTE (dependency): the Book model belongs to the Books module
// (SCRUM-28, Ahmed). Until it is merged into main the server
// cannot boot — the same is already true for the authors module
// on current main. Nothing in this file needs to change once the
// Book model lands; it only becomes testable.
// ============================================================
import Book from "../books/book.model.js";

// ============================================================
// Helper: create an error with an HTTP status code
// ------------------------------------------------------------
// The shared error middleware (src/middlewares/error.middleware.js)
// reads err.statusCode and sends it in the response.
// We throw errors from the service and let the controller pass
// them to the shared middleware with next(err).
// ============================================================
const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ============================================================
// Overdue strategy (team decision — documented in the PR)
// ------------------------------------------------------------
// We do NOT run a scheduled background job. Instead, every time
// we list borrows we "lazily" update records whose dueDate has
// passed while the book is still not returned:
//   status "Borrowed" + dueDate < now  →  status "Overdue"
// This is the simplest mechanism that fully satisfies the spec.
// ============================================================
const syncOverdueBorrows = async (userId = null) => {
  const filter = {
    status: "Borrowed",
    dueDate: { $lt: new Date() },
  };

  // Optional: limit the update to one member (used by /my)
  if (userId) {
    filter.user = userId;
  }

  await Borrow.updateMany(filter, { status: "Overdue" });
};

// ============================================================
// Business logic of the borrowing endpoints is written below
// (borrow / return / my history / records). Each function is
// one export used by borrow.controller.js.
// ============================================================

// ============================================================
// Borrow a book (SCRUM-37)
// ------------------------------------------------------------
// Steps:
// 1) The book must exist                → 404
// 2) The member must not have an active borrow for the same book
//    (duplicate active borrowing)       → 409
// 3) A copy must be available           → 409
//    We decrement availableCopies with ONE atomic update:
//    findOneAndUpdate({ availableCopies: { $gt: 0 } }, $inc: -1)
//    The filter + update happen together on the database, so two
//    members borrowing the LAST copy at the same time cannot both
//    succeed (this is called avoiding a race condition).
// 4) Create the Borrow record with dueDate = now + 14 days
// ============================================================
export const borrowBook = async (userId, bookId) => {
  // 1) Book must exist
  const book = await Book.findById(bookId);
  if (!book) {
    throw httpError(404, "Book not found");
  }

  // 2) Duplicate active borrowing check
  // (status "Borrowed" or "Overdue" both mean the book is still out)
  const activeBorrow = await Borrow.findOne({
    user: userId,
    book: bookId,
    status: { $in: ["Borrowed", "Overdue"] },
  });
  if (activeBorrow) {
    throw httpError(409, "Duplicate active borrowing");
  }

  // 3) Atomic decrement of the available copy
  const updatedBook = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true } // return the updated document
  );
  if (!updatedBook) {
    // The book exists but no copy was available
    throw httpError(409, "No available book copies");
  }

  // 4) Create the borrowing record
  const dueDate = new Date(Date.now() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const borrow = await Borrow.create({
    book: bookId,
    user: userId,
    dueDate,
    status: "Borrowed",
  });

  return borrow;
};

// ============================================================
// Return a book (SCRUM-38)
// ------------------------------------------------------------
// Steps:
// 1) The borrowing record must exist    → 404
// 2) Ownership: a member can only return their OWN borrowing → 403
//    (Admin / Librarian can return on behalf of members — team
//     decision, because the librarian manages borrow/return)
// 3) Returning an already returned borrowing → 409
// 4) Set returnDate + status, give the copy back (+1)
// ============================================================
export const returnBorrow = async (borrowId, currentUser) => {
  // 1) Record must exist
  const borrow = await Borrow.findById(borrowId);
  if (!borrow) {
    throw httpError(404, "Borrow record not found");
  }

  // 2) Ownership check
  // borrow.user is an ObjectId, currentUser.id is a string,
  // so we compare with .toString()
  if (
    currentUser.role === "member" &&
    borrow.user.toString() !== currentUser.id
  ) {
    throw httpError(403, "You can only return your own borrowings");
  }

  // 3) Already returned?
  if (borrow.status === "Returned") {
    throw httpError(409, "Borrowing already returned");
  }

  // 4) Update the record.
  // Note: if the member returns late (after dueDate) the status is
  // still "Returned" — the spec does not require a penalty flag.
  borrow.returnDate = new Date();
  borrow.status = "Returned";
  await borrow.save();

  // Give the copy back. If the book was deleted, this update
  // matches nothing and does nothing (safe).
  await Book.updateOne({ _id: borrow.book }, { $inc: { availableCopies: 1 } });

  return borrow;
};

// ============================================================
// Member borrowing history (SCRUM-39) — GET /api/borrows/my
// ------------------------------------------------------------
// Returns ONLY the records of the logged-in member, newest first.
// We populate the book so the response shows the title and ISBN
// instead of just the book ObjectId.
// ============================================================
export const getMyBorrows = async (userId) => {
  await syncOverdueBorrows(userId);

  const borrows = await Borrow.find({ user: userId })
    .populate("book", "title ISBN")
    .sort({ borrowDate: -1 }); // newest first

  return borrows;
};

// ============================================================
// Borrowing records (SCRUM-40) — GET /api/borrows
// ------------------------------------------------------------
// Admin / Librarian only (checked in the controller). Supports
// simple filters: /api/borrows?status=Borrowed&userId=...&bookId=...
// ============================================================
export const getAllBorrows = async (query = {}) => {
  await syncOverdueBorrows();

  // Build the filter from the query string
  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.userId) {
    filter.user = query.userId;
  }
  if (query.bookId) {
    filter.book = query.bookId;
  }

  const borrows = await Borrow.find(filter)
    .populate("book", "title ISBN")
    .populate("user", "name email")
    .sort({ borrowDate: -1 });

  return borrows;
};

// ============================================================
// Single borrowing record (SCRUM-40) — GET /api/borrows/:id
// ------------------------------------------------------------
// Admin / Librarian can view any record.
// A member can only view their own record → 403 otherwise.
// ============================================================
export const getBorrowById = async (borrowId, currentUser) => {
  await syncOverdueBorrows();

  const borrow = await Borrow.findById(borrowId)
    .populate("book", "title ISBN")
    .populate("user", "name email");

  if (!borrow) {
    throw httpError(404, "Borrow record not found");
  }

  if (
    currentUser.role === "member" &&
    borrow.user._id.toString() !== currentUser.id
  ) {
    throw httpError(403, "You can only view your own borrowings");
  }

  return borrow;
};
