import { Router } from "express";
const bookingRouter = Router();
import {
    createBooking,
    getAllTickets,
    getSellingHistory,
    getTicket,
    verifyTicket
} from "../controllers/booking.controller.js";
import {
    authorizedRoles,
    isLoggedIn,
    isVerified
} from "../middlewares/auth.middleware.js";

bookingRouter.route("/create").post(isLoggedIn, isVerified, createBooking);
bookingRouter
    .route("/get-all-tickets")
    .get(isLoggedIn, isVerified, getAllTickets);
bookingRouter
    .route("/get-ticket/:ticketID")
    .get(isLoggedIn, isVerified, getTicket);
bookingRouter
    .route("/verify-ticket/:ticketID")
    .put(
        isLoggedIn,
        isVerified,
        authorizedRoles("CONDUCTOR", "ADMIN"),
        verifyTicket
    );
bookingRouter
    .route("/selling-history")
    .get(
        isLoggedIn,
        isVerified,
        authorizedRoles("CONDUCTOR", "ADMIN"),
        getSellingHistory
    );

export default bookingRouter;
