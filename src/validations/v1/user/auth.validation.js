const Joi = require('joi');

const register = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        password: Joi.string().required().min(8),
        email: Joi.string().required().email(),
        profileImage: Joi.string(),

    }),
};

const login = {
    Headers: Joi.object().keys({
        device_id: Joi.string().required(),
    }).unknown(true),
    body: Joi.object().keys({
        password: Joi.string().required(),
        email: Joi.string().required().email(),
    }),
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const sendVerificationCode = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        type: Joi.string().required().valid('verifyEmail', 'resetPassword'),
    }),
};
const resendCode = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        type: Joi.string().required().valid('verifyEmail', 'resetPassword'),
        role: Joi.string(),
    }),
};
const verifyCode = {
    params: Joi.object().keys({
        code: Joi.string().required(),
    }),
};

const resetPassword = {
    params: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        newPassword: Joi.string().required(),
        role: Joi.string(),
    }),
};
const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        role: Joi.string(),
    }),
};
const changePassword = {
    body: Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        role: Joi.string(),
    }),
};

const verifyEmail = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        otp: Joi.number().required().min(99999).max(999999),
        role: Joi.string(),
    }),
};

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    sendVerificationCode,
    resendCode,
    verifyCode,
    resetPassword,
    forgotPassword,
    changePassword,
    verifyEmail
}