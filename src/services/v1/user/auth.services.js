
const user = require('../../../models/user.model')
const db = require('../../../db')
const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');
const token = require('./token.services')
const { tokenTypes } = require('../../../config/enumValues');



const createUser = async (req) => {

    const createQuery = `
    INSERT INTO users ( email, password, firstName, lastName, profileImage, role)
    VALUES (?, ?, ?,?, ?,?);
    `;


    // check email uniqueness
    const emailFound = await user.findByEmail(req?.body?.email)
    if (emailFound) throw new ApiError(httpStatus.CONFLICT, geterrorMessagess('authError.emailExist'))

    // bcrypt the password
    const hashedPassword = await bcrypt.hash(req?.body.password, 8);

    await db.query(createQuery, [
        req?.body.email,
        hashedPassword,
        req?.body.firstName,
        req?.body.lastName,
        req?.body?.profileImage || null,
        req?.body.role || 'user',
    ]);

};

const loginUser = async (req) => {
    const { email, password } = req?.body;
    const userData = await user.findByEmail(email)
    if (userData.length == 0) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidLogin'))

    if (!await user.comparePassword(password, userData?.password,)) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('authError.invalidPass'))

    const tokens = await token.generateAuthTokens(userData?.id, true, req?.headers?.['device_id'])
    delete user.password
    return { user: userData, tokens }
};

const logout = async (req) => {
    const tokenQuery = `SELECT * FROM tokens WHERE token = ? AND type = ? AND device_id = ?`
    const deleteTokenQuery = `DELETE FROM tokens WHERE  type = ? AND device_id = ?`
    const tokenParams = [req.body.refreshToken, tokenTypes.REFRESH, req?.headers?.['device_id']]
    const refreshTokenDoc = await db.query(tokenQuery, tokenParams);
    if (refreshTokenDoc.length != 0) {
        tokenParams.shift() 
        console.log( tokenParams.length)
        await db.query(deleteTokenQuery, tokenParams)
    }

};

const verifyEmail = async (userId, otp) => {

};

module.exports = {
    logout,
    verifyEmail,
    createUser,
    loginUser,
}