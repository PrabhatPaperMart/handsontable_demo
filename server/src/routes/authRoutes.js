const express = require('express');
const { handleUserEmailSignup, handleEmailOtpVerification, handleResendOtp, handleUserSignup, handleUserLogin, handlePasswordReset } = require('../controllers/authController');
const router = express.Router();

// All `register` endpoints
router.post('/register/verify/email', handleUserEmailSignup);
router.post('/register/verify/emailOtp', handleEmailOtpVerification);
router.post('/register/verify/resendOtp', handleResendOtp);
router.post('/register', handleUserSignup);

// All `login` endpoints
router.post('/login', handleUserLogin);

// All `password reset` endpoints
router.post('/passwordReset', handlePasswordReset);

module.exports = router;