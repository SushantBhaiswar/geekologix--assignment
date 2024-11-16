const express = require('express');
const validate = require('../../../middlewares/validate');
const { userValidation } = require('../../../validations/v1/user');
const { userController } = require('../../../controllers/v1/user');
const auth = require('../../../middlewares/auth');


const router = express.Router();
router.post('/Profile', auth('user'), validate(userValidation.retriveProfile), userController.retriveProfile);
router.patch('/update', auth('user'), validate(userValidation.updateProfile), userController.updateProfile);
router.delete('/delete/account', auth('user'), validate(userValidation.deleteProfile), userController.deleteProfile);

module.exports = router;
