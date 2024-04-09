import { Router } from "express";
import {
    getCurrentUser,
    login,
    logout,
    register,
    sendOTP
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Routes
userRouter.route("/send-otp").post(sendOTP);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(isLoggedIn, logout);
userRouter.route("/current-user").get(isLoggedIn, getCurrentUser);

export default userRouter;
