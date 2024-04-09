const express = require('express');
const auth = require('../controllers/auth');
const  router = express.Router();

router.post('/register',auth.registerUser);
router.post('/login', auth.loginUser);


router.get('/getall',auth.getUser)
router.get('/getby/:id',auth.getUsersBy)

                
module.exports = router;
