import express from "express";
import errorMiddleware from "./middlewares/error.middleware.js";
import morgan from "morgan";
import cors from "cors";
import constants from "./constants.js";
import cookieParser from "cookie-parser";

const app = express();

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

app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Page not found"
    });
});

app.use(errorMiddleware);

export default app;
