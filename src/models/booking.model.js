import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        conductorID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Conductor is required"],
            trim: true
        },
        passengerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Passenger is required"],
            trim: true
        },
        routeID: {
            type: String,
            required: [true, "Route ID is required"],
            trim: true,
            minlength: [2, "Route ID can't be less than 3 characters"],
            maxlength: [10, "Route ID can't be more than 15 characters"]
        },
        from: {
            type: String,
            required: [true, "From is required"],
            trim: true,
            maxlength: [50, "From can't be more than 50 characters"]
        },
        to: {
            type: String,
            required: [true, "To is required"],
            trim: true,
            maxlength: [50, "To can't be more than 50 characters"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
            max: 10000
        },
        headCount: {
            type: Number,
            required: [true, "Head count is required"],
            min: 0,
            max: 10
        },
        bookingTime: {
            type: String,
            required: [true, "Booking time is required"],
            trim: true,
            maxlength: [50, "Booking time can't be more than 50 characters"]
        }
    },
    {
        timestamps: true
    }
);

export const Booking = mongoose.model("Booking", bookingSchema);
