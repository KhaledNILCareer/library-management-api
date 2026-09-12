import { ApiError } from "../utils/appError.util.js";

export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new ApiError('You are not authorized', 401))
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new ApiError('You do not have permission to access this resource', 403))
        }
        next();
    }
}
