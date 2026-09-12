import mongoose from "mongoose";

export const LOAN_PERIOD_DAYS = 14;

const borrowSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Borrowed", "Returned", "Overdue"],
      default: "Borrowed",
    },
  },
  {
    timestamps: true,
  }
);

borrowSchema.index({ book: 1, user: 1, status: 1 });

borrowSchema.pre("validate", function () {
    if (
        this.borrowDate &&
        this.dueDate &&
        this.dueDate <= this.borrowDate
    ) {
        this.invalidate(
            "dueDate",
            "Due date must be after borrow date"
        );
    }

    if (
        this.returnDate &&
        this.borrowDate &&
        this.returnDate < this.borrowDate
    ) {
        this.invalidate(
            "returnDate",
            "Return date cannot be before borrow date"
        );
    }
});

const Borrow = mongoose.model("Borrow", borrowSchema);

export default Borrow;
