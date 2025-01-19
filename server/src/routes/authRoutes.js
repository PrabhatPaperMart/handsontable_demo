const express = require('express');
const { handleUserSignup, handleUserLogin, handlePasswordReset } = require('../controllers/authController');
const router = express.Router();

router.post('/register', handleUserSignup);
router.post('/login', handleUserLogin);
router.post('/passwordReset', handlePasswordReset);

module.exports = router;