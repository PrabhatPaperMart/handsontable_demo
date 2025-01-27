const express = require('express');
const { handleUserEmailSignup, handleUserSignup, handleUserLogin, handlePasswordReset } = require('../controllers/authController');
const router = express.Router();

router.post('/register/verify/email', handleUserEmailSignup);
router.post('/register', handleUserSignup);
router.post('/login', handleUserLogin);
router.post('/passwordReset', handlePasswordReset);

module.exports = router;