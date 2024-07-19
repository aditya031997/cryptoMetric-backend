const express = require('express');
const { supplyDistribution, getTokenByName,getTokenDetails } = require('../controllers/supply-distribution');

const router = express.Router();

router.get('/distribution', supplyDistribution);
router.get('/tokenByName', getTokenByName);
router.get('/tokenDetail', getTokenDetails);


module.exports = router;
