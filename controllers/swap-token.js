const axios = require("axios");
const ethers = require("ethers");
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const weth = require("../abis/weth.json");
const uniswapRouterAbi = require("../abis/uniswapRouter.json");
const quoterAbi = require("../abis/quoter.json");
const erc20Abi = require("../abis/erc20.json");
const networkConfig = require("../config/networkConfig.json");
const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const getProvider = (chain) => new ethers.JsonRpcProvider(networkConfig.rpcUrls[chain]);

const getTokenAddress = (tokenAddress, chain) =>
    tokenAddress === nativeToken
        ? networkConfig.defaultTokenAddresses[chain]
        : tokenAddress;


async function fetchBalance(req, res) {
    const { walletAddress, tokenAddress, chain } = req.query;
    console.log(req.query, "req.query")
    try {
        const provider = getProvider(chain);
        let balance;
        if (tokenAddress === nativeToken) {
            const rawBalance = await provider.getBalance(walletAddress);
            balance = ethers.formatEther(rawBalance);
        } else {
            const contractInstance = new ethers.Contract(tokenAddress, erc20Abi, provider);
            const decimals = await contractInstance.decimals();
            const rawBalance = await contractInstance.balanceOf(walletAddress);
            balance = ethers.formatUnits(rawBalance.toString(), decimals);
        }
        res.json(balance);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: error.message,
        });
    }
}

async function allowances(req, res) {
    try {
        const { tokenAddress, walletAddress, chain } = req.query;
        const provider = getProvider(chain);
        const finalTokenAddress = getTokenAddress(tokenAddress, chain);
        const contractInstance = new ethers.Contract(finalTokenAddress, weth, provider);
        const allowance = await contractInstance.allowance(walletAddress, networkConfig.spenders[chain]);
        res.json(Number(allowance));
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching allowance",
            details: error.message,
        });
    }
}

async function approve(req, res) {
    try {
        const { tokenAddress, value, chain } = req.query;
        const finalTokenAddress = getTokenAddress(tokenAddress, chain);
        const contractInstance = new ethers.Contract(finalTokenAddress, weth);
        const data = contractInstance.interface.encodeFunctionData('approve', [
            networkConfig.spenders[chain],
            ethers.parseEther(value),
        ]);
        const tx = {
            to: finalTokenAddress,
            data,
        };
        res.json(tx);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: error.message,
        });
    }
}

async function swap(req, res) {
    const { fromToken, toToken, amountIn, chain, walletAddress, quotation } = req.body;
    try {
        const uniswapRouterAddress = networkConfig.routerAddresses[chain];
        const contractInstance = new ethers.Contract(uniswapRouterAddress, uniswapRouterAbi);

        let swapData;
        let tx;

        if (fromToken == nativeToken) {
            const fromTokenAddress = getTokenAddress(fromToken, chain);
            swapData = [
                Number(quotation),
                [fromTokenAddress, toToken],
                walletAddress,
                Math.floor(Date.now() / 1000) + 5 * 60,
            ];
            const data = contractInstance.interface.encodeFunctionData('swapExactETHForTokens', swapData);
            tx = {
                to: uniswapRouterAddress,
                data,
                value: ethers.parseEther(amountIn.toString()),
            };
        } else {
            const provider = getProvider(chain);
            const tokenInstance = new ethers.Contract(fromToken, abi, provider);
            const decimals = await tokenInstance.decimals();

            swapData = [
                ethers.parseUnits(amountIn.toString(), decimals),
                Number(quotation),
                [fromToken, toToken],
                walletAddress,
                Math.floor(Date.now() / 1000) + 5 * 60,
            ];
            const data = contractInstance.interface.encodeFunctionData('swapExactTokensForTokens', swapData);
            tx = {
                to: uniswapRouterAddress,
                data,
            };
        }

        const serializedTx = JSON.stringify(tx, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );
        res.setHeader('Content-Type', 'application/json');
        res.end(serializedTx);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}


async function quotation(req, res) {
    const { fromToken, toToken, amountIn, chain } = req.body;
    try {
        const quoter = networkConfig.quoters[chain];
        const provider = getProvider(chain);
        const fromTokenAddress = getTokenAddress(fromToken, chain);
        const toTokenAddress = getTokenAddress(toToken, chain);
        const quoterContract = new ethers.Contract(quoter, quoterAbi, provider);
        const tokenInstance = new ethers.Contract(fromTokenAddress, erc20Abi, provider)
        const decimals = await tokenInstance.decimals()
        const quotesInBigInt = await quoterContract.quoteExactInputSingle.staticCall([
            fromTokenAddress,
            toTokenAddress,
            ethers.parseUnits(amountIn.toString(), decimals),
            3000,
            0,
        ]);
        res.json(Number(quotesInBigInt[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function tokenprice(req, res) {
    const apiUrl = process.env.ONEINCH_API_URL;
    const { query } = req;
    const url = `${apiUrl}/swap/v6.0/137/tokens`;
    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
    };

    try {
        const response = await axios.get(url, config);
        const usdPrices = {
            tokenOne: response.data.responseOne.raw.usdPrice,
            tokenTwo: response.data.responseTwo.raw.usdPrice,
            ratio: response.data.responseOne.raw.usdPrice / response.data.responseTwo.raw.usdPrice,
        };

        res.status(200).json(usdPrices);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal server error",
        });
    }
}

async function onwInchToken(req, res) {
    const apiUrl = process.env.ONEINCH_API_URL;
    const { chain, query } = req.query;
    const url = `${apiUrl}/token/v1.2/${chain}/search`;
    const config = {
        headers: {
            Authorization: "Bearer 9MsoPLjRdeMTEI8v9uD5Ij3Gzwm7HmBr",
        },
        params: {
            query,
            only_positive_rating: "true",
        },
    };

    try {
        const response = await axios.get(url, config);
        res.status(200).json({
            status: true,
            msg: response.data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal server error",
        });
    }
}

async function walletToken(req, res) {
    try {
        await Moralis.start({
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjJmZTlkNDVkLWUzYjktNDBjZS04NzQ4LWJiZmYxOTVlMzRhNiIsIm9yZ0lkIjoiMjQyNjM1IiwidXNlcklkIjoiMjQ0OTM5IiwidHlwZUlkIjoiOGZlZjE1N2QtZGM2NS00NWQ3LTllMTAtMzNlMDk4Mzc0MGFjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTg4NjQ4NjksImV4cCI6NDg3NDYyNDg2OX0.t2BaLbRPV0gJqFe2Wg804X3wj4gOa69uJgsieyqH0Gw",
        });

        const address = "0xB7aacD03a2f18a9868fdCA4e664c57f5a2d4008f";
        const chain = 137;
        const response = await Moralis.EvmApi.token.getWalletTokenBalances({
            address,
            chain,
        });

        res.status(200).json({
            status: true,
            msg: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: error.message,
        });
    }
}

module.exports = {
    fetchBalance,
    tokenprice,
    onwInchToken,
    walletToken,
    allowances,
    approve,
    swap,
    quotation,
};
