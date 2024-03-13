const express = require('express');
const auth = require('../controllers/auth');
const router = express.Router();

// router.post('/register');
router.post('/login', auth.loginUser);

module.exports = router;
