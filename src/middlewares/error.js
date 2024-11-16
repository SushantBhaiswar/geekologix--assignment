const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/apiError');
const Log = require('../models/log.model');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
    let { statusCode, message } = err;


    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        stack: err.stack,
    };

    logger.error(err);

    const ip =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    await Log.create({
        uri: req.originalUrl,
        headers: req.headers,
        method: req.method,
        body: req.body,
        param: req.params,
        ip_address: ip,
        status: statusCode,
        response: { err, message, stack: err.stack, code: statusCode, status: false },
    });

    if (statusCode == 500) response.message = 'Internal Server Error!'
    res.status(statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
