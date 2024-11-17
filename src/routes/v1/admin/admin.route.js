const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminValidation } = require('../../../validations/v1/admin');
const { adminController } = require('../../../controllers/v1/admin');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/retrive/user/data', auth('admin'), validate(adminValidation.retriveData), adminController.retriveData);
router.patch('/update/user/:id', validate(adminValidation.updateUser), adminController.updateUser);
router.delete('/delete/user', validate(adminValidation.deleteUser), adminController.deleteUser);

module.exports = router;
