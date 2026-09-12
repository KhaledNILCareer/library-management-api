import mongoose from "mongoose";

import Borrow, { LOAN_PERIOD_DAYS } from "./borrow.model.js";
import Book from "../books/book.model.js";

const httpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const syncOverdueBorrows = async (userId = null) => {
    const filter = {
        status: "Borrowed",
        dueDate: { $lt: new Date() }
    };

    if (userId) {
        filter.user = userId;
    }

    await Borrow.updateMany(
        filter,
        { status: "Overdue" }
    );
};


export const borrowBook = async (userId, bookId) => {
    if (!validateObjectId(userId)) {
        throw httpError(400, "Invalid user ID");
    }

    if (!validateObjectId(bookId)) {
        throw httpError(400, "Invalid book ID");
    }

    const session = await mongoose.startSession();

    try {
        let createdBorrow;

        await session.withTransaction(async () => {
            const book = await Book.findById(bookId).session(session);

            if (!book) {
                throw httpError(404, "Book not found");
            }

            const activeBorrow = await Borrow.findOne({
                user: userId,
                book: bookId,
                status: { $in: ["Borrowed", "Overdue"] }
            }).session(session);

            if (activeBorrow) {
                throw httpError(409, "Duplicate active borrowing");
            }

            const updatedBook = await Book.findOneAndUpdate(
                {
                    _id: bookId,
                    availableCopies: { $gt: 0 }
                },
                {
                    $inc: { availableCopies: -1 }
                },
                {
                    returnDocument: "after",
                    session
                }
            );

            if (!updatedBook) {
                throw httpError(409, "No available book copies");
            }

            const dueDate = new Date(
                Date.now() +
                LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000
            );

            const borrows = await Borrow.create(
                [
                    {
                        book: bookId,
                        user: userId,
                        dueDate,
                        status: "Borrowed"
                    }
                ],
                { session }
            );

            createdBorrow = borrows[0];
        });

        return createdBorrow;
    } finally {
        await session.endSession();
    }
};


export const returnBorrow = async (borrowId, currentUser) => {
    if (!validateObjectId(borrowId)) {
        throw httpError(400, "Invalid borrow ID");
    }

    const session = await mongoose.startSession();

    try {
        let returnedBorrow;

        await session.withTransaction(async () => {
            const borrow = await Borrow.findById(borrowId).session(session);

            if (!borrow) {
                throw httpError(404, "Borrow record not found");
            }

            if (
                currentUser.role === "member" &&
                borrow.user.toString() !== currentUser._id.toString()
            ) {
                throw httpError(
                    403,
                    "You can only return your own borrowings"
                );
            }

            if (borrow.status === "Returned") {
                throw httpError(409, "Borrowing already returned");
            }

            const updatedBook = await Book.findOneAndUpdate(
                {
                    _id: borrow.book,
                    $expr: {
                        $lt: ["$availableCopies", "$totalCopies"]
                    }
                },
                {
                    $inc: { availableCopies: 1 }
                },
                {
                    returnDocument: "after",
                    session
                }
            );

            if (!updatedBook) {
                const bookExists = await Book.exists({
                    _id: borrow.book
                }).session(session);

                if (!bookExists) {
                    throw httpError(404, "Book not found");
                }

                throw httpError(
                    409,
                    "Book copy counts are already at maximum"
                );
            }

            borrow.returnDate = new Date();
            borrow.status = "Returned";

            await borrow.save({ session });

            returnedBorrow = borrow;
        });

        return returnedBorrow;
    } finally {
        await session.endSession();
    }
};


export const getMyBorrows = async (userId) => {
    if (!validateObjectId(userId)) {
        throw httpError(400, "Invalid user ID");
    }

    await syncOverdueBorrows(userId);

    const borrows = await Borrow.find({
        user: userId
    })
        .populate("book", "title ISBN")
        .sort({ borrowDate: -1 });

    return borrows;
};


export const getAllBorrows = async (query = {}) => {
    await syncOverdueBorrows();

    const filter = {};

    if (query.status) {
        const allowedStatuses = [
            "Borrowed",
            "Returned",
            "Overdue"
        ];

        if (!allowedStatuses.includes(query.status)) {
            throw httpError(400, "Invalid borrow status");
        }

        filter.status = query.status;
    }

    if (query.userId) {
        if (!validateObjectId(query.userId)) {
            throw httpError(400, "Invalid user ID");
        }

        filter.user = query.userId;
    }

    if (query.bookId) {
        if (!validateObjectId(query.bookId)) {
            throw httpError(400, "Invalid book ID");
        }

        filter.book = query.bookId;
    }

    const borrows = await Borrow.find(filter)
        .populate("book", "title ISBN")
        .populate("user", "name email role")
        .sort({ borrowDate: -1 });

    return borrows;
};


export const getBorrowById = async (borrowId, currentUser) => {
    if (!validateObjectId(borrowId)) {
        throw httpError(400, "Invalid borrow ID");
    }

    await syncOverdueBorrows();

    const borrow = await Borrow.findById(borrowId)
        .populate("book", "title ISBN")
        .populate("user", "name email role");

    if (!borrow) {
        throw httpError(404, "Borrow record not found");
    }

    if (
        currentUser.role === "member" &&
        borrow.user._id.toString() !== currentUser._id.toString()
    ) {
        throw httpError(
            403,
            "You can only view your own borrowings"
        );
    }

    return borrow;
};
