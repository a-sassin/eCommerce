const express = require('express');

const router = express.Router();

const controller = require('../controllers/mfa.controller');

router.post('/registration-mfa', controller.registrationMfa);
router.post('/verify-otp', controller.verifyOtp);
router.post('/mail-otp', controller.mailOTP);
router.post('/sms-otp', controller.smsOtp);
router.post('/registration-otp', controller.registrationOtp);
module.exports = router;
