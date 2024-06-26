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
            minlength: [8, "Password can't be less than 8 characters"],
        },
        avatar: {
            public_id: {
                type: String,
                default: "",
                trim: true
            },
            secure_url: {
                type: String,
                default:
                    "https://res.cloudinary.com/de4zawd4d/image/upload/v1712392736/samples/cloudinary-icon.png",
                trim: true
            }
        },
        busNumber: {
            type: String,
            trim: true,
            minlength: [3, "Bus Number can't be less than 3 characters"],
            maxlength: [15, "Bus Number can't be more than 15 characters"]
        },
        routeID: {
            type: String,
            trim: true,
            minlength: [2, "Route ID can't be less than 2 characters"],
            maxlength: [15, "Route ID can't be more than 15 characters"]
        },
        role: {
            type: String,
            required: [true, "Role is required"],
            enum: ["CONDUCTOR", "PASSENGER", "ADMIN"],
            default: "PASSENGER"
        },
        refreshToken: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Methods for user model
userSchema.methods = {
    // Check if password is correct
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    // Generate access token
    generateAccessToken: function () {
        return jwt.sign(
            {
                _id: this._id,
                role: this.role,
                isVerified: this.isVerified
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

export const User = mongoose.model("User", userSchema);
