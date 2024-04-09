import mongoose from "mongoose";

const busRouteMapSchema = new mongoose.Schema({
    routeID: {
        type: String,
        required: [true, "Route ID is required"],
        trim: true,
        minlength: [3, "Bus Number can't be less than 3 characters"],
        maxlength: [15, "Bus Number can't be more than 15 characters"]
    },
    origin: {
        type: String,
        required: [true, "Origin is required"],
        trim: true,
        maxlength: [50, "Origin can't be more than 50 characters"]
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true,
        maxlength: [50, "Destination can't be more than 50 characters"]
    },
    stops: [
        {
            type: String,
            required: [true, "Stops are required"],
            trim: true,
            maxlength: [50, "Stops can't be more than 50 characters"]
        }
    ]
});

export const BusRouteMap = mongoose.model("BusRouteMap", busRouteMapSchema);
