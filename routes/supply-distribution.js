const express = require('express');
const { supplyDistribution, getTokenByName } = require('../controllers/supply-distribution');

const router = express.Router();

router.get('/distribution', supplyDistribution);
router.get('/tokenByName', getTokenByName);

module.exports = router;
