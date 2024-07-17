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
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImZiNDhmOWZhLTkwM2EtNDI3OC1iNmNjLWUzNDg0YzU1ZDFiOSIsIm9yZ0lkIjoiMzk5ODg1IiwidXNlcklkIjoiNDEwODk4IiwidHlwZUlkIjoiNjgxNzljYWMtODNiYS00YmVlLTkwZjAtMDYxM2UyNDg5ZmZjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjA3ODEyNTAsImV4cCI6NDg3NjU0MTI1MH0.beWhT_U1x4Xpv481SeLFDXQTUTZfCCC-PQpKs_69ajU",
  });
}
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

startServer();
