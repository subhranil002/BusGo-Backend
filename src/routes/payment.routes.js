import { Router } from "express";
import {
    calculatePrice,
    cancelPayment,
    createPayment,
    getApiKey,
    verifyPayment
} from "../controllers/payment.controller.js";
import {
    isLoggedIn,
    isVerified
} from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// Routes
paymentRouter.route("/apikey").get(isLoggedIn, isVerified, getApiKey);
paymentRouter.route("/calculate").post(isLoggedIn, isVerified, calculatePrice);
paymentRouter.route("/create").post(isLoggedIn, isVerified, createPayment);
paymentRouter.route("/verify").post(isLoggedIn, isVerified, verifyPayment);
paymentRouter
    .route("/cancel/:razorpay_order_id")
    .get(isLoggedIn, isVerified, cancelPayment);

export default paymentRouter;
