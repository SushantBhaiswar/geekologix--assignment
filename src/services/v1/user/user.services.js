
const user = require('../../../models/user.model')
const db = require('../../../db')
const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');
const token = require('./token.services')
const { tokenTypes } = require('../../../config/enumValues');


const getProfile = async (req) => {
    const userQuery = `SELECT id, profileImage,firstName, lastName, email, isDeleted FROM users WHERE id = ? AND isDeleted = ?`
    const userData = await db.query(userQuery, [req?.user?.id, false]);
    return userData?.[0]
};

module.exports = {
    getProfile
}
