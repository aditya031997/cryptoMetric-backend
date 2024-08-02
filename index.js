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

// const uniswapV2FactoryEthereumInstance = new ethers.Contract(
//   uniswapV2FactoryAddressEthereum,
//   uniswapV2FactoryAbi,
//   providerOfEthereum
// );

// uniswapV2FactoryEthereumInstance.on(
//   "PairCreated",
//   (token0, token1, pair, number) => {
//     // check tokens for db existence
//     console.log("token0", token0);
//     console.log("token1", token1);
//     // if not found, make db entry

//     const address = ""; // token
//     const name = "";
//     const symbol = "";
//     const decimal = "";
//     const chainId = "";
//     const logoURI = ""
//     console.log("uniswap V2 pair on ethereum", pair);
//     console.log("number", number);
//   }
// );

// const uniswapV2FactoryPolygonInstance = new ethers.Contract(
//   uniswapV2FactoryAddressPolygon,
//   uniswapV2FactoryAbi,
//   providerOfPolygon
// );

// uniswapV2FactoryPolygonInstance.on(
//   "PairCreated",
//   (token0, token1, pair, number) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V2 pair on polygon", pair);
//     console.log("number", number);
//   }
// );

// const uniswapV2FactoryBNBInstance = new ethers.Contract(
//   uniswapV2FactoryAddressBNB,
//   uniswapV2FactoryAbi,
//   providerOfBNB
// );

// uniswapV2FactoryBNBInstance.on(
//   "PairCreated",
//   (token0, token1, pair, number) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V2 pair on BNB", pair);
//     console.log("number", number);
//   }
// );

// const uniswapV2FactoryBaseInstance = new ethers.Contract(
//   uniswapV2FactoryAddressBase,
//   uniswapV2FactoryAbi,
//   providerOfBase
// );

// uniswapV2FactoryBaseInstance.on(
//   "PairCreated",
//   (token0, token1, pair, number) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V2 pair on Base", pair);
//     console.log("number", number);
//   }
// );

// const uniswapV2FactoryAvaxInstance = new ethers.Contract(
//   uniswapV2FactoryAddressAvax,
//   uniswapV2FactoryAbi,
//   providerOfAvax
// );

// uniswapV2FactoryAvaxInstance.on(
//   "PairCreated",
//   (token0, token1, pair, number) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V2 pair on Avax", pair);
//     console.log("number", number);
//   }
// );

// const uniswapV3FactoryEthereumInstance = new ethers.Contract(
//   uniswapV3FactoryAddressEthereum,
//   uniswapV3FactoryAbi,
//   providerOfEthereum
// );

// uniswapV3FactoryEthereumInstance.on(
//   "PoolCreated",
//   (token0, token1, fee, tickSpacing, pool) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V3 pool on Ethereum", pool);
//   }
// );

// const uniswapV3FactoryPolygonInstance = new ethers.Contract(
//   uniswapV3FactoryAddressPolygon,
//   uniswapV3FactoryAbi,
//   providerOfPolygon
// );

// uniswapV3FactoryPolygonInstance.on(
//   "PoolCreated",
//   (token0, token1, fee, tickSpacing, pool) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V3 pool on polygon", pool);
//   }
// );

// const uniswapV3FactoryBNBInstance = new ethers.Contract(
//   uniswapV3FactoryAddressBNB,
//   uniswapV3FactoryAbi,
//   providerOfBNB
// );

// uniswapV3FactoryBNBInstance.on(
//   "PoolCreated",
//   (token0, token1, fee, tickSpacing, pool) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V3 pool on BNB", pool);
//   }
// );

// const uniswapV3FactoryBaseInstance = new ethers.Contract(
//   uniswapV3FactoryAddressBase,
//   uniswapV3FactoryAbi,
//   providerOfBase
// );

// uniswapV3FactoryBaseInstance.on(
//   "PoolCreated",
//   (token0, token1, fee, tickSpacing, pool) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V3 pool on Base", pool);
//   }
// );

// const uniswapV3FactoryAvaxInstance = new ethers.Contract(
//   uniswapV3FactoryAddressAvax,
//   uniswapV3FactoryAbi,
//   providerOfAvax
// );

// uniswapV3FactoryAvaxInstance.on(
//   "PoolCreated",
//   (token0, token1, fee, tickSpacing, pool) => {
//     console.log("token0", token0);
//     console.log("token1", token1);
//     console.log("uniswap V3 pool on Avax", pool);
//   }
// );

