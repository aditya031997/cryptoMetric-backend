const express = require('express');
const { fetchBalance, walletToken, allowances, grantApproval, buildSwapTx, getTokensToSwapByChainId, checkForTokenExistanceAndDetails, getTokenDetails } = require('../controllers/swap-token');
const router = express.Router();
router.get('/fetchBalance', fetchBalance);
router.post('/walletToken', walletToken);
router.get('/allowances', allowances);
router.post('/grantApproval', grantApproval);
router.post('/buildSwapTx', buildSwapTx);
router.get('/getTokensToSwapByChainId', getTokensToSwapByChainId);
router.get('/getTokenDetails', getTokenDetails);
router.get('/checkForTokenExistanceAndDetails', checkForTokenExistanceAndDetails);









module.exports = router;
