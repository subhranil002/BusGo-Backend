import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail, validateEmail } from "../utils/sendMail.js";
import generateAccessAndRefreshToken from "../utils/generateTokens.js";
import {
    deleteLocalFiles,
    uploadImage,
    deleteImage
} from "../utils/fileHandler.js";
import jwt from "jsonwebtoken";
import constants from "../constants.js";

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
        const subject = `Your OTP for BusGo - ${otp} `;
        const html = `
            <h4>Dear User,</h4>
            <p>Your OTP for BusGo is <strong style="color: #007bff;">${otp}</strong></p>
            <p>Please use this OTP to complete your registration on BusGo. Please note that this OTP is valid for a single use and should not be shared with anyone else.</p>
            <p>If you did not request this OTP or have any concerns about the security of your account, please reach out to our support team immediately at busgo.project@gmail.com</p>
            <p>Thank you for choosing BusGo.</p>
            <p>Best regards,<br/>BusGo Team</p>
        `;
        const response = await sendEmail(email, subject, html);

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
        const { name, email, otp, password, busNumber, routeID, role } =
            req.body;

        // Validate input fields
        if (!name || !email || !otp || !password) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate role
        if (
            role &&
            role !== "CONDUCTOR" &&
            role !== "PASSENGER" &&
            role !== "ADMIN"
        ) {
            throw new ApiError("Invalid role", 400);
        } else if (role === "ADMIN") {
            throw new ApiError("Admin cannot register", 400);
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
        const newUser = await User.create({
            name,
            email,
            password
        });

        // Check if conductor
        if (role === "CONDUCTOR") {
            newUser.busNumber = busNumber;
            newUser.routeID = routeID;
            newUser.role = role;
        }
        await newUser.save();

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
        // Clear refresh token from database
        await User.findByIdAndUpdate(req.user._id, {
            $unset: {
                refreshToken: 1
            }
        });

        // Clear cookies
        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(new ApiResponse("Logout successful", {}));
    } catch (error) {
        return next(new ApiError(`user.controller :: logout :: ${error}`, 500));
    }
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
    try {
        // Get user details
        const user = await User.findById(req.user._id).select(
            "-password -bookingHistory -sellingHistory -refreshToken"
        );

        // Generate access and refresh token
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user);
        user.refreshToken = undefined;

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
            .json(new ApiResponse("Profile fetched successfully", user));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: getProfile :: ${error}`, 500)
        );
    }
});

export const changeAvatar = asyncHandler(async (req, res, next) => {
    try {
        // Get avatar file from request
        const avatarLocalPath = req.file ? req.file.path : "";

        // Check if avatar file is empty
        if (!avatarLocalPath) {
            deleteLocalFiles([avatarLocalPath]);
            throw new ApiError("No avatar file provided", 400);
        }

        // Find current user
        const user = await User.findById(req.user._id).select("avatar");
        if (!user) {
            deleteLocalFiles([avatarLocalPath]);
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Upload avatar to Cloudinary
        const newAvatar = await uploadImage(avatarLocalPath);
        if (!newAvatar.public_id || !newAvatar.secure_url) {
            deleteLocalFiles([avatarLocalPath]);
            throw new ApiError("Error uploading avatar", 400);
        }

        // Delete old avatar
        const result = await deleteImage(user.avatar.public_id);
        if (!result) {
            deleteImage(newAvatar.public_id);
            throw new ApiError("Error deleting old avatar", 400);
        }

        // Update user with new avatar
        const updatedAvatar = await User.findByIdAndUpdate(
            req.user._id,
            {
                avatar: {
                    public_id: newAvatar.public_id,
                    secure_url: newAvatar.secure_url
                }
            },
            { new: true }
        ).select("avatar");

        // Return updated user
        return res
            .status(200)
            .json(
                new ApiResponse("Avatar changed successfully", updatedAvatar)
            );
    } catch (error) {
        return next(
            new ApiError(`user.controller :: changeAvatar :: ${error}`, 500)
        );
    }
});

export const changePassword = asyncHandler(async (req, res, next) => {
    try {
        // Get old and new password from request
        const { oldPassword, newPassword } = req.body;

        // Check if any of the fields is empty
        if (!oldPassword || !newPassword) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate password
        if (oldPassword.length < 8 || newPassword.length < 8) {
            throw new ApiError("Password must be at least 8 characters", 400);
        }

        // Find current user
        const user = await User.findById(req.user._id).select("password");
        if (!user) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Check if old password is correct
        if (!(await user.isPasswordCorrect(oldPassword))) {
            throw new ApiError("Old password is incorrect", 400);
        }

        // Update user password
        user.password = newPassword;
        await user.save();

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Password changed successfully", {}));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: changePassword :: ${error}`, 500)
        );
    }
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    try {
        // Get details from request
        const { name } = req.body;

        // Update user details
        await User.findByIdAndUpdate(
            req.user._id,
            {
                name
            },
            { new: true }
        );

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Profile updated successfully", {}));
    } catch (error) {
        return next(
            new ApiError(`user.controller :: updateProfile :: ${error}`, 500)
        );
    }
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    try {
        // Get refresh token from cookie
        const oldRefreshToken = req.cookies?.refreshToken;
        if (!oldRefreshToken) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Check if refresh token is valid
        const decodedToken = jwt.verify(
            oldRefreshToken,
            constants.REFRESH_TOKEN_SECRET
        );
        if (!decodedToken?._id) {
            throw new ApiError("User not found", 401);
        }

        // Get refresh token from database
        const user = await User.findById(decodedToken._id).select(
            "_id role refreshToken"
        );

        // Check if refresh token matches with database
        if (user.refreshToken !== oldRefreshToken) {
            throw new ApiError("Invalid token", 401);
        }

        // Generate new tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user);
        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        // Send response
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse("Access token refreshed successfully", {}));
    } catch (error) {
        return next(
            new ApiError(
                `user.controller :: refreshAccessToken :: ${error}`,
                500
            )
        );
    }
});
