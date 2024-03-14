const express = require('express');
const cors = require('cors');
const auth = require('./routes/auth');
const dotenv = require('dotenv');
const coins = require('./routes/coin');
const { connectToDatabase } = require('./database/db');
const { Server } = require('socket.io');
const http = require('http');
const { startCronJob, socketData } = require('./utils/cronjob');
const axios = require('axios');

dotenv.config();
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());
app.use(cors());

app.use('/api', auth);
app.use('/api/coins', coins);

connectToDatabase();
startCronJob(io);

io.on('connection', async (socket) => {
  console.log('Socket Connected');

  if (socketData) {
    socket.emit('InitialTableListing', socketData);
  }
  axios
    .get(`${process.env.SERVER_PORT}/api/coins/cryptoCurrencyInfo`)
    .then((response) => {
      socket.emit('InitialTableListing', response.data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error.message);
    });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
