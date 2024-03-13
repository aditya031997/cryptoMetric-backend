const express = require('express');
const cors = require('cors');
const auth = require('./routes/auth');
const dotenv = require('dotenv');
const axios = require('axios');
const coins = require('./routes/coin');
const saveData = require('./utils/cronjob');
const { connectToDatabase } = require('./database/db');

const { createServer } = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');

dotenv.config();
const port = process.env.PORT;
const app = express();

const server = createServer(app);
const io = new Server(server);
const wss = new WebSocket.Server({ server });



app.use(express.json());
app.use(cors());

app.use('/api', auth);
app.use('/api', coins);


// Function to trigger the API call


saveData();
connectToDatabase();
server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
