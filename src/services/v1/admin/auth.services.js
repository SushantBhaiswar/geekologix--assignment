

const { user } = require('../../../models/index')
const db = require('../../../db')

const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');
const tokenServices = require('../user/token.services')
const { tokenTypes } = require('../../../config/enumValues');


const loginUser = async (req) => {
    const { email, password } = req?.body;
    const userData = await user.findByEmail(email)

    if (!userData) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidLogin'))
    if (!userData.isEmailVerified) throw new ApiError(httpStatus.BAD_REQUEST, geterrorMessagess('authError.emailNotVerified'))

    if (!await user.comparePassword(password, userData?.password)) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidPass'))

    const tokens = await tokenServices.generateAuthTokens(userData?.id, true, req?.headers?.['device_id'])
    delete userData.password
    return { user: userData, tokens }
};

const logout = async (req) => {
    const tokenQuery = `SELECT * FROM tokens WHERE token = ? AND type = ? AND device_id = ?`
    const deleteTokenQuery = `DELETE FROM tokens WHERE  type = ? AND device_id = ?`
    const tokenParams = [req.body.refreshToken, tokenTypes.REFRESH, req?.headers?.['device_id']]
    const refreshTokenDoc = await db.query(tokenQuery, tokenParams);
    if (refreshTokenDoc.length != 0) {
        tokenParams.shift()
        console.log(tokenParams.length)
        await db.query(deleteTokenQuery, tokenParams)
    }

};

const refreshAuth = async (req) => {
    const tokenQuery = 'SELECT * from tokens WHERE token = ? AND type = ?'
    const userQuery = 'SELECT * from users WHERE id = ? AND isDeleted = ?'
    const [refreshTokenDoc] = await db.query(tokenQuery, [req?.body?.refreshToken, tokenTypes.REFRESH]);
    // if expired then ask user to login
    const isExpired = new Date(refreshTokenDoc?.expires) < new Date();
    if (isExpired || !refreshTokenDoc) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
    console.log(refreshTokenDoc)
    const user = await db.query(userQuery, [refreshTokenDoc?.user_id, false]);
    if (user.length == 0) throw new ApiError(httpStatus.UNAUTHORIZED, geterrorMessagess('authError.userNotFoundWithEmail'));

    // generate access token
    const tokens = await tokenServices.generateAuthTokens(user?.[0]?.id, isExpired, refreshTokenDoc.deviceId);

    return { tokens, user: user?.[0] };

}
module.exports = {
    loginUser,
    logout,
    refreshAuth
}