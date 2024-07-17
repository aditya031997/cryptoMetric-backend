const { DataTypes } = require("sequelize");
const { connectToDatabase } = require("../database/db");

async function initializeTokenModel() {
  const sequelize = await connectToDatabase();

  const TokenModel = sequelize.define("token_list", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    decimals: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoURI: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  await sequelize.sync({ alter: true });

  return TokenModel;
}

module.exports = initializeTokenModel;