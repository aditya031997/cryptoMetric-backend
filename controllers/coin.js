const fetch = require('node-fetch');

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
      throw new Error(`HTTP error! Status: ${response?.status}`);
    }

    const coinData = await response.json();
    const cryptocurrencies = Object.values(coinData.data);

    // Send the response back to the client
    res.status(200).json({
      status: true,
      msg: 'Data Get Successful',
      data: cryptocurrencies,
    });
  } catch (error) {
    console.error('Error fetching cryptocurrency info:', error.message);
    // Send error response back to the client
    res.status(500).json({
      status: false,
      msg: 'Internal Server Error',
      error: error.message,
    });
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
};
