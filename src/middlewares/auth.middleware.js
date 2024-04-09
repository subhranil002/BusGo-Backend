import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import constants from "../constants.js";

// Middleware to check if user is logged in
export const isLoggedIn = asyncHandler(async (req, res, next) => {
    try {
        // Get access token
        const accessToken = req.cookies?.accessToken;

        // Validate access token
        if (!accessToken ) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Verify access token
        const decodedToken = jwt.verify(accessToken, constants.ACCESS_TOKEN_SECRET);
        if (!decodedToken?._id) {
            throw new ApiError("Unauthorized request, please login again", 401);
        }

        // Attach user details to request
        req.user = decodedToken;

        // Proceed to next
        next();
    } catch (error) {
        return next(
            new ApiError(`auth.middleware :: isLoggedIn :: ${error}`, 500)
        );
    }
});
