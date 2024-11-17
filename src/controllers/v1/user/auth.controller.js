const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { authServices } = require('../../../services/v1/user');
const utility = require('../../../utils/helper');

const register = catchAsync(async (req, res) => {
    const response = await authServices.createUser(req)

    res.sendJSONResponse({
        code: httpStatus.CREATED,
        status: true,
        message: utility.getuserMessagess(`authMessages.signupSuccessfully`),
        data: { otp: response?.generatedOTP, id: response.id }
    })

});

const login = catchAsync(async (req, res) => {
    const user = await authServices.loginUser(req);

    return res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.loginSuccessfully'),
        data: user,
    });
});

const logout = catchAsync(async (req, res) => {
    await authServices.logout(req);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.logoutSuccessfully'),
    });
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authServices.refreshAuth(req);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.refreshTokenGenerated'),
        data: { user: tokens.user, tokens: tokens.tokens },
    });
});

const sendVerificationCode = catchAsync(async (req, res) => {
    const otp = await authServices.sendVerificationCode(req);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        data: { otp },
        message: utility.getuserMessagess('authMessages.otpSentsuccessfully'),
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    await authServices.verifyEmail(req);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.emailVerified'),

    });

});

const changePassword = catchAsync(async (req, res) => {
    const user = await authServices.changePassword(req);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.passwordUpdatedSuccess'),
    });


});



module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    sendVerificationCode,
    verifyEmail,
    changePassword,
}