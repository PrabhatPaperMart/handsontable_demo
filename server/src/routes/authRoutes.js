const express = require('express');
const { handleUserInfoSignup, handleUserSignup, handleUserLogin, handlePasswordReset } = require('../controllers/authController');
const router = express.Router();

router.post('/register/info', handleUserInfoSignup);
router.post('/register', handleUserSignup);
router.post('/login', handleUserLogin);
router.post('/passwordReset', handlePasswordReset);

module.exports = router;