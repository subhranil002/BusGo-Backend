import mongoose from "mongoose";

const busRouteMapSchema = new mongoose.Schema({
    routeID: {
        type: String,
        required: [true, "Route ID is required"],
        trim: true,
        minlength: [2, "Route ID can't be less than 3 characters"],
        maxlength: [10, "Route ID can't be more than 15 characters"]
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
            stopNumber: {
                type: Number,
                required: [true, "Stop number is required"],
                min: 1
            },
            name: {
                type: String,
                required: [true, "Stop name is required"],
                trim: true,
                maxlength: [50, "Stop name can't be more than 50 characters"],
                minlength: [3, "Stop name can't be less than 1 character"]
            },
            distanceFromOrigin: {
                type: Number,
                required: [true, "Distance from start is required"],
                min: 0
            },
            timetakenFromOrigin: {
                type: Number,
                required: [true, "Time taken from start is required"],
                min: 0
            },
        }
    ],
    farePerKm: {
        type: Number,
        required: [true, "Fare per km is required"],
        min: 0
    },
    minimumFare: {
        type: Number,
        required: [true, "Minimum fare is required"],
        min: 0
    }
});

export const BusRouteMap = mongoose.model("BusRouteMap", busRouteMapSchema);
