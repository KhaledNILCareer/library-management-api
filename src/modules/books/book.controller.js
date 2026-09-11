import mongoose from "mongoose";
import Book from "./book.model.js";
import Author from "../authors/author.model.js";

const normalizeIsbn = (isbn) => {
    return String(isbn).replace(/[-\s]/g, "").trim();
};

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const createBook = async(req, res, next) => {
    try {
        const {
            title,
            author,
            isbn,
            publishedYear,
            totalCopies,
            availableCopies
        } = req.body;

        if (!title ||
            !author ||
            !isbn ||
            publishedYear === undefined ||
            totalCopies === undefined ||
            availableCopies === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All book fields are required"
            });
        }

        if (!validateObjectId(author)) {
            return res.status(400).json({
                success: false,
                message: "Invalid author ID"
            });
        }

        const existingAuthor = await Author.findById(author);

        if (!existingAuthor) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        const normalizedIsbn = normalizeIsbn(isbn);

        const existingBook = await Book.findOne({
            isbn: normalizedIsbn
        });

        if (existingBook) {
            return res.status(409).json({
                success: false,
                message: "A book with this ISBN already exists"
            });
        }

        if (availableCopies > totalCopies) {
            return res.status(400).json({
                success: false,
                message: "Available copies cannot exceed total copies"
            });
        }

        const book = await Book.create({
            title,
            author,
            isbn: normalizedIsbn,
            publishedYear,
            totalCopies,
            availableCopies
        });

        const populatedBook = await book.populate("author", "name biography");

        return res.status(201).json({
            success: true,
            message: "Book created successfully",
            data: populatedBook
        });
    } catch (error) {
        next(error);
    }
};

export const getBooks = async(req, res, next) => {
    try {
        const {
            page = 1,
                limit = 10,
                search,
                author,
                available
        } = req.query;

        const currentPage = Math.max(Number(page), 1);
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100);

        const filter = {};

        if (search) {
            filter.$or = [{
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    isbn: {
                        $regex: normalizeIsbn(search),
                        $options: "i"
                    }
                }
            ];
        }

        if (author) {
            if (!validateObjectId(author)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid author ID"
                });
            }

            filter.author = author;
        }

        if (available === "true") {
            filter.availableCopies = {
                $gt: 0
            };
        }

        if (available === "false") {
            filter.availableCopies = 0;
        }

        const skip = (currentPage - 1) * currentLimit;

        const [books, totalBooks] = await Promise.all([
            Book.find(filter)
            .populate("author", "name biography")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(currentLimit),

            Book.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: books,
            pagination: {
                currentPage,
                limit: currentLimit,
                totalBooks,
                totalPages: Math.ceil(totalBooks / currentLimit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id).populate(
            "author",
            "name biography"
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};

export const updateBook = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const allowedFields = [
            "title",
            "author",
            "isbn",
            "publishedYear",
            "totalCopies",
            "availableCopies"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.author) {
            if (!validateObjectId(updates.author)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid author ID"
                });
            }

            const authorExists = await Author.findById(updates.author);

            if (!authorExists) {
                return res.status(404).json({
                    success: false,
                    message: "Author not found"
                });
            }
        }

        if (updates.isbn) {
            updates.isbn = normalizeIsbn(updates.isbn);

            const isbnExists = await Book.findOne({
                isbn: updates.isbn,
                _id: {
                    $ne: id
                }
            });

            if (isbnExists) {
                return res.status(409).json({
                    success: false,
                    message: "A book with this ISBN already exists"
                });
            }
        }

        const nextTotalCopies =
            updates.totalCopies ? updates.totalCopies : book.totalCopies;

        const nextAvailableCopies =
            updates.availableCopies ? updates.availableCopies : book.availableCopies;

        if (nextAvailableCopies > nextTotalCopies) {
            return res.status(400).json({
                success: false,
                message: "Available copies cannot exceed total copies"
            });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            updates, {
                new: true,
                runValidators: true
            }
        ).populate("author", "name biography");

        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: updatedBook
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBook = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.availableCopies < book.totalCopies) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a book while copies are borrowed"
            });
        }

        await Book.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};