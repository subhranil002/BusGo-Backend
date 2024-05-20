import { Router } from "express";
import {
    cancelPayment,
    createPayment,
    getApiKey,
    verifyPayment
} from "../controllers/payment.controller.js";
import { isLoggedIn, authorizedRoles } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// Routes
paymentRouter.route("/apikey").get(isLoggedIn, getApiKey);
paymentRouter
    .route("/create")
    .post(isLoggedIn, authorizedRoles("passenger", "conductor"), createPayment);
paymentRouter
    .route("/verify")
    .post(isLoggedIn, authorizedRoles("passenger", "conductor"), verifyPayment);
paymentRouter
    .route("/cancel/:razorpay_order_id")
    .get(isLoggedIn, cancelPayment);

export default paymentRouter;
