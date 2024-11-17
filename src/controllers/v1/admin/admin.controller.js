
const { adminServices } = require('../../../services/v1/admin');
const utility = require('../../../utils/helper');
const httpStatus = require('http-status');

const catchAsync = require('../../../utils/catchAsync');

const retriveData = catchAsync(async (req, res) => {
    const response = await adminServices.retriveData(req);

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getadminMessagess('adminMessages.profileGetSuccessfully'),
        data: { result: response }
    });

});

const updateUser = catchAsync(async (req, res) => {
    await adminServices.updateProfile(req);
    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getadminMessagess('adminMessages.profileUpdated'),
    });


});

const deleteUser = catchAsync(async (req, res) => {
    await adminServices.deleteProfile(req)

    res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getadminMessagess('adminMessages.profileDeleted'),
    });

});

module.exports = {
    deleteUser,
    updateUser,
    retriveData
}