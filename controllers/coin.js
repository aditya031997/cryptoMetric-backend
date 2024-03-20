const CoinMarket = require("../models/coins");
const Category = require("../models/category");
const createCryptoCoins = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(
      `${apiUrl}/v1/cryptocurrency/listings/latest`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      },
    );
    // if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response?.status}`);
    // }
    const coinData = await response.json();
    const coindataArray = coinData.data || [];
    const allCoins=await  Coin.findAll()
    for (const coin of coindataArray) {
      const coinObject = {
        id: coin?.id,
        name: coin?.name,
        slug: coin?.slug,
        symbol: coin?.symbol,
        price: coin?.quote.USD.price,
        num_market_pairs: coin?.num_market_pairs,
        cmc_rank: coin?.cmc_rank,
        circulating_supply: coin?.circulating_supply,
        total_supply: coin?.total_supply,
        last_updated: coin?.last_updated,
        volume_24h: coin?.quote.USD.volume_24h,
        volume_change_24h: coin?.quote.USD.volume_change_24h,
        percent_change_1h: coin?.quote.USD.percent_change_1h,
        percent_change_24h: coin?.quote.USD.percent_change_24h,
        percent_change_7d: coin?.quote.USD.percent_change_7d,
        percent_change_30d: coin?.quote.USD.percent_change_30d,
        percent_change_60d: coin?.quote.USD.percent_change_60d,
        percent_change_90d: coin?.quote.USD.percent_change_90d,
        market_cap: coin?.quote.USD.market_cap,
        market_cap_dominance: coin?.quote.USD.market_cap_dominance,
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
return res.status(200).json({
      status: true,
      msg: 'Data saved successfully',allCoins
  
    });
  } catch (error) {
    console.error('Error fetching cryptocurrency info:', error);
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
        msg: 'No data found',
      });
    }
    res.status(200).json({
      status: true,
      msg: 'Data retrieved successfully',
      data: allCoins,
    });
  } catch (error) {
    console.error('Error retrieving coin data:', error);
    res.status(500).json({ message: 'Error retrieving coin data' });
  }
};

const addCoinCategories = async (req, res) => {
  try {
    const Categories = await Category();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/categories`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    const coinsArray = await response.json();
    var coinsData = coinsArray?.data;
    coinsData?.forEach(async (coinId) => {
      const response = await fetch(
        `${apiUrl}/v1/cryptocurrency/category?id=${coinId.id}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
          },
        },
      );
      const coinsData = await response.json();
      const categoriesObject = {
        categoryId: coinId.id,
        name: coinId.name,
        coinsId: coinsData?.data?.coins
          ? coinsData?.data?.coins?.map((coin) => coin.id)
          : [],
        title: coinId.title,
        num_tokens: coinId.num_tokens,
        avg_price_change: coinId.avg_price_change,
        market_cap: coinId.market_cap,
        market_cap_change: coinId.market_cap_change,
        volume: coinId.volume,
        volume_change: coinId.volume_change,
        last_updated: coinId.last_updated,
      };

      const existingCategory = await Categories.findOne({
        where: { categoryId: categoriesObject.categoryId },
      });
      if (existingCategory) {
        await existingCategory.update(categoriesObject);
      } else {
        await Categories.create(categoriesObject);
      }
    });
    res.status(200).json({
      status: true,
      msg: "Categories Added Successfully ",
     
    });
  } catch (error) {
    console.error('Error retrieving coin data:', error);
    res.status(500).json({ message: 'Error retrieving coin data' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categoryModel = await Category();
    const allCategory = await categoryModel.findAll();
    if (!allCategory || allCategory.length == 0) {
      return res.status(404).json({
        status: false,
        msg: 'No data found',
      });
    }
    res.status(200).json({
      status: true,
      msg: 'Data retrieved successfully',
      data: allCategory,
    });
  } catch (error) {
    console.error('Error retrieving coin data:', error);
    res.status(500).json({ message: 'Error retrieving coin data' });
  }
};

module.exports = {
  createCryptoCoins,
  getCoinData,
  addCoinCategories,
  getCategories
  
};
