
const { user, Otp } = require('../../../models/index')
const db = require('../../../db')
const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');
const token = require('./token.services')
const { tokenTypes } = require('../../../config/enumValues');
const emailServices = require('../../../utils/emailService')
const tokenServices = require('./token.services')


const createUser = async (req) => {
    console.log("req?.body?.profileImage", req.file)
    return
    const createQuery = `
    INSERT INTO users ( email, password, firstName, lastName, profileImage, role)
    VALUES (?, ?, ?,?, ?,?);
    `;


    // check email uniqueness
    const emailFound = await user.findByEmail(req?.body?.email)
    if (emailFound) throw new ApiError(httpStatus.CONFLICT, geterrorMessagess('authError.emailExist'))

    // bcrypt the password
    const hashedPassword = await bcrypt.hash(req?.body.password, 8);

    const result = await db.query(createQuery, [
        req?.body.email,
        hashedPassword,
        req?.body.firstName,
        req?.body.lastName,
        req?.body?.profileImage || null,
        req?.body.role || 'user',
    ]);
    // send email for verification
    const generatedOTP = await Otp.generate(result.insertId, 'verifyEmail')
    const data = { firstName: req?.body.firstName, otp: generatedOTP }
    emailServices.compileEmail(req?.body.email, data, 'Email Verification')
    return { generatedOTP, id: result.insertId };
};

const loginUser = async (req) => {
    const { email, password } = req?.body;
    const userData = await user.findByEmail(email)

    if (!userData) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidLogin'))
    if (!userData.isEmailVerified) throw new ApiError(httpStatus.BAD_REQUEST, geterrorMessagess('authError.emailNotVerified'))

    if (!await user.comparePassword(password, userData?.password)) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidPass'))

    const tokens = await token.generateAuthTokens(userData?.id, true, req?.headers?.['device_id'])
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

const verifyEmail = async (req) => {
    console.log(req?.params?.userId)
    const optData = await Otp.find(req?.params?.userId, 'verifyEmail')

    if (!optData) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.optNotFound'))
    if (new Date().getTime() <= optData.expiry) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.optExpired'))

    if (req?.body?.otp == optData.otp) {

        await db.query('UPDATE users SET isEmailVerified = ? WHERE id = ? ', [true, req?.params?.userId])
        await db.query('DELETE FROM otps WHERE user_id = ? AND type = ?', [req?.params?.userId, 'verifyEmail'])
    }
};

const sendVerificationCode = async (req) => {
    const userData = await user.findByEmail(req?.body?.email)
    if (!userData) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.userNotFoundWithEmail'))
    if (userData.isEmailVerified) throw new ApiError(httpStatus.CONFLICT, geterrorMessagess('authError.emailAlreadyVerified'))

    // send email for verification
    const generatedOTP = await Otp.generate(userData.id, 'verifyEmail')
    const data = { firstName: userData?.firstName, otp: generatedOTP }
    emailServices.compileEmail(userData?.email, data, 'Email Verification')

    return generatedOTP;
};

const changePassword = async (req) => {
    const { currentPassword, newPassword } = req?.body;

    if (!await user.comparePassword(currentPassword, req?.user?.password)) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidPass'))

    // bcrypt the password
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?'
    const deleteQuery = 'DELETE FROM tokens WHERE id = ? AND device_id != ?'
    const queryResult = await db.query(updateQuery, [hashedPassword, req?.user?.id])

    // log out on other devices on password change
    if (queryResult.affectedRows == 1) {
        await db.query(deleteQuery, [req?.user?.id, req?.headers?.['device_id']])
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
    logout,
    verifyEmail,
    createUser,
    loginUser,
    refreshAuth,
    changePassword,
    sendVerificationCode
}