import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { ApiError } from "../utils/appError.util.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next(new ApiError('You are not authorized', 401));
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ApiError('User belonging to this token no longer exists', 401));
        }
        req.user = user;
        next();

    } catch (err) {
        next(err);
    }
};


