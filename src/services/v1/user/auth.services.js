
const user = require('../../../models/user.model')
const createUser = async (req) => {
    const { email, password, firstName, lastName, profileImage } = req?.body
    console.log("🚀 ~ createUser ~ req?.body:", req?.body)
    const userData = await user.add(email, password, firstName, lastName, profileImage)
    console.log("🚀 ~ createUser ~ users:", userData)
};


const verifyEmail = async (userId, otp) => {

};

module.exports = {

    verifyEmail,
    createUser,

}