import { Router } from "express";
import {
    changeAvatar,
    changePassword,
    deleteUser,
    getCurrentUser,
    login,
    logout,
    refreshAccessToken,
    register,
    sendOTP,
    updateProfile,
    verifyConductor,
} from "../controllers/user.controller.js";
import {
    authorizedRoles,
    isLoggedIn,
    isVerified
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const userRouter = Router();

// Routes
userRouter.route("/send-otp").post(sendOTP);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(isLoggedIn, logout);
userRouter.route("/current-user").get(isLoggedIn, getCurrentUser);
userRouter
    .route("/change-avatar")
    .put(upload.single("avatar"), isLoggedIn, isVerified, changeAvatar);
userRouter
    .route("/change-password")
    .put(isLoggedIn, isVerified, changePassword);
userRouter.route("/update-profile").put(isLoggedIn, isVerified, updateProfile);
userRouter.route("/refresh-token").get(refreshAccessToken);
userRouter.route("/delete-user").delete(isLoggedIn, deleteUser);
userRouter
    .route("/verify-conductor")
    .post(isLoggedIn, isVerified, authorizedRoles("ADMIN"), verifyConductor);

export default userRouter;
