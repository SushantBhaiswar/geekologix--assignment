/* eslint-disable array-callback-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/apiError');



const verifyCallback = (req, resolve, reject, requiredRights, permissions) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Pleasee authenticate'));
    }

    if (requiredRights && typeof requiredRights == 'string' && requiredRights != user.role) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to perform this action'));
    }

    if (requiredRights && Array.isArray(requiredRights) && requiredRights.length != 0) {
        if (requiredRights.indexOf(user.role) == -1) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to perform this action'));
        }

    }
    // check for permission
    if (permissions && permissions.length != 0 && user.role != 'admin') {
        if (!user.permissions.includes('allAccess')) {
            permissions.map((obj) => {
                if (user.permissions.indexOf(obj) == -1)
                    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to perform this action'));
            });
        }
    }

    // check if prefrences are set for candidate and client 
    if (!['sub-admin', 'admin'].includes(user.role) && req.path != '/verify-2fa' && req.path != '/prefrence' && req.path != '/enable-2fa' && !user.userPrefrences)
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Set preferences to access.'));

    if (user.role == 'sub-admin') {
        let assignedUserIds = await getSubadminUsers(user);
        user.assignedUserIds = assignedUserIds;
    }

    req.user = user;

    // check whether user is trying to login with valid url
    const error = validateLoginUrl(req.user, req, reject)
    if (error?.errorMsg) return reject(new ApiError(httpStatus.UNAUTHORIZED, error.errorMsg))


    const userDevices = await userDevice.findOne({
        user_id: req.user._id,
        device_id: req.headers['device-id'],
    });
    if (!userDevices) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));

    const token = await Token.findOne({ token: userDevices.refresh_token });
    if (!token) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));

    resolve();
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