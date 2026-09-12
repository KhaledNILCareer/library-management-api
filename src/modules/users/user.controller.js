import mongoose from "mongoose";

import User from "./user.model.js";

import { ApiError } from "../../utils/appError.util.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Users retrieved successfully",
            data: users
        });
    } catch (err) {
        next(err);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ApiError("Invalid user ID", 400));
        }

        if (!role) {
            return next(new ApiError("Role is required", 400));
        }

        const allowedRoles = ["admin", "librarian", "member"];

        if (!allowedRoles.includes(role)) {
            return next(
                new ApiError(
                    "Role must be admin, librarian, or member",
                    400
                )
            );
        }

        if (req.user._id.toString() === id) {
            return next(
                new ApiError(
                    "You cannot change your own role",
                    400
                )
            );
        }

        const user = await User.findById(id);

        if (!user) {
            return next(new ApiError("User not found", 404));
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            message: "User role updated successfully",
            data: user
        });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ApiError("Invalid user ID", 400));
        }

        if (req.user._id.toString() === id) {
            return next(
                new ApiError(
                    "You cannot delete your own account",
                    400
                )
            );
        }

        const user = await User.findById(id);

        if (!user) {
            return next(new ApiError("User not found", 404));
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};