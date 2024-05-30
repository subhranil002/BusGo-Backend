import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js";
import { BusRouteMap } from "../models/busRouteMap.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendMail.js";
import { formatInTimeZone } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
import { ro } from "date-fns/locale";

export const createBooking = asyncHandler(async (req, res, next) => {
    try {
        // Get booking details from request
        const { busNumber, routeID, from, to, price, headCount } = req.body;
        const passengerID = req.user._id;

        // Validate input fields
        if (
            !busNumber ||
            !passengerID ||
            !routeID ||
            !from ||
            !to ||
            !price ||
            !headCount
        ) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate route ID
        const isRouteIDValid = await BusRouteMap.findOne({ routeID });
        if (!isRouteIDValid) {
            throw new ApiError("Invalid route ID", 400);
        }

        // Validate conductor
        const isConductor = await User.findOne({
            busNumber,
            routeID
        });
        if (!isConductor || isConductor?.role !== "CONDUCTOR") {
            throw new ApiError("Invalid conductor", 400);
        }

        // Create booking
        const newBooking = await Booking.create({
            conductorID: isConductor._id,
            passengerID,
            routeID,
            from,
            to,
            price,
            headCount,
            bookingTime: formatInTimeZone(
                new Date(),
                "Asia/Kolkata",
                "yyyy-MM-dd HH:mm:ss"
            )
        });

        // Check if booking created
        const booking = await Booking.findById(newBooking._id);
        if (!booking) {
            throw new ApiError("Error while creating booking", 404);
        }

        // Send email to passenger
        const subject = "Booking Confirmation: Your BusGo Ticket Details";
        const html = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                <h1 style="color: #007bff;">Booking Confirmed</h1>
                <p>Dear ${req.user.name},</p>
                <p>We are excited to inform you that your booking with BusGo has been successfully confirmed! Thank you for choosing us for your journey. Below are the details of your booking:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Price:</strong> ${booking.price} &#8377;</li>
                    <li><strong>Head Count:</strong> ${booking.headCount}</li>
                    <li><strong>From:</strong> ${booking.from}</li>
                    <li><strong>To:</strong> ${booking.to}</li>
                    <li>
                        <strong>
                            Booking Time (IST):
                        </strong> 
                        ${booking.bookingTime}
                    </li>
                </ul>
                <p>Your comfort and safety are our top priorities, and we are committed to providing you with a pleasant travel experience.</p>
                <p>If you have any questions or need further assistance, please don't hesitate to contact us. Our customer support team will be happy to help you.</p>
                <p>We look forward to serving you onboard BusGo and wish you a pleasant journey!</p>
                <p>Best regards,<br>BusGo Team</p>
            </div>
        `;
        const response = await sendEmail(req.user.email, subject, html);

        // If mail not sent
        if (!response) {
            throw new ApiError("Failed to send booking confirmation", 400);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Booking created successfully", booking));
    } catch (error) {
        return next(
            new ApiError(
                `booking.controller :: createBooking :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const getAllTickets = asyncHandler(async (req, res, next) => {
    try {
        // Fetch tickets
        const tickets = await Booking.aggregate([
            {
                $match: {
                    passengerID: req.user._id
                }
            },
            {
                $match: {
                    bookingTime: {
                        $gte: formatInTimeZone(
                            startOfDay(new Date()),
                            "Asia/Kolkata",
                            "yyyy-MM-dd HH:mm:ss"
                        ),
                        $lte: formatInTimeZone(
                            endOfDay(new Date()),
                            "Asia/Kolkata",
                            "yyyy-MM-dd HH:mm:ss"
                        )
                    }
                }
            },
            {
                $project: {
                    conductorID: 0,
                    passengerID: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            },
            {
                $sort: {
                    bookingTime: 1
                }
            }
        ]);

        // Check if tickets exist
        if (!tickets.length) {
            return res
                .status(200)
                .json(new ApiResponse("No tickets booked today", []));
        }

        // Send response
        return res
            .status(200)
            .json(
                new ApiResponse(
                    "Today's bookings fetched successfully",
                    tickets
                )
            );
    } catch (error) {
        return next(
            new ApiError(
                `booking.controller :: getAllTickets :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const getTicket = asyncHandler(async (req, res, next) => {
    try {
        // Get ticket ID from params
        const ticketID = req.params.ticketID;

        // Validate ticket ID
        if (!ticketID) {
            throw new ApiError("Ticket ID is required", 400);
        }

        // Find ticket
        const ticket = await Booking.findById(ticketID);

        // Check if ticket exists
        if (!ticket) {
            throw new ApiError("Ticket not found", 404);
        } else if (
            req.user.role !== "ADMIN" &&
            ticket.passengerID.toString() !== req.user._id.toString() &&
            ticket.conductorID.toString() !== req.user._id.toString()
        ) {
            throw new ApiError(
                `${req.user.role} is not authorized to view ticket`,
                401
            );
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Ticket fetched successfully", ticket));
    } catch (error) {
        return next(
            new ApiError(
                `booking.controller :: getTicket :: ${error}`,
                error.statusCode
            )
        );
    }
});
