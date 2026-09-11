import mongoose from "mongoose";

// ============================================================
// Business rule: loan period
// ------------------------------------------------------------
// The project spec does not define how long a member can keep a
// borrowed book, so the team decision is 14 days.
// The due date is calculated from this constant:
//   dueDate = borrowDate + LOAN_PERIOD_DAYS
// If we ever need to change the loan period, we only change it here.
// ============================================================
export const LOAN_PERIOD_DAYS = 14;

// ============================================================
// Borrow model
// ------------------------------------------------------------
// One Borrow document = one book taken by one member.
// Exact field names are defined in docs/DEVELOPMENT.md
// (do NOT rename to bookId / userId / available...).
// ============================================================
const borrowSchema = new mongoose.Schema(
  {
    // Reference to the borrowed book (Book._id)
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    // Reference to the member who borrowed the book (User._id)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // When the book was taken (set automatically when the record is created)
    borrowDate: {
      type: Date,
      default: Date.now,
    },

    // When the book must be returned (borrowDate + 14 days)
    dueDate: {
      type: Date,
      required: true,
    },

    // When the book was actually returned.
    // Stays null while the book is still borrowed.
    returnDate: {
      type: Date,
      default: null,
    },

    // Borrowing status — exact values required by the project spec
    // ("Borrowed" = active loan, "Returned" = book given back,
    //  "Overdue" = still not returned but past dueDate)
    status: {
      type: String,
      enum: ["Borrowed", "Returned", "Overdue"],
      default: "Borrowed",
    },
  },
  {
    // Adds createdAt / updatedAt automatically
    timestamps: true,
  }
);

// ============================================================
// Compound index
// ------------------------------------------------------------
// Makes the "duplicate active borrowing" check fast, because the
// most frequent query is: find one borrow for the same
// book + user + active status.
// ============================================================
borrowSchema.index({ book: 1, user: 1, status: 1 });

const Borrow = mongoose.model("Borrow", borrowSchema);

export default Borrow;
