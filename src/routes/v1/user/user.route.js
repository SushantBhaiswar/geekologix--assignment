const express = require('express');
const validate = require('../../../middlewares/validate');
const { userValidation } = require('../../../validations/v1/user');
const { userController } = require('../../../controllers/v1/user');
const auth = require('../../../middlewares/auth');


const router = express.Router();
router.get('/profile', auth('user'), userController.retriveProfile);
router.patch('/update', auth('user'), validate(userValidation.updateProfile), userController.updateProfile);
router.delete('/delete', auth('user'), userController.deleteProfile);

module.exports = router;
