class ApiError extends Error {
    constructor(statusCode, message, errors) {
        super(message || "Something went wrong");
        this.statusCode = Number(statusCode) || 500;
        this.errors = Array.isArray(errors) ? errors : [];
        this.data = null;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
