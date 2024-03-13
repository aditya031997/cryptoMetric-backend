const express= require('express')
const coinsController = require("../controllers/coin")
const router=express.Router()


// router.get('/coins',Data)
router.get('/addMarketdata',coinsController.createCryptoCoins)
router.get('/cryptocurrencyInfo',coinsController.getCoinData)
module.exports=router