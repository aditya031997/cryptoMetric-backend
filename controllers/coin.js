const CoinMarket = require("../models/coins");
const createCryptoCoins = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/listings/latest`, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response?.status}`);
    }
     const coinData = await response.json();
    const dataArray = coinData.data || [];
    const allIds = dataArray.map((entry) => entry.id);
    const allData = await Coin.findAll();
    const databaseIds = allData.map((entry) => entry.id);
    const newIds = allIds.filter(id => !databaseIds.includes(id));
    const missingImageIds = [];
    if(newIds.length > 0){
  newIds.forEach(newId => {
  missingImageIds.push(newId );
    });
  }
  for (const coin of allData) {
      if (!coin.image) {
        missingImageIds.push(coin.id);
      }
    }
    if (missingImageIds.length > 0 ) {
    const params = new URLSearchParams({ id: missingImageIds.join(",") });
      const responseforLogo = await fetch(`${apiUrl}/v2/cryptocurrency/info?${params}`, {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      });
      const coinifoData = await responseforLogo.json();
      try {
        for (const coin of dataArray) {
          const coinInfo = coinifoData.data[coin.id];
          if (coinInfo) {
            const coinObject = {
              id: coin.id,
              name: coin.name,
              slug: coin.slug,
              symbol: coin.symbol,
              image: coinInfo.logo,
              price: coin.quote.USD.price,
              num_market_pairs: coin.num_market_pairs,
              cmc_rank: coin.cmc_rank,
              circulating_supply: coin.circulating_supply,
              total_supply: coin.total_supply,
              last_updated: coin.last_updated,
              volume_24h: coin.quote.USD.volume_24h,
              volume_change_24h: coin.quote.USD.volume_change_24h,
              percent_change_1h: coin.quote.USD.percent_change_1h,
              percent_change_24h: coin.quote.USD.percent_change_24h,
              percent_change_7d: coin.quote.USD.percent_change_7d,
              percent_change_30d: coin.quote.USD.percent_change_30d,
              percent_change_60d: coin.quote.USD.percent_change_60d,
              percent_change_90d: coin.quote.USD.percent_change_90d,
              market_cap: coin.quote.USD.market_cap,
              market_cap_dominance: coin.quote.USD.market_cap_dominanc,
            };
            const existingCoin = await Coin.findOne({
              where: { symbol: coin.symbol },
            });
            if (existingCoin) {
              await existingCoin.update(coinObject);
            } else {
              await Coin.create(coinObject);
            }
          }
        }
      } catch (error) {
        console.error("Error saving or updating coin:", error);
      }
    }else{
      for (const coin of dataArray) {
        const coinInfo = coinData[coin.id];
        
        if (coinInfo) {
          const coinObject = {
            id: coin.id,
            name: coin.name,
            slug: coin.slug,
            symbol: coin.symbol,
           
            price: coin.quote.USD.price,
            num_market_pairs: coin.num_market_pairs,
            cmc_rank: coin.cmc_rank,
            circulating_supply: coin.circulating_supply,
            total_supply: coin.total_supply,
            last_updated: coin.last_updated,
            volume_24h: coin.quote.USD.volume_24h,
            volume_change_24h: coin.quote.USD.volume_change_24h,
            percent_change_1h: coin.quote.USD.percent_change_1h,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            percent_change_30d: coin.quote.USD.percent_change_30d,
            percent_change_60d: coin.quote.USD.percent_change_60d,
            percent_change_90d: coin.quote.USD.percent_change_90d,
            market_cap: coin.quote.USD.market_cap,
            market_cap_dominance: coin.quote.USD.market_cap_dominanc,
          };
          const existingCoin = await Coin.findOne({
            where: { symbol: coin.symbol },
          });
          if (existingCoin) {
            await existingCoin.update(coinObject);
          } else {
            await Coin.create(coinObject);
          }
        }
      }
    }
    return res.status(200).json({
      status: true,
      msg: "Data saved successfully",
      data: dataArray,
    });
  } catch (error) {
    console.error("Error fetching cryptocurrency info:", error);
    res.status(500).json({ error: error.message });
  }
};


const getCoinData = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const allCoins = await Coin.findAll();
    if (!allCoins || allCoins.length == 0) {
      return res.status(404).json({
        status: false,
        msg: "No data found",
      });
    }
    res.status(200).json({
      status: true,
      msg: "Data retrieved successfully",
      data: allCoins,
    });
  } catch (error) {
    console.error("Error retrieving coin data:", error);
    res.status(500).json({ message: "Error retrieving coin data" });
  }
};
const getCoinCategories = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/categories`, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
    });
    const dataForId = await response.json();
    res.status(200).json({
      status: true,
      msg: "All categroies ",
      data: dataForId,
    });
  } catch (error) {
    console.error("Error retrieving coin data:", error);
    res.status(500).json({ message: "Error retrieving coin data" });
  }
};
const getbyCategoryId = async (req, res) => {
  try {
    const id = req.params.id;
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const params = new URLSearchParams({ id: id });
    const response = await fetch(
      `${apiUrl}/v1/cryptocurrency/category?id=${id}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },});
    const dataForId = await response.json();
    res.status(200).json({
      status: true,
      msg: "All categroies ",
      data: dataForId,
    });
  } catch (error) {
    console.error("Error retrieving coin data:", error);
    res.status(500).json({ message: "Error retrieving coin data" });
  }
};
module.exports = {
  createCryptoCoins,
  getCoinData,
  getCoinCategories,
  getbyCategoryId,
};
