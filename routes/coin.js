const express = require('express');
const coinsController = require('../controllers/coin');
const router = express.Router();

router.post('/addMarketData', coinsController.createCryptoCoins);
router.get('/cryptoCurrencyInfo', coinsController.getCoinData);
router.post('/addCoinsCategories', coinsController.addCoinCategories);
router.get('/category',coinsController.getCategories)


module.exports = router;

