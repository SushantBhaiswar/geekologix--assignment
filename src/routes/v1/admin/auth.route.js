const express = require('express');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations/v1/admin');
const { authController } = require('../../../controllers/v1/admin');
const auth = require('../../../middlewares/auth');


const router = express.Router();
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/sendVerificationCode', validate(authValidation.sendVerificationCode), authController.sendVerificationCode);
router.post('/verify-email/:userId', validate(authValidation.verifyEmail), authController.verifyEmail);
router.get('/resendCode/:userId', authController.resendCode);
router.post('/forgot-password/', validate(authValidation.forgotPassword), authController.forgotPassword);
router.put('/changePassword', auth(), validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
