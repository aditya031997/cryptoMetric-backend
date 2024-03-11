const express= require('express')
const{ Data, Listing}=require('../controllers/coin')
const router=express.Router()


router.get('/coins',Data)
router.get('/list', Listing)
module.exports=router