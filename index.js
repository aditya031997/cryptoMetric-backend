const express = require('express');
const cors = require('cors');
const Moralis = require("moralis").default;
const auth = require('./routes/auth');
const dotenv = require('dotenv');
const coins = require('./routes/coin');
const { connectToDatabase } = require('./database/db');
const { Server } = require('socket.io');
const http = require('http');
const { startCronJob, socketData } = require('./utils/cronjob');
const axios = require('axios');
const swap = require('./routes/swap-token');
const supply = require('./routes/supply-distribution');
const erc20Abi = require("./abis/erc20.json");
const weth = require('./abis/weth.json');
const networkConfig = require("./config/networkConfig.json");
const ethers = require('ethers')

dotenv.config();

const port = process.env.PORT || 3000; // Add a default port
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());
app.use(cors());

// Define routes
app.use('/api', auth);
app.use('/api/coins', coins);
app.use('/tokens', swap);
app.use('/supply', supply);

// Connect to the database
connectToDatabase();

// Start cron job
startCronJob(io);

io.on('connection', async (socket) => {
  console.log('Socket Connected --->');

  if (socketData) {
    socket.emit('InitialTableListing', socketData);
  }

  try {
    const response = await axios.get(`${process.env.SERVER_PORT}/api/coins/cryptoCurrencyInfo`); // Adjusted the URL
    socket.emit('InitialTableListing', response.data);
  } catch (error) {
    console.error('Error fetching initial data:', error.response ? error.response.data : error.message);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const startServer = async () => {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
}
server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

startServer();


// const providerOfEthereum = new ethers.providers.JsonRpcProvider(
//   "https://eth.meowrpc.com"
// );
// const providerOfPolygon = new ethers.providers.JsonRpcProvider(
//   "https://polygon.meowrpc.com"
// );
// const providerOfBNB = new ethers.providers.JsonRpcProvider(
//   "https://bsc-rpc.publicnode.com"
// );
// const providerOfBase = new ethers.providers.JsonRpcProvider(
//   "https://base.drpc.org"
// );
// const providerOfAvax = new ethers.providers.JsonRpcProvider(
//   "https://avalanche.drpc.org"
// );

// const provider = (rpcUrl) => new ethers.providers.JsonRpcProvider(rpcUrl)

// const uniswapV2FactoryAddressEthereum =
//   "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// const uniswapV3FactoryAddressEthereum =
//   "0x1F98431c8aD98523631AE4a59f267346ea31F984";
// const uniswapV2FactoryAddressPolygon =
//   "0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C";
// const uniswapV3FactoryAddressPolygon =
//   "0x1F98431c8aD98523631AE4a59f267346ea31F984";
// const uniswapV2FactoryAddressBNB = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6";
// const uniswapV3FactoryAddressBNB = "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7";
// const uniswapV2FactoryAddressBase =
//   "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6";
// const uniswapV3FactoryAddressBase =
//   "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";
// const uniswapV2FactoryAddressAvax =
//   "0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C";
// const uniswapV3FactoryAddressAvax =
//   "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD";

// const uniswapV2FactoryAbi = require("./abis/uniswapV2Factory.json");
// const uniswapV3FactoryAbi = require("./abis/uniswapV3Factory.json");

// const getTokenInstance = async (token, provider) => {
//   return new ethers.Contract(token, weth, provider);
// }

// const processTokenInfo = async (token0, token1, chain) => {
//   // check tokens for db existence
//   // console.log('chain', chain)
//   // console.log("token0", token0);
//   // console.log("token1", token1);
//   // if not found, make db entry
//   const tokenInstance = await getTokenInstance(token1, provider(networkConfig.rpcUrls[chain]));
//   const address = ""; // token
//   const tokenName = await tokenInstance.name();
//   // console.log('tokenName', tokenName)
//   const tokenSymbol = await tokenInstance.symbol();
//   // console.log('tokenSymbol', tokenSymbol);
//   const tokenDecimal = await tokenInstance.decimals();
//   // console.log('tokenDecimal', tokenDecimal)
//   const chainId = chain;
//   // console.log('chainId', chainId)
//   const logoURI = ""
// }

// const uniswapV2FactoryEthereumInstance = new ethers.Contract(
//   uniswapV2FactoryAddressEthereum,
//   uniswapV2FactoryAbi,
//   provider(networkConfig.rpcUrls["1"])
// );

// uniswapV2FactoryEthereumInstance.on(
//   "PairCreated",
//   async (token0, token1, pair, number) => {
//     // console.log('Eth');
//     await processTokenInfo(token0, token1, 1);
//   }
// );

// const uniswapV2FactoryPolygonInstance = new ethers.Contract(
//   uniswapV2FactoryAddressPolygon,
//   uniswapV2FactoryAbi,
//   provider(networkConfig.rpcUrls["137"])
// );

// uniswapV2FactoryPolygonInstance.on(
//   "PairCreated",
//   async (token0, token1, pair, number) => {
//     // console.log('Polygon');
//     await processTokenInfo(token0, token1, 137);
//   }
// );

// const uniswapV2FactoryBNBInstance = new ethers.Contract(
//   uniswapV2FactoryAddressBNB,
//   uniswapV2FactoryAbi,
//   provider(networkConfig.rpcUrls["56"])
// );

// uniswapV2FactoryBNBInstance.on(
//   "PairCreated",
//   async (token0, token1, pair, number) => {
//     // console.log("BNB");
//     await processTokenInfo(token0, token1, 56);
//   }
// );

// const uniswapV2FactoryBaseInstance = new ethers.Contract(
//   uniswapV2FactoryAddressBase,
//   uniswapV2FactoryAbi,
//   provider(networkConfig.rpcUrls["8453"])
// );

// uniswapV2FactoryBaseInstance.on(
//   "PairCreated",
//   async (token0, token1, pair, number) => {
//     // console.log("Base");
//     await processTokenInfo(token0, token1, 8453);
//   }
// );

// const uniswapV2FactoryAvaxInstance = new ethers.Contract(
//   uniswapV2FactoryAddressAvax,
//   uniswapV2FactoryAbi,
//   provider(networkConfig.rpcUrls["43114"])
// );

// uniswapV2FactoryAvaxInstance.on(
//   "PairCreated",
//   async (token0, token1, pair, number) => {
//     // console.log("Avax");
//     await processTokenInfo(token0, token1, 43114);
//   }
// );

// const uniswapV3FactoryEthereumInstance = new ethers.Contract(
//   uniswapV3FactoryAddressEthereum,
//   uniswapV3FactoryAbi,
//   provider(networkConfig.rpcUrls["1"])
// );

// uniswapV3FactoryEthereumInstance.on(
//   "PoolCreated",
//   async (token0, token1, fee, tickSpacing, pool) => {
//     // console.log('V3 Eth');
//     await processTokenInfo(token0, token1, 1);
//   }
// );

// const uniswapV3FactoryPolygonInstance = new ethers.Contract(
//   uniswapV3FactoryAddressPolygon,
//   uniswapV3FactoryAbi,
//   provider(networkConfig.rpcUrls["137"])
// );

// uniswapV3FactoryPolygonInstance.on(
//   "PoolCreated",
//   async (token0, token1, fee, tickSpacing, pool) => {
//     // console.log('V3 Polygon');
//     await processTokenInfo(token0, token1, 137);
//   }
// );

// const uniswapV3FactoryBNBInstance = new ethers.Contract(
//   uniswapV3FactoryAddressBNB,
//   uniswapV3FactoryAbi,
//   provider(networkConfig.rpcUrls["56"])
// );

// uniswapV3FactoryBNBInstance.on(
//   "PoolCreated",
//   async (token0, token1, fee, tickSpacing, pool) => {
//     // console.log("V3 BNB");
//     await processTokenInfo(token0, token1, 56);
//   }
// );

// const uniswapV3FactoryBaseInstance = new ethers.Contract(
//   uniswapV3FactoryAddressBase,
//   uniswapV3FactoryAbi,
//   provider(networkConfig.rpcUrls["8453"])
// );

// uniswapV3FactoryBaseInstance.on(
//   "PoolCreated",
//   async (token0, token1, fee, tickSpacing, pool) => {
//     // console.log("V3 Base");
//     await processTokenInfo(token0, token1, 8453);
//   }
// );

// const uniswapV3FactoryAvaxInstance = new ethers.Contract(
//   uniswapV3FactoryAddressAvax,
//   uniswapV3FactoryAbi,
//   provider(networkConfig.rpcUrls["43114"])
// );

// uniswapV3FactoryAvaxInstance.on(
//   "PoolCreated",
//   async (token0, token1, fee, tickSpacing, pool) => {
//     // console.log('V3 avax');
//     await processTokenInfo(token0, token1, 43114);
//   }
// );

