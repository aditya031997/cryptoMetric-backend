const { GoPlus, ErrorCode } = require("@goplus/sdk-node");
const axios = require('axios');

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
        console.error('Error fetching token security:', error);
        res.status(500).json({
            status: false,
            msg: 'Error fetching token security',
        });
    }
};

async function getTokenByName(req, res) {
    const { query, chainId } = req.query;
    const url = `https://api.1inch.dev/token/v1.2/search`;
    const config = {
        headers: {
            "Authorization": "Bearer KWZMY4eyaMK0h6Ahn0CouMHnnW903iJF"
        },
        params: {
            "query": query,
            "only_positive_rating": "true"
        }
    };
    const chainIdPriority = [1, 137, 56, 43114, 8453];

    try {
        const response = await axios.get(url, config);
        const responseData = response.data;

        if (responseData && Array.isArray(responseData)) {
            const filteredTokens = responseData.filter(token => {
                const tokenSymbolLowerCase = token.symbol.toLowerCase();
                const queryLowerCase = query.toLowerCase();
                return tokenSymbolLowerCase === queryLowerCase;
            });

            let preferredToken = null;

            // First, try to find the preferred token based on the provided chainId
            preferredToken = filteredTokens.find(token => token.chainId === parseInt(chainId));

            // If no token is found for the provided chainId, use the chainIdPriority array
            if (!preferredToken) {
                for (const priorityChainId of chainIdPriority) {
                    preferredToken = filteredTokens.find(token => token.chainId === priorityChainId);
                    if (preferredToken) break;
                }
            }

            if (preferredToken) {
                const result = {
                    symbol: preferredToken.symbol,
                    chainId: preferredToken.chainId,
                    name: preferredToken.name,
                    address: preferredToken.address,
                    decimals: preferredToken.decimals,
                };
                res.status(200).json({
                    status: true,
                    msg: [result],
                });
            } else {
                res.status(200).json({
                    status: true,
                    msg: [],
                });
            }
        } else {
            console.log("responseData.msg is not an array or not defined");
            res.status(200).json({
                status: true,
                msg: [],
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal server error",
        });
    }
};






module.exports = {
    supplyDistribution,
    getTokenByName,
}
