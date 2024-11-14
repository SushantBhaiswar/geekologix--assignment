
const { adminServices } = require('../../../services/v1/admin');
const utility = require('../../../utils/helper');
const httpStatus = require('http-status');

const catchAsync = require('../../../utils/catchAsync');

const retriveData = catchAsync(async (req, res) => {
    const _2FADetail = await adminServices.verifyEmail(req.params.userId, req.body.otp);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.emailVerified'),
        data: { result: _2FADetail }
    });

});

const updateUser = catchAsync(async (req, res) => {
    await adminServices.updatePassword(req, session);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.passwordUpdatedSuccess'),
    });


});

const deleteUser = catchAsync(async (req, res) => {
    await adminServices.generateResetPasswordToken(req)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.resetPasswordEmailSuccess'),
    });

});

module.exports = {
    deleteUser,
    updateUser,
    retriveData
}