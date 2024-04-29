import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        razorpay_order_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        rozorpay_payment_id: {
            type: String,
            unique: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            default: "created",
            enum: ["created", "paid", "failed", "canceled"]
        },
        rozorpay_signature: {
            type: String,
            unique: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
