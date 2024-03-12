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

app.use('/api/users', auth);
app.use('/api/coin', coins);

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle messages from the client
    ws.on('message', (message) => {
        console.log('Received message:', message);

        // Here you can handle different types of messages
        // For example, if you receive a message to start the interval
        if (message === 'start_interval') {
            // Start the interval to trigger the API call every 5 seconds
            intervalId = setInterval(() => {
                console.log('Calling API...');
                triggerAPI();
            }, 5000);
        } else if (message === 'stop_interval') {
            // Stop the interval when you receive the stop message
            clearInterval(intervalId);
            console.log('Interval stopped');
        }
    });
});

// Function to trigger the API call
async function triggerAPI() {
    try {
        // Make your API call here
        const response = await axios.get('your_api_endpoint');
        console.log('API Response:', response.data);
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

saveData();
connectToDatabase();
server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
