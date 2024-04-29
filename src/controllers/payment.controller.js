import razorpayInstance from "../config/razorpay.config.js";
import Payment from "../models/payment.model.js";
import constants from "../constants.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";

export const getApiKey = asyncHandler(async (req, res) => {
    try {
        // Send response
        return res.status(200).json(
            new ApiResponse("API key fetched successfully", {
                apiKey: constants.RAZORPAY_KEY_ID
            })
        );
    } catch (error) {
        return next(
            new ApiError(
                `payment.controller :: getApiKey :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const createPayment = asyncHandler(async (req, res, next) => {
    try {
        // Get payment amount
        const amount = req.query.amount;

        // Validate input data
        if (!amount || amount <= 0) {
            throw new ApiError("Amount must be greater than 0", 400);
        }

        // Create payment options
        const options = {
            amount: amount * 100,
            currency: "INR"
        };

        // Create payment
        const order = await razorpayInstance.orders
            .create(options)
            .catch(err => {
                throw new ApiError(`Failed to create payment: ${err}`, 400);
            });

        // Add orderId to database
        await Payment.create({
            razorpay_order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status
        });

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Payment created successfully", order));
    } catch (error) {
        return next(
            new ApiError(
                `payment.controller :: createPayment :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const verifyPayment = asyncHandler(async (req, res, next) => {
    try {
        // Get payment details
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            req.body;

        // Validate input data
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            throw new ApiError("All fields are required", 400);
        }

        // Find order_id in database
        const payment = await Payment.findOne({
            razorpay_order_id
        });
        if (!payment) {
            throw new ApiError("Invalid payment details", 400);
        }

        // Check if order is paid or failed or canceled
        if (payment.status === "paid") {
            throw new ApiError("Already paid", 400);
        } else if (payment.status === "failed") {
            throw new ApiError("Payment failed, create a new payment", 400);
        } else if (payment.status === "canceled") {
            throw new ApiError("Payment canceled, create a new payment", 400);
        }

        // Generate signature
        const generatedSignature = crypto
            .createHmac("sha256", constants.RAZORPAY_SECRET)
            .update(payment.razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // Check if signature matches
        if (generatedSignature !== razorpay_signature) {
            payment.status = "failed";
            await payment.save();
            throw new ApiError("Invalid payment details", 400);
        }

        // Save payment details to database
        payment.rozorpay_payment_id = razorpay_payment_id;
        payment.status = "paid";
        payment.rozorpay_signature = razorpay_signature;
        await payment.save();

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Payment verified successfully", payment));
    } catch (error) {
        return next(
            new ApiError(
                `payment.controller :: verifyPayment :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const cancelPayment = asyncHandler(async (req, res, next) => {
    try {
        // Get payment details
        const razorpay_order_id = req.params.razorpay_order_id;

        // Find order_id in database
        const payment = await Payment.findOne({
            razorpay_order_id
        });
        if (!payment) {
            throw new ApiError("Invalid payment details", 400);
        }

        // Update payment status
        payment.status = "canceled";
        await payment.save();

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Payment canceled successfully", {}));
    } catch (error) {
        return next(
            new ApiError(
                `payment.controller :: cancelPayment :: ${error}`,
                error.statusCode
            )
        );
    }
});
