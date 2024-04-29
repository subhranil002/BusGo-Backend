import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import constants from "../constants.js";
import { User } from "../models/user.model.js";

// Middleware to check if user is logged in
export const isLoggedIn = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve access token from cookies or authorization header
        const authorizationHeader = req.headers?.authorization;
        const accessToken =
            req.cookies?.accessToken ||
            (authorizationHeader ? authorizationHeader.split(" ")[1] : null);

        // Validate access token
        if (!accessToken) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Verify access token
        let decodedToken;
        try {
            decodedToken = jwt.verify(
                accessToken,
                constants.ACCESS_TOKEN_SECRET
            );
            if (!decodedToken?._id) {
                throw new ApiError("Invalid or expired access token", 401);
            }
        } catch (error) {
            throw new ApiError("Invalid or expired access token", 401);
        }

        // Find user by id
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Attach user details to request
        req.user = decodedToken;

        // Proceed to next
        next();
    } catch (error) {
        return next(
            new ApiError(
                `auth.middleware :: isLoggedIn :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const authorizedRoles =
    (...roles) =>
    async (req, res, next) => {
        try {
            // Get current user role
            const currentRole = req.user?.role;

            // Check if user has required role
            if (!roles.includes(currentRole)) {
                throw new ApiError("Unauthorized role", 401);
            }

            next();
        } catch (error) {
            return next(
                new ApiError(
                    `auth.middleware :: authorizedRoles: ${error}`,
                    error.statusCode
                )
            );
        }
    };
