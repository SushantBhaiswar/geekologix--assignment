const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { authServices } = require('../../../services/v1/user');
const utility = require('../../../utils/helper');



const register = catchAsync(async (req, res) => {
    const data = authServices.createUser(req, session)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess(`authMessages.signupSuccessfully${isEmailVerified ? 'Admin' : ''}`),
        data: { result: { userId: _id, type: (data.user.role == "client") ? data.userDetails.category : data.userDetails.registrationNumber.type, isEmailVerified, isPrefrenceSet, accountVerifiedStatus } },
    })

});

const login = catchAsync(async (req, res) => {
    const user = await authServices.loginUserWithEmailAndPassword(req);

    return res.sendJSONResponse({
        code: httpStatus.CREATED,
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
    const tokens = await authServices.refreshAuth(req.body.refreshToken);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('commonMessage.success'),
        data: { user: tokens.user, tokens: tokens.tokens },
    });
});

const sendVerificationCode = catchAsync(async (req, res) => {
    const user = await userService.sendVerificationCode(req.body.email);
    const { userDetails } = user;
    const otp = await authServices.saveOtp(userDetails.userId, req.body.type);

   

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        data: { result: { userId: userDetails.userId } },
        message: utility.getuserMessagess('authMessages.otpSentsuccessfully'),
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    const _2FADetail = await authServices.verifyEmail(req.params.userId, req.body.otp);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.emailVerified'),
        data: { result: _2FADetail }
    });

});

const changePassword = catchAsync(async (req, res) => {
    const user = await authServices.changePassword(req, session);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.passwordUpdatedSuccess'),
    });


});

const forgotPassword = catchAsync(async (req, res) => {
    const userInfo = await tokenService.generateResetPasswordToken(req)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.resetPasswordEmailSuccess'),
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
    forgotPassword,
}