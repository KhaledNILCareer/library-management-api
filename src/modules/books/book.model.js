import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Book title is required"],
        trim: true
    },

    description: {
        type: String,
        required: [true, "Book description is required"],
        trim: true
    },

    ISBN: {
        type: String,
        required: [true, "ISBN is required"],
        unique: true,
        trim: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: [true, "Book author is required"]
    },

    category: {
        type: String,
        required: [true, "Book category is required"],
        trim: true
    },

    totalCopies: {
        type: Number,
        required: [true, "Total copies are required"],
        min: [0, "Total copies cannot be negative"],
        validate:{
            validator: Number.isInteger,
            message: "Total copies must be an integer"
        }
    },

    availableCopies: {
        type: Number,
        required: [true, "Available copies are required"],
        min: [0, "Available  copies cannot be negative"],
        validate:{
            validator: Number.isInteger,
            message: "Available copies must be an integer"
        }
    }
}, {
    timestamps: true
});

bookSchema.pre("validate", function () {
    if (this.availableCopies > this.totalCopies) {
        this.invalidate(
            "availableCopies",
            "Available copies cannot exceed total copies"
        );
    }
});

const Book = mongoose.model("Book", bookSchema);

export default Book;