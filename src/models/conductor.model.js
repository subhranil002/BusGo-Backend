import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import constants from "../constants.js";

const conductorSchema = new mongoose.Schema(
    {
        busNumber: {
            type: String,
            required: [true, "Bus Number is required"],
            trim: true,
            minlength: [3, "Bus Number can't be less than 3 characters"],
            maxlength: [15, "Bus Number can't be more than 15 characters"]
        },
        routeID: {
            type: String,
            required: [true, "Route ID is required"],
            trim: true,
            minlength: [3, "Bus Number can't be less than 3 characters"],
            maxlength: [15, "Bus Number can't be more than 15 characters"]
        },
        conductorName: {
            type: String,
            required: [true, "Conductor Name is required"],
            trim: true,
            maxlength: [50, "Conductor Name can't be more than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (email) {
                    return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(
                        email
                    );
                },
                message: "Invalid email"
            }
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
        },
        avatar: {
            public_id: {
                type: String,
                default: null,
                trim: true
            },
            secure_url: {
                type: String,
                default:
                    "https://res.cloudinary.com/de4zawd4d/image/upload/v1712392736/samples/cloudinary-icon.png",
                trim: true
            }
        },
        sellingHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking"
            }
        ],
        refreshToken: {
            type: String,
            default: null,
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
conductorSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Methods
conductorSchema.methods = {
    // Check if password is correct
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    // Generate access token
    generateAccessToken: function () {
        jwt.sign(
            {
                _id: this._id
            },
            constants.ACCESS_TOKEN_SECRET,
            {
                expiresIn: constants.ACCESS_TOKEN_EXPIRE
            }
        );
    },
    // Generate refresh token
    generateRefreshToken: function () {
        return jwt.sign(
            {
                _id: this._id
            },
            constants.REFRESH_TOKEN_SECRET,
            {
                expiresIn: constants.REFRESH_TOKEN_EXPIRE
            }
        );
    }
};

export const Conductor = mongoose.model("Conductor", conductorSchema);
