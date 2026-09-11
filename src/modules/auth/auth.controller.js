import User from '../users/user.model.js';
import { ApiError } from "../../utils/appError.util.js";
import generateToken from "../../utils/generateToken.util.js";

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ApiError("Please provide email and password", 400));
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return next(new ApiError('User is not found or incorrect password', 401));
        }
        user.password = undefined;
        const accessToken = generateToken(user);
        res.status(200).json({
            message: 'User logged in successfully',
            user,
            token: accessToken
        });
    } catch (err) {
        next(err);
    }
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return next(new ApiError('Please provide name, email and password', 400));
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError('User already exists', 409));
        }
        const user = await User.create({ name, email, password });
        user.password = undefined;
        const accessToken = generateToken(user);
        res.status(201).json({ message: 'User signed up successfully', user: user, token: accessToken });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (err) {
        next(err);
    }
};

