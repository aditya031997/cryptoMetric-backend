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
          'X-CMC_PRO_API_KEY': apiKey,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response?.status}`);
    }
    const coinData = await response.json();
    const coinDataArray = coinData.data || [];
    const allCoinIds = coinDataArray.map((entry) => entry.id);
    const allCoinData = await Coin.findAll();
    const coinDataBaseIds = allCoinData.map((entry) => entry.id);

    const missingImageIds = allCoinIds.filter(
      (id) => !coinDataBaseIds.includes(id),
    );
    const existingCoinIds = allCoinIds.filter((id) =>
      coinDataBaseIds.includes(id),
    );

    if (missingImageIds.length > 0) {
      const missingImageCoins = coinDataArray.filter(
        (coin) => missingImageIds.includes(coin.id) && !coin.logo,
      );

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
      const params = new URLSearchParams({ id: existingCoinIds.join(',') });
      const logoResponse = await fetch(
        `${apiUrl}/v2/cryptocurrency/info?${params}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
          },
        },
      );
      const coinInfoData = await logoResponse.json();

      for (const id of existingCoinIds) {
        const coin = coinDataArray.find((entry) => entry.id === id);
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
      msg: 'Data saved successfully',
      data: coinDataArray,
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

const getCoinCategories = async (req, res) => {
  try {
    const Categories = await Category();
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/v1/cryptocurrency/categories`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    const dataForCoin = await response.json();
    var data = dataForCoin.data;
    let createCategories;
    data.forEach(async (dataForCoinId) => {
      const response = await fetch(
        `${apiUrl}/v1/cryptocurrency/category?id=${dataForCoinId.id}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
          },
        },
      );
      const coinsData = await response.json();
      const categoriesObject = {
        categoryId: dataForCoinId.id,
        name: dataForCoinId.name,
        coinsId: coinsData?.data?.coins
          ? coinsData?.data?.coins?.map((coin) => coin.id)
          : [],
        title: dataForCoinId.title,
        num_tokens: dataForCoinId.num_tokens,
        avg_price_change: dataForCoinId.avg_price_change,
        market_cap: dataForCoinId.market_cap,
        market_cap_change: dataForCoinId.market_cap_change,
        volume: dataForCoinId.volume,
        volume_change: dataForCoinId.volume_change,
        last_updated: dataForCoinId.last_updated,
      };
      createCategories = Categories.create(categoriesObject);
    });
    res.status(200).json({
      status: true,
      msg: 'All categories',
      data: createCategories,
    });
  } catch (error) {
    console.error('Error retrieving coin data:', error);
    res.status(500).json({ message: 'Error retrieving coin data' });
  }
};

const getByCategoryId = async (req, res) => {
  try {
    const id = req.params.id;
    const apiKey = process.env.COIN_API_KEY;
    const apiUrl = process.env.API_URL;
    const response = await fetch(
      `${apiUrl}/v1/cryptocurrency/category?id=${id}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      },
    );
    const dataForId = await response.json();
    res.status(200).json({
      status: true,
      msg: 'All categories ',
      data: dataForId,
    });
  } catch (error) {
    console.error('Error retrieving coin data:', error);
    res.status(500).json({ message: 'Error retrieving coin data' });
  }
};

const getCategory = async (req, res) => {
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
  getCoinCategories,
  getByCategoryId,
  getCategory,
};
