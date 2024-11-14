const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminValidation } = require('../../../validations/v1/admin');
const { adminController } = require('../../../controllers/v1/admin');
const auth = require('../../../middlewares/auth');
const utility = require('../../../utils/helper');
const httpStatus = require('http-status');

const router = express.Router();
router.get('/test', (req, res) => {
     res.sendJSONResponse({
        code: httpStatus.OK,
        status: true,
        message: utility.getuserMessagess('authMessages.test'),
    });
});
router.post('/retrive/user/data', validate(adminValidation.retriveData), adminController.retriveData);
router.patch('/update/user', validate(adminValidation.updateUser), adminController.updateUser);
router.delete('/delete/user', validate(adminValidation.deleteUser), adminController.deleteUser);

module.exports = router;
