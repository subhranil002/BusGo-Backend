import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import constants from "../constants.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name can't be more than 50 characters"],
            minlength: [3, "Name can't be less than 3 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            index: true,
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
        bookingHistory: [
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

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods = {
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    generateAccessToken: function () {
        return jwt.sign(
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

export const User = mongoose.model("User", userSchema);
