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
            maxlength: [15, "Bus Number can't be more than 15 characters"],
            minlength: [3, "Bus Number can't be less than 3 characters"]
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            unique: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            select: false
        },
        verifiedUser: {
            type: Boolean,
            default: false
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
            select: false
        }
    },
    {
        timestamps: true
    }
);

conductorSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

conductorSchema.methods = {
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
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
