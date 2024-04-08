const errorMiddleware = (err, req, res, next) => {
    const { statusCode, message, stack } = err;

    console.log("ErrorMiddleware: ", err);

    res.status(statusCode).json({
        success: false,
        message,
        stack
    });
};

export default errorMiddleware;
