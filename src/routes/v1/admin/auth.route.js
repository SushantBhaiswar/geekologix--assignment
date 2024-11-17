const express = require('express');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations/v1/admin');
const { authController } = require('../../../controllers/v1/admin');


const router = express.Router();
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

module.exports = router;
