export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    
    console.error(`[API Error] ${req.method} ${req.url}:`, err);

    // In production, return generic message for 500 errors to avoid information leakage
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal Server Error - something went wrong on our end.';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
