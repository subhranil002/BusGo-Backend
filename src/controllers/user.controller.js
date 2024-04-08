import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail, validateEmail } from "../utils/sendMail.js";
import generateAccessAndRefreshToken from "../utils/generateTokens.js";

export const sendOTP = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ApiError("Email is required", 400);
        }

        if (!validateEmail(email)) {
            throw new ApiError("Invalid email", 400);
        }

        const isUserExists = await User.findOne({ email });

        if (isUserExists) {
            throw new ApiError("User already exists", 400);
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const isOtpObjectExists = await Otp.findOne({ email });

        if (isOtpObjectExists) {
            isOtpObjectExists.otp = otp;
            await isOtpObjectExists.save();
        } else {
            await Otp.create({ email, otp });
        }

        const response = await sendEmail(email, otp);

        if (!response) {
            throw new ApiError("Failed to send OTP", 400);
        }

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
        const { name, email, otp, password } = req.body;

        if (!name || !email || !otp || !password) {
            throw new ApiError("All fields are required", 400);
        }

        if (!validateEmail(email)) {
            throw new ApiError("Invalid email", 400);
        }

        if (password.length < 8) {
            throw new ApiError("Password must be at least 8 characters", 400);
        }

        const isOtpObjectExists = await Otp.findOne({ email });

        if (!isOtpObjectExists) {
            throw new ApiError("Unauthorized request", 400);
        }

        if (isOtpObjectExists.otp != otp) {
            throw new ApiError("Invalid OTP", 400);
        }

        const newUser = await User.create({ name, email, password });

        const user = await User.findById(newUser._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError("Error while creating user", 404);
        }

        await Otp.findByIdAndDelete(isOtpObjectExists._id);

        return res
            .status(200)
            .json(new ApiResponse("User created successfully", user));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: register :: ${error}`, 500)
        );
    }
});

export const login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError("All fields are required", 400);
        }

        if (password.length < 8) {
            throw new ApiError("Password must be at least 8 characters", 400);
        }

        if (!validateEmail(email)) {
            throw new ApiError("Invalid email or password", 400);
        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new ApiError("Invalid email or password", 404);
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            throw new ApiError("Invalid email or password", 400);
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user);

        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        user.password = undefined;
        user.refreshToken = undefined;

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse("Login successful", user));
    } catch (error) {
        return next(new ApiError(`user.controller :: login :: ${error}`, 500));
    }
});
