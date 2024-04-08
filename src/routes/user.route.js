import { Router } from "express";
import { login, register, sendOTP } from "../controllers/user.controller.js";
const userRouter = Router();

userRouter.route("/send-otp").post(sendOTP);
userRouter.route("/register").post(register);
userRouter.route("/login").post(login);

export default userRouter;
