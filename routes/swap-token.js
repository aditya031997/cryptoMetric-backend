const express = require('express');
const { fetchBalance, tokenprice, onwInchToken ,walletToken,allowances,approve,swap,quotation} = require('../controllers/swap-token');
const router = express.Router();
router.get(`/tokenprice`, tokenprice)
router.get('/fetchBalance', fetchBalance);
router.get('/retriveToken', onwInchToken)
router.get('/walletToken', walletToken);
router.get('/allowances', allowances);
router.get('/approve', approve);
router.post('/swap', swap);
router.post('/quotation', quotation);






module.exports = router;
