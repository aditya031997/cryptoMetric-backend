const express = require('express');
const coinsController = require('../controllers/coin');
const router = express.Router();

router.get('/addMarketData', coinsController.createCryptoCoins);
router.get('/cryptoCurrencyInfo', coinsController.getCoinData);

module.exports = router;
