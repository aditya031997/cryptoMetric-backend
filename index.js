const express = require('express');
const cors = require('cors');
const auth = require('./routes/auth');
const { updateUserSocketId } = require('./controllers/auth');
const dotenv = require('dotenv');
const axios = require('axios');
const coins = require('./routes/coin');
const { connectToDatabase } = require('./database/db');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  // transports: ['socket'],
});

app.use(express.json());
app.use(cors());

app.use('/api', auth);
app.use('/api/coins', coins);

connectToDatabase();

io.on('connection', async (socket) => {
  console.log('Socket Connected');
  // Handle saving and updating socket ID
  socket.on('saveSocketId', async (userId) => {
    // Call a function to save the socket ID in the database
    await updateUserSocketId(userId, socket.id);
  });

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
