
const user = require('../../../models/user.model')
const db = require('../../../db')
const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');

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


const verifyEmail = async (userId, otp) => {

};

module.exports = {

    verifyEmail,
    createUser,

}