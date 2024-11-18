
const user = require('../../../models/user.model')
const db = require('../../../db')
const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/apiError')
const httpStatus = require('http-status');
const { geterrorMessagess } = require('../../../utils/helper');
const aws = require('../../../libraries/aws')


const retriveData = async (req) => {
    const userQuery = `SELECT id, profileImage,firstName, lastName, email, isDeleted FROM users WHERE id = ? AND isDeleted = ?`
    const userData = await db.query(userQuery, [req?.body?.userId, false]);
    if (userData.length == 0) throw new ApiError(httpStatus.NOT_FOUND, geterrorMessagess('adminError.userNotFound'))
    userData[0].profileImage = aws.getDownloadUrl(req?.user?.profileImage)
    return userData?.[0]
};

const updateProfile = async (req) => {
    const fields = Object.keys(req?.body)
        .map((key) => `${key} = ?`)
        .join(', ');
    const values = Object.values(req?.body);
    const updateQuery = `UPDATE users SET ${fields} WHERE id = ?`
    await db.query(updateQuery, [...values, req?.params?.id]);
};

const deleteProfile = async (req) => {

    const updateQuery = `UPDATE users SET isDeleted = ? WHERE id = ?`
    const deleteQuery = `DELETE FROM tokens WHERE user_id = ?`
    const queryResult = await db.query(updateQuery, [true, req?.body?.userId]);
    // delete token to logout from other devices
    if (queryResult.affectedRows == 1) {
        //await aws.deleteFileFromAws(req?.user?.profileImage)
        await db.query(deleteQuery, [req?.body?.userId])
    }

};

module.exports = {
    retriveData,
    updateProfile,
    deleteProfile
}
