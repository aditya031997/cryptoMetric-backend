const { DataTypes } = require('sequelize');
const { connectToDatabase } = require('../database/db');

async function initializeUserModel() {
  const sequelize = await connectToDatabase();
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      // unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    socketId: {
      type: DataTypes.STRING,
    },
    provider: {
      type: DataTypes.STRING,
    },
    provider_id: {
      type: DataTypes.STRING,
    },
    is_new_coin_alert_enabled: {
      type: DataTypes.STRING,
    },
    is_increase_alert_enabled: {
      type: DataTypes.STRING,
    },
    is_decrease_alert_enabled: {
      type: DataTypes.STRING,
    },
    email_alert_status: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: true,
  });

  await sequelize.sync({ alter: true });
  return User;
}

module.exports = initializeUserModel;