const express = require('express');
const coinsController = require('../controllers/coin');
const router = express.Router();

router.post('/addMarketData', coinsController.createCryptoCoins);
router.get('/cryptoCurrencyInfo', coinsController.getCoinData);
router.post('/coinsCategories', coinsController.getCoinCategories);
router.get('/getByCategoryId/:id', coinsController.getByCategoryId);
router.get('/category', coinsController.getCategory);

module.exports = router;
