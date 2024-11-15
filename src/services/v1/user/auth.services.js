
const user = require('../../../models/user.model')
const createUser = async (req) => {
    const { email, password, firstName, lastName, profileImage } = req?.body
    const userData = user.add(email, password, firstName, lastName, profileImage)
    console.log("🚀 ~ createUser ~ users:", users)
};


const verifyEmail = async (userId, otp) => {

};

module.exports = {

    verifyEmail,
    createUser,

}