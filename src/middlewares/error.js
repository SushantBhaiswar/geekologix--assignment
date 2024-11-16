const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/apiError');
//const Log = require('../models/logs.model');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
    let { statusCode, message } = err;
    if (config.env === 'production') {
        const startTime = +req._startTime;
        const endTime = +new Date();

        const ip =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        const objLog = new Log({
            uri: req.originalUrl,
            headers: req.headers,
            method: req.method,
            body: req.body,
            param: req.params,
            ip_address: ip,
            start_time: startTime,
            end_time: endTime,
            rtime: endTime - startTime,
            status: statusCode,
            response: { err, message, stack: err.stack, code: statusCode, status: false },
        });

        //await objLog.save();
        // statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        // message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };

    if (config.env === 'development' || config.env === 'staging' || config.env === 'qa') {
        logger.error(err);
        const startTime = +req._startTime;
        const endTime = +new Date();

        const ip =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        const objLog = new Log({
            uri: req.originalUrl,
            headers: req.headers,
            method: req.method,
            body: req.body,
            param: req.params,
            ip_address: ip,
            start_time: startTime,
            end_time: endTime,
            rtime: endTime - startTime,
            status: statusCode,
            response: { err, message, stack: err.stack, code: statusCode, status: false },
        });

        await objLog.save();
    }
    if (statusCode == 500) response.message = 'Internal Server Error!'
    res.status(statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
