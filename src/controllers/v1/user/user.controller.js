const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { userServices } = require('../../../services/v1/user');
const utility = require('../../../utils/helper');


const retriveProfile = catchAsync(async (req, res) => {
    const response = await userServices.getProfile(req);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('userMessages.profileGetSuccessfully'),
        data: response
    });

});

const updateProfile = catchAsync(async (req, res) => {
    await userServices.updateProfile(req);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('userMessages.profileUpdated'),
    });


});

const deleteProfile = catchAsync(async (req, res) => {
    await userServices.deleteProfile(req)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('userMessages.profileDeleted'),
    });

});

module.exports = {
    deleteProfile,
    updateProfile,
    retriveProfile
}