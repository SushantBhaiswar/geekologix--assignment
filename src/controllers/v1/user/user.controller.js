const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { userServices } = require('../../../services/v1/user');

const retriveProfile = catchAsync(async (req, res) => {
    const _2FADetail = await userServices.verifyEmail(req.params.userId, req.body.otp);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.emailVerified'),
        data: { result: _2FADetail }
    });

});

const updateProfile = catchAsync(async (req, res) => {
    await userServices.updatePassword(req, session);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.passwordUpdatedSuccess'),
    });


});

const deleteProfile = catchAsync(async (req, res) => {
    await userServices.generateResetPasswordToken(req)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.resetPasswordEmailSuccess'),
    });

});

module.exports = {
    deleteProfile,
    updateProfile,
    retriveProfile
}