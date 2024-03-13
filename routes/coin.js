const express = require('express');
const coinsController = require('../controllers/coin');
const router = express.Router();

router.get('/addMarketData', coinsController.createCryptoCoins);
router.get('/cryptoCurrencyInfo', coinsController.getCoinData);
router.get('/coinsCategories', coinsController.getCoinCategories);
router.get('/getBycategoryId/:id', coinsController.getbyCategoryId);



module.exports = router;
