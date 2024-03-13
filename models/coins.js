const { DataTypes } = require('sequelize');
const { connectToDatabase } = require('../database/db');

async function initializeUserModel() {
  const sequelize = await connectToDatabase();

  const CoinMarket = sequelize.define('coinMarket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
    symbol: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
    num_market_pairs: {
      type: DataTypes.STRING,
    },
    cmc_rank: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.STRING,
    },
    circulating_supply: {
      type: DataTypes.STRING,
    },
    total_supply: {
      type: DataTypes.STRING,
    },
    last_updated: {
      type: DataTypes.STRING,
    },
    volume_24h: {
      type: DataTypes.STRING,
    },
    volume_change_24h: {
      type: DataTypes.STRING,
    },
    percent_change_1h: {
      type: DataTypes.STRING,
    },
    percent_change_24h: {
      type: DataTypes.STRING,
    },
    percent_change_7d: {
      type: DataTypes.STRING,
    },
    percent_change_30d: {
      type: DataTypes.STRING,
    },
    percent_change_60d: {
      type: DataTypes.STRING,
    },
    percent_change_90d: {
      type: DataTypes.STRING,
    },
    market_cap: {
      type: DataTypes.STRING,
    },
  });
  await sequelize.sync({ alter: true });

  return CoinMarket;
}

module.exports = initializeUserModel;
