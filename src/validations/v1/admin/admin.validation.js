const Joi = require('joi');

const retriveData = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().required().email(),

    }),
};

const updateUser = {
    body: Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        role: Joi.string(),
    }),
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        otp: Joi.number().required().min(99999).max(999999),
        role: Joi.string(),
    }),
};

module.exports = {
    retriveData,
    updateUser,
    deleteUser,

}