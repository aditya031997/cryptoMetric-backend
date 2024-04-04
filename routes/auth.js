const express = require('express');
const auth = require('../controllers/auth');
const  router = express.Router();

router.post('/register',auth.registerUser);
router.post('/login', auth.loginUser);






router.get('/getall',auth.getUser)
router.get('/getby/:id',auth.getUsersBy)
router.post('/add',auth.addData)
router.put('/up/:id',auth.updateUser)
router.delete('/del',auth.deleteUser)
router.delete('/delq',auth.deleteQuery)
router.put('/up/:id',auth.updateuser)
                
module.exports = router;
