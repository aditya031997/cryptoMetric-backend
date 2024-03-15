const CoinMarket = require("../models/coins");
const Category = require("../models/category");

const createCryptoCoins = async (req, res) => {
  try {
    const Coin = await CoinMarket();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const limitArray = ["500" ]
    const response = await fetch(
      `${apiUrl}/v1/cryptocurrency/listings/latest`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response?.status}`);
    }
    const coinData = await response.json();
    const coindataArray = coinData.data || [];
    const allcoinIds = coindataArray.map((entry) => entry.id);
    const allcoinData = await Coin.findAll();
    const coindatabaseIds = allcoinData.map((entry) => entry.id);

    const missingImageIds = allcoinIds.filter((id) => !coindatabaseIds.includes(id));
    const existingCoinIds = allcoinIds.filter((id) => coindatabaseIds.includes(id));

    if (missingImageIds.length > 0) {
      const missingImageCoins = coindataArray.filter((coin) => missingImageIds.includes(coin.id) && !coin.logo);

      for (const coin of missingImageCoins) {
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
    if (existingCoinIds.length > 0) {
      const params = new URLSearchParams({ id: existingCoinIds.join(",") });
      const responseforLogo = await fetch(
        `${apiUrl}/v2/cryptocurrency/info?${params}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
          },
        }
      );
      const coinInfoData = await responseforLogo.json();

      for (const id of existingCoinIds) {
        const coin = coindataArray.find((entry) => entry.id === id);
        const coinInfo = coinInfoData.data[id];

        if (coin && coinInfo) {
          const coinObject = {
            id: coin.id,
            name: coin.name,
            slug: coin.slug,
            symbol: coin.symbol,
            image: coinInfo.logo || null, 
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
      data: coindataArray,
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
    const Categories = await Category();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/categories`, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
    });
    const dataForcoin = await response.json();
    console.log(dataForcoin.data.length,"<<<<<<<<<<");
    var data = dataForcoin.data;
    let createCategories
    data.forEach(async(dataForcoinId) => {
      const response = await fetch(
        `${apiUrl}/v1/cryptocurrency/category?id=${dataForcoinId.id}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
          },
        }
      );
      const coinsData = await response.json();
      const categoriesObject = {
        categoryId: dataForcoinId.id,
        name: dataForcoinId.name,
        coinsId:coinsData?.data?.coins ? coinsData?.data?.coins?.map(coin => coin.id) : [],
        title: dataForcoinId.title,
        num_tokens: dataForcoinId.num_tokens,
        avg_price_change: dataForcoinId.avg_price_change,
        market_cap: dataForcoinId.market_cap,
        market_cap_change: dataForcoinId.market_cap_change,
        volume: dataForcoinId.volume,
        volume_change: dataForcoinId.volume_change,
        last_updated: dataForcoinId.last_updated,
      };
      // console.log("182",categoriesObject);
      // const existingCoin = await Categories.findOne({
      //   where: { symbol: coin.symbol },
      // });

      // if (existingCoin) {
      //   await existingCoin.update(coinObject);
      // } else {
      //   await Categories.create(coinObject);
      // }
       createCategories=   Categories.create(categoriesObject);
     
    });
    res.status(200).json({
      status: true,
      msg: "All categroies ",
      data: createCategories,
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
        },
      }
    );
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

const getGategory = async (req, res) => {
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
}








module.exports = {
  createCryptoCoins,
  getCoinData,
  getCoinCategories,
  getbyCategoryId,
  getGategory
};
