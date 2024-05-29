import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        razorpay_order_id: {
            type: String,
            required: true,
            trim: true
        },
        rozorpay_payment_id: {
            type: String,
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
            enum: ["CREATED", "PAID", "CANCELED"]
        },
        rozorpay_signature: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
