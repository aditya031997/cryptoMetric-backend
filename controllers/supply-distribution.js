const { GoPlus, ErrorCode } = require("@goplus/sdk-node");
const axios = require("axios");
const goplusSupportedChains = require("../config/goPlusSupportedChains.json");
const TokenModal = require("../models/blockChain-token");
const ethers = require("ethers");
const networkConfig = require("../config/networkConfig.json");
const getProvider = (chain) =>
  new ethers.providers.JsonRpcProvider(networkConfig.rpcUrls[chain]);
const erc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];
async function supplyDistribution(req, res) {
  const { chainId, address } = req.query;
  try {
    let response = await GoPlus.tokenSecurity(chainId, address, 30);
    if (response.code !== ErrorCode.SUCCESS) {
      console.error(response.message);
    } else {
      res.status(200).json({
        status: true,
        msg: response.result,
      });
    }
  } catch (error) {
    console.error("Error fetching token security:", error);
    res.status(500).json({
      status: false,
      msg: "Error fetching token security",
    });
  }
}

// async function getTokenByName(req, res) {
//     const { query, chainId } = req.query;
//     const apiUrl = process.env.ONEINCH_API_URL;
//     const url = `${apiUrl}/token/v1.2/search`;
//     const config = {
//         headers: {
//             "Authorization": "Bearer KWZMY4eyaMK0h6Ahn0CouMHnnW903iJF"
//         },
//         params: {
//             "query": query,
//             "only_positive_rating": "true"
//         }
//     };
//     const chainIdPriority = [1, 137, 56, 43114, 8453];

//     try {
//         const response = await axios.get(url, config);
//         const responseData = response.data;

//         if (responseData && Array.isArray(responseData)) {
//             const filteredTokens = responseData.filter(token => {
//                 const tokenSymbolLowerCase = token.symbol.toLowerCase();
//                 const queryLowerCase = query.toLowerCase();
//                 return tokenSymbolLowerCase === queryLowerCase;
//             });

//             let preferredToken = null;

//             // First, try to find the preferred token based on the provided chainId
//             preferredToken = filteredTokens.find(token => token.chainId === parseInt(chainId));

//             // If no token is found for the provided chainId, use the chainIdPriority array
//             if (!preferredToken) {
//                 for (const priorityChainId of chainIdPriority) {
//                     preferredToken = filteredTokens.find(token => token.chainId === priorityChainId);
//                     if (preferredToken) break;
//                 }
//             }

//             if (preferredToken) {
//                 const result = {
//                     symbol: preferredToken.symbol,
//                     chainId: preferredToken.chainId,
//                     name: preferredToken.name,
//                     address: preferredToken.address,
//                     decimals: preferredToken.decimals,
//                 };
//                 res.status(200).json({
//                     status: true,
//                     msg: [result],
//                 });
//             } else {
//                 res.status(200).json({
//                     status: true,
//                     msg: [],
//                 });
//             }
//         } else {
//             res.status(200).json({
//                 status: true,
//                 msg: [],
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: false,
//             msg: "Internal server error",
//         });
//     }
// };

// async function getTokenDetails(req, res) {
//     try {
//         const { symbol } = req.query;

//         if (!symbol) {
//             return res.status(400).json({
//                 status: false,
//                 msg: "Symbol is required",
//             });
//         }

//         const options = {
//             method: "GET",
//             url: process.env.COIN_MARKET_CAP_API_URL,
//             params: { symbol: symbol },
//             headers: {
//                 Accept: "application/json",
//                 "X-CMC_PRO_API_KEY": "ad588177-d8b4-495e-8ce0-7c6f85c20076",
//             },
//         };

//         let coinList;
//         try {
//             coinList = await axios.request(options);
//         } catch (error) {
//             if (error.response && error.response.status === 400) {
//                 return res.status(200).json({
//                     status: true,
//                     msg: [],
//                 });
//             }
//             throw error;
//         }

//         if (coinList.data.data.length === 0) {
//             return res.status(200).json({
//                 status: true,
//                 msg: [],
//             });
//         }

//         const id = coinList.data.data[0].id;

//         const options2 = {
//             method: "GET",
//             url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info",
//             params: { id: id },
//             headers: {
//                 Accept: "application/json",
//                 "X-CMC_PRO_API_KEY": "ad588177-d8b4-495e-8ce0-7c6f85c20076",
//             },
//         };

//         const coinInfo = await axios.request(options2);

//         // Extract only the required fields
//         const coinData = coinInfo.data.data[id];
//         const simplifiedData = {
//             name: coinData.name,
//             symbol: coinData.symbol,
//             category: coinData.category,
//             description: coinData.description,
//             slug: coinData.slug,
//             logo: coinData.logo
//         };

//         res.status(200).json({
//             status: true,
//             msg: coinData,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: false,
//             msg: error.message,
//         });
//     }
// }

async function getTokenDetails(req, res) {
  const TokenData = await TokenModal();
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({
        status: false,
        msg: "Symbol is required",
      });
    }
    const options = {
      method: "GET",
      url: `${process.env.COIN_MARKET_CAP_API_URL}/map`,
      params: { symbol: symbol },
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY,
      },
    };

    let coinList;

    coinList = await axios.request(options);

    if (coinList.data.data.length === 0) {
      return res.status(200).json({
        status: true,
        msg: [],
      });
    }
    const id = coinList.data.data[0].id;
    const options2 = {
      method: "GET",
      url: `${process.env.COIN_MARKET_CAP_API_URL}/info`,
      params: { id: id },
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY,
      },
    };
    const coinInfo = await axios.request(options2);
    const contractAddresses = coinInfo.data.data[id].contract_address;
    const keys = Object.keys(goplusSupportedChains);
    const selectedChainsForDecimal = ["1", "56", "137", "8453", "43114"];
    const tokenInfo = [];
    const platforms = [];

    for (const contract_address of contractAddresses) {
      const platformName = contract_address.platform.name;
      let decimals;
      for (let i = 0; i < keys.length; i++) {
        if (platformName == keys[i]) {
          const found = selectedChainsForDecimal.find((value) => value == goplusSupportedChains[keys[i]]);
          if (found) {
            const provider = getProvider(goplusSupportedChains[keys[i]])
            const tokenInstance = new ethers.Contract(contract_address.contract_address, erc20Abi, provider);
            decimals = await tokenInstance.decimals();
          }

          platforms.push({
            chainId: goplusSupportedChains[keys[i]],
            chainName: keys[i],
            tokenAddress: contract_address.contract_address,
            decimals: found ? decimals : [],
          });
        }
      }
    };
    tokenInfo.push({
      name: coinInfo.data.data[id].name,
      symbol: coinInfo.data.data[id].symbol,
      category: coinInfo.data.data[id].category,
      platform: platforms,
    });
    // console.log(platforms,"platforms")
    let unmatchedTokens = [];
    for (const platform of platforms) {
      if (selectedChainsForDecimal.includes(platform.chainId)) {
        const existingToken = await TokenData.findOne({
          where: {
            address: platform.tokenAddress,
            chainId: platform.chainId
          }
        });
        // console.log(existingToken,"existingToken")
        if (!existingToken) {
          unmatchedTokens.push({
            address: platform.tokenAddress,
            chainId: platform.chainId,
            name: coinInfo.data.data[id].name,
            decimals: platform.decimals,
            symbol: coinInfo.data.data[id].symbol,
            logoURI: `https://tokens.1inch.io/${platform.tokenAddress}.png`
          });
        }
      }
    }
         await TokenData.bulkCreate(unmatchedTokens)

    console.log("unmatchedTokens", unmatchedTokens,unmatchedTokens.length);


    res.status(200).json({
      status: true,
      msg: tokenInfo,
    });
  } catch (error) {
    console.log(error, "REQUEST ERROR");
    if (error.response && error.response.status === 400) {
      return res.status(200).json({
        status: true,
        msg: [],
      });
    }
    if (error.response.status === 429) {
      res.status(400).json({
        status: false,
        msg: `You've exceeded your API Key's HTTP request rate limit.`,
      });
    }
  }
}

module.exports = {
  supplyDistribution,
  // getTokenByName,
  getTokenDetails,
};
