const express = require('express');
const { fetchBalance, tokenprice, onwInchToken ,walletToken,allowances,grantApproval,swap,quotation,buildSwapTx,getTokensToSwapByChainId} = require('../controllers/swap-token');
const router = express.Router();
router.get(`/tokenprice`, tokenprice)
router.get('/fetchBalance', fetchBalance);
router.get('/retriveToken', onwInchToken)
router.get('/walletToken', walletToken);
router.get('/allowances', allowances);
router.post('/grantApproval', grantApproval);
router.post('/swap', swap); // not required 
router.post('/quotation', quotation); // not required 
router.post('/buildSwapTx', buildSwapTx);
router.get('/getTokensToSwapByChainId', getTokensToSwapByChainId);








module.exports = router;
