/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick.js');
const ApiError = require('../utils/apiError');

const extractEircode = (obj) => {
    let eir = false;
    for (const el in obj) {
        if (typeof obj[el] == 'string') {
            if (obj.eirCode) eir = obj.eirCode;
        }
        if (typeof obj[el] == 'object') {
            if (obj[el]?.eirCode) eir = obj[el].eirCode;
        }
    }

    return eir;
};

const validate = (schema) => async (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        //const errorMessage = error.details.map((details) => details.message.replace(/"/g, '')).join(', ');
        const errorMessage = error.details[0].message;
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }

    if (value && value.body) {
        const extractEircoded = extractEircode(value.body)
        if (extractEircoded) {
            if (Array.isArray(extractEircoded)) {
                let eirCodeDetails = []
                for (i = 0; i < extractEircoded.length; i++) {
                    const data = await ValidateEircode(extractEircoded[i]);
                    if (data.statusCode == 400) {
                        return next(new ApiError(httpStatus.BAD_REQUEST, data.message));
                    }
                    eirCodeDetails.push(data)
                }
                req.eirCodeDetails = eirCodeDetails;
            } else {
                const data = await ValidateEircode(extractEircoded);
                if (data.statusCode == 400) {
                    return next(new ApiError(httpStatus.BAD_REQUEST, data.message));
                }
                req.eirCodeDetails = data;
            }
        }
    }


    Object.assign(req, value);
    return next();
};

module.exports = validate;
