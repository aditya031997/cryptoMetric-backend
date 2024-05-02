const express = require('express');
const { swager, swapper, convert, tokenprice, allowance, approveTransaction } = require('../controllers/swap-token');
const router = express.Router();
router.get(`/tokenprice`, tokenprice)
router.get('/swager', swager);
router.get('/convert', convert);
router.post('/swapper', swapper);
router.get('/allowance', allowance)
router.get('/approveTransaction', approveTransaction);

module.exports = router;
