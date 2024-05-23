const express = require('express');
const { swagger, swapper, convert, tokenprice, allowance, approveTransaction, onwInchToken } = require('../controllers/swap-token');
const router = express.Router();
router.get(`/tokenprice`, tokenprice)
router.get('/swager', swagger);
router.get('/convert', convert);
router.post('/swapper', swapper);
router.get('/allowance', allowance)
router.get('/retriveToken', onwInchToken)
router.get('/approveTransaction', approveTransaction);

module.exports = router;
