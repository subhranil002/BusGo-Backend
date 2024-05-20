import { Router } from "express";
const bookingRouter = Router();
import { createBooking } from "../controllers/booking.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

bookingRouter.route("/create").post(isLoggedIn, createBooking);

export default bookingRouter;
