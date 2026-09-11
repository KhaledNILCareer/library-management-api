import * as borrowService from "./borrow.service.js";

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

export const getBorrows = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

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
