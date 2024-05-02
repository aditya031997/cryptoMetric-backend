const axios = require("axios");
const ethers = require('ethers')


async function tokenprice(req, res) {
    const { query } = req;
    const url = "https://api.1inch.dev/swap/v6.0/137/tokens";
    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
    };

    const usdPrices = {
        tokenOne: responseOne.raw.usdPrice,
        tokenTwo: responseTwo.raw.usdPrice,
        ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
    };

    return res.status(200).json(usdPrices);
}

async function swager(req, res) {
    const { chain } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chain}/tokens`;
    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
    };

    try {
        const response = await axios.get(url, config);
        const responseData = response.data;

        res.status(200).json({
            status: true,
            msg: responseData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal server error",
        });
    }
}

async function convert(req, res) {

    const { addresses, chain } = req.query;
    const url = `https://api.1inch.dev/price/v1.1/${chain}/${addresses}`;

    // Configure the request
    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
        params: {
            "currency": "USD"

        }
    };

    try {
        const amountInResponse = await axios.get(url, config);
        const amountIn = amountInResponse.data[addresses];
        res.status(200).json({
            status: true,
            msg: amountIn.toString(), // Convert BigNumber to string
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal server error",
        });
    }
}

async function allowance(req, res) {
    const { tokenAddress, walletAddress } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/137/approve/allowance`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: "Bearer VdWWOOLQIOJ0vUdsJ1WQOuXmT5QtOzJp",
            },
            params: {
                tokenAddress,
                walletAddress,
            },
        });

        res.json(response.data);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching allowance", details: error.message });
    }
};
async function approveTransaction(req, res) {
    const { tokenAddress,chain } = req.query;
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.1inch.dev/swap/v6.0/${chain}/approve/transaction?tokenAddress=${tokenAddress}`,
        headers: {
            Authorization: "Bearer VdWWOOLQIOJ0vUdsJ1WQOuXmT5QtOzJp",
        },
    };

    return axios
        .request(config)
        .then((response) => {
            return res.json(JSON.stringify(response.data))
        })
        .catch((error) => {
            console.log({ error: error.response.data });
            return res.json(JSON.stringify(error.response.data))

        });
}


async function swapper(req, res) {
    const { src, dst, amount, from, slippage, gas,chain, gasPrice } = req.body;
    const url = `https://api.1inch.dev/swap/v6.0/${chain}/swap`;

    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
        params: {
            src,
            dst,
            amount,
            from,
            slippage,
            gas,
            gasPrice
        }
    };

    try {
        const response = await axios.get(url, config);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}




// Export the middleware functions
module.exports = {
    swager,
    convert,
    swapper,
    tokenprice,
    allowance,
    approveTransaction,
};
