import Borrow, { LOAN_PERIOD_DAYS } from "./borrow.model.js";
import Book from "../books/book.model.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const syncOverdueBorrows = async (userId = null) => {
  const filter = {
    status: "Borrowed",
    dueDate: { $lt: new Date() },
  };

  if (userId) {
    filter.user = userId;
  }

  await Borrow.updateMany(filter, { status: "Overdue" });
};

export const borrowBook = async (userId, bookId) => {
  const book = await Book.findById(bookId);
  if (!book) {
    throw httpError(404, "Book not found");
  }

  const activeBorrow = await Borrow.findOne({
    user: userId,
    book: bookId,
    status: { $in: ["Borrowed", "Overdue"] },
  });
  if (activeBorrow) {
    throw httpError(409, "Duplicate active borrowing");
  }

  const updatedBook = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { returnDocument: "after" }
  );
  if (!updatedBook) {
    throw httpError(409, "No available book copies");
  }

  const dueDate = new Date(Date.now() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const borrow = await Borrow.create({
    book: bookId,
    user: userId,
    dueDate,
    status: "Borrowed",
  });

  return borrow;
};

export const returnBorrow = async (borrowId, currentUser) => {
  const borrow = await Borrow.findById(borrowId);
  if (!borrow) {
    throw httpError(404, "Borrow record not found");
  }

  if (
    currentUser.role === "member" &&
    borrow.user.toString() !== currentUser.id
  ) {
    throw httpError(403, "You can only return your own borrowings");
  }

  if (borrow.status === "Returned") {
    throw httpError(409, "Borrowing already returned");
  }

  borrow.returnDate = new Date();
  borrow.status = "Returned";
  await borrow.save();

  await Book.updateOne({ _id: borrow.book }, { $inc: { availableCopies: 1 } });

  return borrow;
};

export const getMyBorrows = async (userId) => {
  await syncOverdueBorrows(userId);

  const borrows = await Borrow.find({ user: userId })
    .populate("book", "title ISBN")
    .sort({ borrowDate: -1 });

  return borrows;
};

export const getAllBorrows = async (query = {}) => {
  await syncOverdueBorrows();

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
