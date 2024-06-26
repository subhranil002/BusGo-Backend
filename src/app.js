import express from "express";
import errorMiddleware from "./middlewares/error.middleware.js";
import morgan from "morgan";
import cors from "cors";
import constants from "./constants.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import busRouteMapRouter from "./routes/busRouteMap.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(
    cors({
        origin: constants.CORS_ORIGIN,
        credentials: true
    })
);
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

// Routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/routemap", busRouteMapRouter);

// Handle 404 errors
app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Page not found"
    });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
