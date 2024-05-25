import { Router } from "express";
const bookingRouter = Router();
import { createBooking } from "../controllers/booking.controller.js";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";

bookingRouter.route("/create").post(isLoggedIn, isVerified, createBooking);

export default bookingRouter;
