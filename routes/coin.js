const express= require('express')
const{ Data, create,getCoinData}=require('../controllers/coin')
const router=express.Router()


// router.get('/coins',Data)
router.get('/addMarketdata', create)
router.get('/cryptocurrencyInfo',getCoinData)
module.exports=router