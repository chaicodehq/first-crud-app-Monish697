/**
 * TODO: Handle errors
 *
 * Required error format: { error: { message: "..." } }
 *
 * Handle these cases:
 * 1. Mongoose ValidationError → 400 with combined error messages
 * 2. Mongoose CastError → 400 with "Invalid id format"
 * 3. Other errors → Use err.status (or 500) and err.message
 */
// @ts-ignore
export function errorHandler(error, req, res, next) {
    if (error.name === "ValidationError") {
        return res.status(400).json({ error: { message: error.message } });
    }

    if (error.code === "CastError") {
        return res
            .status(409)
            .json({ error: { message: "Email already exists" } });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: { message: error.message } });
}
