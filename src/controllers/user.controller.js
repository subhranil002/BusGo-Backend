import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail, validateEmail } from "../utils/sendMail.js";
import generateAccessAndRefreshToken from "../utils/generateTokens.js";

export const sendOTP = asyncHandler(async (req, res, next) => {
    try {
        // Get email
        const { email } = req.body;

        // Validate input
        if (!email) {
            throw new ApiError("Email is required", 400);
        }

        // Validate email format
        if (!validateEmail(email)) {
            throw new ApiError("Invalid email", 400);
        }

        // Check if user exists
        const isUserExists = await User.findOne({ email });
        if (isUserExists) {
            throw new ApiError("User already exists", 400);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Save or update OTP record
        await Otp.findOneAndUpdate({ email }, { email, otp }, { upsert: true });

        // Send OTP
        const response = await sendEmail(email, otp);

        // If OTP not sent
        if (!response) {
            throw new ApiError("Failed to send OTP", 400);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("OTP sent successfully", {}));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: sendOTP :: ${error}`, 500)
        );
    }
});

export const register = asyncHandler(async (req, res, next) => {
    try {
        // Get user details
        const { name, email, otp, password } = req.body;

        // Validate input fields
        if (!name || !email || !otp || !password) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate email
        if (!validateEmail(email)) {
            throw new ApiError("Invalid email", 400);
        }

        // Validate password
        if (password.length < 8) {
            throw new ApiError("Password must be at least 8 characters", 400);
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError("User already exists", 400);
        }

        // Check if OTP record exists
        const otpRecord = await Otp.findOne({ email });

        // If OTP doesn't match
        if (otpRecord?.otp != otp) {
            throw new ApiError("Invalid OTP", 400);
        }

        // Create user
        const newUser = await User.create({ name, email, password });

        // Check if user created
        const createdUser = await User.findById(newUser._id);
        if (!createdUser) {
            throw new ApiError("Error while creating user", 404);
        }

        // Delete OTP record
        await Otp.findByIdAndDelete(otpRecord._id);

        // Send response
        return res
            .status(200)
            .json(
                new ApiResponse("User created successfully, Please login", {})
            );
    } catch (error) {
        return next(
            new ApiError(`user.controller :: register :: ${error}`, 500)
        );
    }
});

export const login = asyncHandler(async (req, res, next) => {
    try {
        // Get email and password
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate password
        if (password.length < 8) {
            throw new ApiError("Password must be at least 8 characters", 400);
        }

        // Validate email
        if (!validateEmail(email)) {
            throw new ApiError("Invalid email or password", 400);
        }

        // Check if user exists
        const isExists = await User.findOne({ email });
        if (!isExists) {
            throw new ApiError("Invalid email or password", 404);
        }

        // Check if password is correct
        const isPasswordCorrect = await isExists.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError("Invalid email or password", 400);
        }

        // Generate access and refresh token
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(isExists);

        // Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        // Send response
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse("Login successful", {}));
    } catch (error) {
        return next(new ApiError(`user.controller :: login :: ${error}`, 500));
    }
});

export const logout = asyncHandler(async (req, res, next) => {
    try {
        // Clear cookies
        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(new ApiResponse("Logout successful", {}));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: logout :: ${error}`, 500)
        );
    }
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
    try {
        // Get user id from cookie
        const userId = req.user._id;
        if (!userId) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Get user details
        const user = await User.findById(userId).select(
            "_id name email avatar"
        );

        // Check if user exists
        if (!user) {
            throw new ApiError("User not found", 404);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Profile fetched successfully", user));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: getProfile :: ${error}`, 500)
        );
    }
});
