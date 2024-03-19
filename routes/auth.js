const express = require('express');
const auth = require('../controllers/auth');
const  router = express.Router();

router.post('/register',auth.registerUser);
router.post('/login', auth.loginUser);

module.exports = router;
