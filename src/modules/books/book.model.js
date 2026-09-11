import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Book title is required"],
        trim: true,
        minlength: [2, "Book title must be at least 2 characters"],
        maxlength: [200, "Book title cannot exceed 200 characters"]
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: [true, "Book author is required"]
    },

    isbn: {
        type: String,
        required: [true, "ISBN is required"],
        unique: true,
        trim: true
    },

    publishedYear: {
        type: Number,
        required: [true, "Published year is required"],
        min: [0, "Published year cannot be negative"],
        max: [new Date().getFullYear(), "Published year cannot be in the future"]
    },

    totalCopies: {
        type: Number,
        required: [true, "Total copies are required"],
        min: [1, "Total copies must be at least 1"]
    },

    availableCopies: {
        type: Number,
        required: [true, "Available copies are required"],
        min: [0, "Available copies cannot be negative"]
    }
}, {
    timestamps: true
});

bookSchema.pre("validate", function(next) {
    if (this.availableCopies > this.totalCopies) {
        return next(new Error("Available copies cannot exceed total copies"));
    }

    next();
});

const Book = mongoose.model("Book", bookSchema);

export default Book;