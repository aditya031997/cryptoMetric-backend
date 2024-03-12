const WebSocket = require('ws');
const fetch = require('node-fetch');

let ws;

const initWebSocket = (server) => {
    ws = new WebSocket.Server({ server });

    ws.on('connection', (socket) => {
        console.log('Client connected');

        // Handle messages from the client
        socket.on('message', (message) => {
            console.log('Received message:', message);

            // Here you can handle different types of messages
            // For example, if you receive a message to start the interval
            if (message === 'start_interval') {
                // Start the interval to send updated coin data every 5 seconds
                startInterval(socket);
            } else if (message === 'stop_interval') {
                // Stop the interval when you receive the stop message
                stopInterval();
            }
        });
    });
};

const startInterval = (socket) => {
    const intervalId = setInterval(async () => {
        try {
            const apiKey = process.env.COIN_APIKEY;
            const apiUrl = process.env.API_URL;
            const params = new URLSearchParams({
                id: '1,2,1027',
            });

            const response = await fetch(`${apiUrl}?${params}`, {
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const coinData = await response.json();
            // Send relevant data to clients
            socket.send(JSON.stringify({ status: true, msg: coinData }));
            console.log('Sent updated coin data:', coinData);
        } catch (error) {
            console.error('Error fetching cryptocurrency info:', error.message);
        }
    }, 5000);

    // Save the intervalId for later use (to stop the interval if needed)
    socket.intervalId = intervalId;
};

const stopInterval = () => {
    // Stop the interval if it's running
    if (ws && ws.clients.size > 0) {
        const socket = ws.clients.values().next().value;
        if (socket && socket.intervalId) {
            clearInterval(socket.intervalId);
            console.log('Interval stopped');
        }
    }
};

const Data = async (req, res) => {
    try {
        const apiKey = process.env.COIN_APIKEY;
        const apiUrl = process.env.API_URL;
        const params = new URLSearchParams({
            id: '1,2,1027',
        });
        const response = await fetch(`${apiUrl}?${params}`, {
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const coindata = await response.json();
        // Emit relevant data to clients
        ws.send(JSON.stringify({ status: true, msg: coindata }));
        console.log('Sent updated coin data:', coindata);
        res.status(200).json({ status: true, msg: coindata });
    } catch (error) {
        console.error('Error fetching cryptocurrency info:', error.message);
    }
};

const Listing = async (req, res) => {
    try {
        const apiKey = ''; // Replace with your actual CoinMarketCap API key
        const apiUrl = '';

        // Example: Provide the 'id' parameter
        const params = new URLSearchParams({
            id: '1,1027',
        });

        const response = await fetch(`${apiUrl}`, {
            headers: {
                'X-CMC_PRO_API_KEY': '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const coindata = await response.json();
        console.log(coindata);
        res.status(200).json({
            status: true,
            msg: coindata,
        });
    } catch (error) {
        console.error('Error fetching cryptocurrency info:', error.message);
    }
};

module.exports = {
    Data,
    Listing,
    initWebSocket,
};
