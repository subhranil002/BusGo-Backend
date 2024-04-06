const errorMiddleware = (err, req, res, next) => {
    const { statusCode, message, errors, stack } = err;

    console.log("Error: ", err);

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack
    });
};

export default errorMiddleware;
