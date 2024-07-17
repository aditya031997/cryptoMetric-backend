const bscTokens = require("./bsc.json");
const arbTokens = require("./arb.json");
const polygonTokens = require("./polygon.json");
const baseTokens = require("./base.json");
const ethereumTokens = require("./ethereum.json");



const allTokens = {
    1: ethereumTokens,
    56: bscTokens,
    137: polygonTokens,
    8453: baseTokens,
    43114: arbTokens,
}

const getTokensByChainId = (chainId) => {
    return allTokens[chainId]
}

module.exports = {
    getTokensByChainId
}