/* eslint-disable array-callback-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/apiError');
const db = require('../db')


const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
    try {
        console.log(err || info || !user)
        if (err || info || !user) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, err || 'Please Authenticate'));
        }
        console.log(user.isEmailVerified)
        if (!user.isEmailVerified) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Your email is not verified!'));
        }
        if (requiredRights && typeof requiredRights == 'string' && requiredRights != user.role) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to perform this action'));
        }
        if (!req?.headers?.['device_id']) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'device id is required'));
        const userDevices = await db.query(` SELECT * FROM tokens WHERE device_id = ? AND user_id = ?`, [req?.headers?.['device_id'], user?.id])
        if (userDevices.length == 0) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));

        // checking if multiple role have access
        if (requiredRights && Array.isArray(requiredRights) && requiredRights.length != 0) {
            if (requiredRights.indexOf(user.role) == -1) {
                return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to perform this action'));
            }

        }

        req.user = user;

        // check whether user is trying to login with valid url
        if (!req.originalUrl.includes(`v1/${user.role}`)) return reject(new ApiError(httpStatus.UNAUTHORIZED, `Invalid url try accessing with ${user.role == 'admin' ? 'user' : 'admin'}`))

        resolve();
    } catch (error) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, error));
    }
};

const auth = (requiredRights, permissions) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights, permissions))(
            req,
            res,
            next
        );
    })
        .then(() => next())
        .catch((err) => {
            return next(err);
        });
};

module.exports = auth;