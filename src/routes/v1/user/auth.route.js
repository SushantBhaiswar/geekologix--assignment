const express = require('express');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations/v1/user');
const { authController } = require('../../../controllers/v1/user');
const auth = require('../../../middlewares/auth');


const router = express.Router();
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', auth('user'), validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/sendVerificationCode', validate(authValidation.sendVerificationCode), authController.sendVerificationCode);
router.post('/verify-email/:userId', validate(authValidation.verifyEmail), authController.verifyEmail);
router.put('/changePassword', auth(), validate(authValidation.changePassword), authController.changePassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

module.exports = router;
