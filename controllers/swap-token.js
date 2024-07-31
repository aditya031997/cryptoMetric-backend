const axios = require("axios");
const ethers = require("ethers");
const TokenModal = require("../models/blockChain-token");
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const weth = require("../abis/weth.json");
const { ChainId, Fetcher, WETH } = require("@uniswap/sdk");
const { Pool } = require("@uniswap/v3-sdk");
const uniswapRouterAbi = require("../abis/uniswapRouter.json");
const quoterAbi = require("../abis/quoter.json");
const uniswapV2Router02Abi = require("../abis/uniswapV2Router02.json")
const erc20Abi = require("../abis/erc20.json");
const networkConfig = require("../config/networkConfig.json");
const nativeToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const {
  AlphaRouter,
  nativeOnChain,
  SwapType,
} = require("@uniswap/smart-order-router");
const {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const { getTokensByChainId } = require("../tokens/index");
const getProvider = (chain) =>
  new ethers.providers.JsonRpcProvider(networkConfig.rpcUrls[chain]);

const getTokenAddress = (tokenAddress, chain) =>
  tokenAddress === nativeToken
    ? networkConfig.defaultTokenAddresses[chain]
    : tokenAddress;

async function fetchBalance(req, res) {
  const { walletAddress, tokenAddress, chain } = req.query;
  try {
    const provider = getProvider(chain);
    let balance;
    if (tokenAddress === nativeToken) {
      const rawBalance = await provider.getBalance(walletAddress);
      balance = ethers.utils.formatEther(rawBalance);
    } else {
      const contractInstance = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        provider
      );
      const decimals = await contractInstance.decimals();
      const rawBalance = await contractInstance.balanceOf(walletAddress);
      balance = ethers.utils.formatUnits(rawBalance.toString(), decimals);
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

async function getTokensToSwapByChainId(req, res) {
  try {
    const { chain } = req.query;
    const tokens = getTokensByChainId(chain);
    // const TokenData = await TokenModal();

    // for (const token of tokens) {
    //     await TokenData.create(token);
    // }
    // const storedTokens = await TokenData.findAll({
    //     where: { chainId: chain }
    // });
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
}
async function buildSwapTx(req, res) {
  try {
    const { chain, fromTokenObj, toTokenObj, amountIn, walletAddress, slippageTolerance } =
      req.body;
    const tnxslipage = slippageTolerance * 10
    const provider = getProvider(chain);

    const fromToken =
      fromTokenObj.address === nativeToken
        ? nativeOnChain(chain)
        : new Token(
          chain,
          fromTokenObj.address,
          fromTokenObj.decimals,
          fromTokenObj.symbol,
          fromTokenObj.name
        );
    const toToken =
      toTokenObj.address === nativeToken
        ? nativeOnChain(chain)
        : new Token(
          chain,
          toTokenObj.address,
          toTokenObj.decimals,
          toTokenObj.symbol,
          toTokenObj.name
        );

    if (
      (fromTokenObj.symbol == "WETH" && toTokenObj.symbol == "ETH") ||
      (fromTokenObj.symbol == "ETH" && toTokenObj.symbol == "WETH")
    ) {
      const wethInteraction = {
        to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        amountOut: amountIn,
        value: ethers.utils.parseUnits(amountIn, fromToken.decimals),
        data: fromToken.symbol == "WETH" ? "0xd0e30db0" : "0x2e1a7d4d",
      };

      return res.json(wethInteraction);
    }
    const router = new AlphaRouter({ chainId: chain, provider });

    const amountInCurrency = CurrencyAmount.fromRawAmount(
      fromToken,
      ethers.utils.parseUnits(amountIn, fromToken.decimals)
    );

    // Find best route
    const route = await router.route(
      amountInCurrency,
      toToken,
      TradeType.EXACT_INPUT,
      {
        recipient: walletAddress,
        slippageTolerance: new Percent(tnxslipage, 10000), // 0.5%
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
        type: SwapType.SWAP_ROUTER_02,
      }
    );

    let amountOut = route?.quote.toFixed(6);
    if (!route) {
      return res.status(500).json({
        message: "No route found",
        details: "No route found",
      });
    }

    if (route.route[0].protocol == "V2") {
      const routerAddress = networkConfig.routerAddresses[chain];
      const routerContract = new ethers.Contract(
        routerAddress,
        uniswapV2Router02Abi,
        provider
      );
      const fromAddress = fromToken.address
        ? fromToken.address
        : getTokenAddress(nativeToken, chain);
      const toAddress = toToken.address
        ? toToken.address
        : getTokenAddress(nativeToken, chain);

      const quotationPath = [fromAddress, toAddress];
      const amountInWei = ethers.utils.parseUnits(
        amountIn.toString(),
        fromTokenObj.decimals
      );

      try {
        const quote = await routerContract.getAmountsOut(
          amountInWei.toString(),
          quotationPath
        );
      } catch (error) {
        return res.status(500).json({
          message: "No direct route found",
          details: "No direct route found",
        });
      }
      let method, value, data;
      const swapPath = [fromAddress, toAddress];
      const amountOutMin = quote[1].mul(100 - slippageTolerance).div(100); // .5% slippage
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

      if (fromTokenObj.address === nativeToken) {
        method = "swapExactETHForTokens";
        value = amountInWei;
        data = routerContract.interface.encodeFunctionData(method, [
          amountOutMin,
          swapPath,
          walletAddress,
          deadline,
        ]);
      } else if (toTokenObj.address === nativeToken) {
        method = "swapExactTokensForETH";
        value = "0";
        data = routerContract.interface.encodeFunctionData(method, [
          amountInWei,
          amountOutMin,
          swapPath,
          walletAddress,
          deadline,
        ]);
      } else {
        method = "swapExactTokensForTokens";
        value = "0";
        data = routerContract.interface.encodeFunctionData(method, [
          amountInWei,
          amountOutMin,
          swapPath,
          walletAddress,
          deadline,
        ]);
      }

      const transaction = {
        to: routerAddress,
        amountOut: ethers.utils.formatUnits(
          amountOutMin.toString(),
          toTokenObj.decimals
        ),
        data,
        value: value.toString(),
      };
      return res.status(200).json(transaction);
    }
    if (amountOut === '0.000000') {
      amountOut = 0
    }
    // Build transaction
    const transaction = {
      to: route.methodParameters?.to,
      amountOut,
      data: route.methodParameters?.calldata,
      value: route.methodParameters?.value,
      gasLimit: ethers.utils.hexlify(200000),
      gasPrice: ethers.utils.hexlify(route.gasPriceWei),
    };
    res.json(transaction);
  } catch (error) {
    console.error(error);
    // return error;
    res.status(500).json({
      message: "Error building swapTx",
      details: error.message,
    });
  }
}

async function allowances(req, res) {
  try {
    const { tokenAddress, walletAddress, chain, spender } = req.query;
    const provider = getProvider(chain);
    const finalTokenAddress = getTokenAddress(tokenAddress, chain);
    const contractInstance = new ethers.Contract(
      finalTokenAddress,
      weth,
      provider
    );
    const allowance = await contractInstance.allowance(walletAddress, spender);
    res.json(Number(allowance));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching allowance",
      details: error.message,
    });
  }
}

async function grantApproval(req, res) {
  try {
    const { tokenAddress, value, chain, spender } = req.query;
    const provider = getProvider(chain);
    const finalTokenAddress = getTokenAddress(tokenAddress, chain);
    const contractInstance = new ethers.Contract(
      finalTokenAddress,
      weth,
      provider
    );
    const data = contractInstance.interface.encodeFunctionData("approve", [
      spender,
      ethers.utils.parseEther(value),
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

async function walletToken(req, res) {
  try {
    const { chain, address, nativeToken } = req.body;

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    });
    const updatedResponse = response?.jsonResponse?.map((token) => {
      return {
        ...token,
        balance: ethers.utils.formatUnits(token?.balance, token?.decimals),
      };
    });
    const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    const native = nativeBalance.result.balance.ether;
    nativeToken.balance = native;
    nativeToken.verified_contract = true;
    if (Array.isArray(response.jsonResponse) && response.jsonResponse.length) {
      updatedResponse.push(nativeToken);
    }

    res.status(200).json({
      status: true,
      msg: updatedResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
}

async function checkForTokenExistanceAndDetails(req, res) {
  try {
    let { fromToken, toToken, chain } = req.query;
    const provider = getProvider(chain);
    if (fromToken == nativeToken) {
      fromToken = getTokenAddress(fromToken, chain);
    } else if (toToken == nativeToken) {
      toToken = getTokenAddress(toToken, chain);
    }
    async function getTokenDetails(tokenAddress) {
      const erc20Abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        provider
      );
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      return { name, symbol, decimals };
    }

    async function checkPairUniswapV2(fromToken, toToken) {
      const tokenAInstance = await Fetcher.fetchTokenData(
        ChainId.MAINNET,
        fromToken,
        provider
      );
      const tokenBInstance = await Fetcher.fetchTokenData(
        ChainId.MAINNET,
        toToken,
        provider
      );
      const pair = await Fetcher.fetchPairData(
        tokenAInstance,
        tokenBInstance,
        provider
      );
      return pair;
    }

    // Function to check if pool exists on Uniswap V3
    async function checkPairUniswapV3(
      fromToken,
      toToken,
      tokenADetails,
      tokenBDetails
    ) {
      const erc20Abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
      ];
      const tokenAInstance = new Token(
        ChainId.MAINNET,
        fromToken,
        tokenADetails.decimals,
        tokenADetails.symbol,
        tokenADetails.name
      );
      const tokenBInstance = new Token(
        ChainId.MAINNET,
        toToken,
        tokenBDetails.decimals,
        tokenBDetails.symbol,
        tokenBDetails.name
      );
      const poolAddress = Pool.getAddress(tokenAInstance, tokenBInstance, 3000); // Fee tier 0.3%
      return poolAddress;
    }

    const erc20Abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ];

    let tokenADetails;
    let tokenBDetails;

    try {
      tokenADetails = await getTokenDetails(fromToken);
    } catch (error) {
      console.log("error", error.message);
    }

    try {
      tokenBDetails = await getTokenDetails(fromToken);
    } catch (error) {
      console.log("error", error.message);
    }

    // Check pair on Uniswap V2
    try {
      const pairV2 = await checkPairUniswapV2(fromToken, toToken);
      console.log("Uniswap V2 Pair exists:", pairV2);
    } catch (error) {
      console.log("Uniswap V2 Pair does not exist");
    }

    // Check pair on Uniswap V3
    try {
      const pairV3Exists = await checkPairUniswapV3(
        fromToken,
        toToken,
        tokenADetails,
        tokenBDetails
      );
      console.log("Uniswap V3 Pair exists");
    } catch (error) {
      console.log("Uniswap V3 Pair does not exist");
    }

    // Get token details
    const tokenDetailsA = await getTokenDetails(fromToken);
    tokenDetailsA.address = fromToken;
    const tokenDetailsB = await getTokenDetails(toToken);
    tokenDetailsB.address = toToken;
    res.status(200).json({
      tokenADetails: tokenDetailsA,
      tokenBDetails: tokenDetailsB,
    });
  } catch (error) {
    console.log("error", error.message);
  }
}

async function getTokenDetails(req, res) {
  try {
    let { token, chain } = req.query;
    if (token == nativeToken) {
      token = getTokenAddress(token, chain);
    }
    const provider = getProvider(chain);
    const erc20Abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ];
    const tokenContract = new ethers.Contract(token, erc20Abi, provider);
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const logoURI = `https://tokens.1inch.io/${token}.png`;
    const searchData = {
      name,
      symbol,
      decimals,
      address: token,
      logoURI,
    };
    res.status(200).json({
      data: searchData,
    });
  } catch (error) {
    res.status(400).json({
      message: "Please enter a valid address",
    });
  }
}

module.exports = {
  fetchBalance,
  walletToken,
  allowances,
  grantApproval,
  buildSwapTx,
  getTokensToSwapByChainId,
  checkForTokenExistanceAndDetails,
  getTokenDetails,
};
