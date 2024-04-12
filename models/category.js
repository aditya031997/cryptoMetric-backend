const { DataTypes, STRING } = require("sequelize");
const { connectToDatabase } = require("../database/db");

async function initializeCategoryModel() {
  const sequelize = await connectToDatabase();
  const Category = sequelize.define("categories", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    coinsId: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue("coinsId");
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue("coinsId", JSON.stringify(value));
      },
    },
    title: {
      type: DataTypes.STRING,
    },
    num_tokens: {
      type: DataTypes.STRING,
    },
    avg_price_change: {
      type: DataTypes.STRING,
    },
    market_cap: {
      type: DataTypes.STRING,
    },
    market_cap_change: {
      type: DataTypes.STRING,
    },
    volume: {
      type: DataTypes.STRING,
    },
    last_updated: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  await sequelize.sync({ alter: true });

  return Category;
}

module.exports = initializeCategoryModel;
