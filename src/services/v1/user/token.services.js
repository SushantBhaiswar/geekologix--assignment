const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../../../config/config');
const { Token } = require('../../../models/index');
const ApiError = require('../../../utils/apiError');
const { tokenTypes } = require('../../../config/enumValues');
const db = require('../../../db')
/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type) => {
    const tokenQuery = `INSERT INTO tokens (token, user_id, expires, type) VALUES(?,?,?,?)`
    await db.query(tokenQuery, [
        token,
        userId,
        expires.toDate(),
        type,
    ]);
    const row = await Token.findToken(userId)
    return row;
};


const verifyToken = (token, type) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwt.secret, async (err, payload) => {
            if (err) {
                // Handle JWT expiration or other errors
                if (err.name === 'TokenExpiredError') {
                    reject(new ApiError(httpStatus.BAD_REQUEST, 'The password reset link has timed out. Please return to the login page and try resetting your password again to generate a new link'));
                } else {
                    reject(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
                }
            } else {
                // If verification is successful, proceed to find the token document
                try {
                    const tokenDoc = await db.query(`SELECT * FROM tokens WHERE user_id = ? AND token = ? VALUES(? , ?)`, [payload.sub, token])
                    if (!tokenDoc) {
                        reject(new ApiError(httpStatus.BAD_REQUEST, 'The password reset link has timed out. Please return to the login page and try resetting your password again to generate a new link'));
                    } else {
                        resolve(tokenDoc);
                    }
                } catch (dbError) {
                    reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
                }
            }
        });
    });
};

const generateAuthTokens = async (user, refreshTokenExpired) => {

    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    let refreshToken;

    // if refresh token is not expired then generate access token only
    if (refreshTokenExpired) {
        refreshToken = await generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);
        await saveToken(refreshToken, user, refreshTokenExpires, tokenTypes.REFRESH);
    }
    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken || false,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }

    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user._id, expires, tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user._id, expires, tokenTypes.RESET_PASSWORD);
    return { resetPasswordToken, user, userDetails: user.userDetails, jobCategory: user?.userPrefrences?.jobCategory };
};



module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken,
};
