const CoinMarket = require('../models/coins');
const Category = require('../models/category');
const createCryptoCoins = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(
      `${apiUrl}/v1/cryptocurrency/listings/latest`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      }
    );
    const coinData = await response.json();
    const coindataArray = coinData.data || [];
    const allCoins = await Coin.findAll();
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
      msg: "Data saved successfully",
      allCoins,
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

const addCoinCategories = async (req, res) => {
  try {
    const Categories = await Category();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;

    // Fetch the list of all categories
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/categories`, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
    });

    const categoriesResponse = await response.json();
    const categoriesData = categoriesResponse?.data;

    if (!categoriesData || categoriesData.length === 0) {
      throw new Error("No categories found in API response");
    }

    const categoriesPromises = categoriesData.map(async (category) => {
      const detailResponse = await fetch(
        `${apiUrl}/v1/cryptocurrency/category?id=${category.id}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
          },
        }
      );
      const detailData = await detailResponse.json();

      const coins = detailData?.data?.coins ? detailData.data.coins.map(coin => coin.id) : [0];

      const existingCategory = await Categories.findOne({
        where: { categoryId: category.id },
      });

      if (existingCategory) {
        // Update coinsId if it was initially 0 and now has new coin IDs
        if (existingCategory.coinsId.length === 1 && existingCategory.coinsId[0] === 0 && coins.length > 1) {
          return existingCategory.update({ coinsId: coins });
        }
      } else {
        // Create a new category object if it doesn't exist
        const categoryObject = {
          categoryId: category.id,
          name: category.name,
          coinsId: coins,
          title: category.title,
          num_tokens: category.num_tokens,
          avg_price_change: category.avg_price_change,
          market_cap: category.market_cap,
          market_cap_change: category.market_cap_change,
          volume: category.volume,
          volume_change: category.volume_change,
          last_updated: category.last_updated,
        };
        return Categories.create(categoryObject);
      }
    });

    await Promise.all(categoriesPromises);

    const allCategory = await Categories.findAll();
    res.status(200).json({
      status: true,
      msg: "Categories Updated Successfully",
      data: allCategory,
    });
  } catch (error) {
    console.error("Error retrieving coin data:", error);
    res.status(500).json({ message: "Error retrieving coin data" });
  }
};



const getCategories = async (req, res) => {
  try {
    const categoryModel = await Category();
    const allCategory = await categoryModel.findAll();
    if (!allCategory || allCategory.length == 0) {
      return res.status(404).json({
        status: false,
        msg: "No data found",
      });
    }
    res.status(200).json({
      status: true,
      msg: "Data retrieved successfully",
      data: allCategory,
    });
  } catch (error) {
    console.error("Error retrieving coin data:", error);
    res.status(500).json({ message: "Error retrieving coin data" });
  }
};

module.exports = {
  createCryptoCoins,
  getCoinData,
  addCoinCategories,
  getCategories,
};
