
const { DataTypes } = require('sequelize');
const {connectToDatabase} = require('../database/db');

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
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  });

  return User;
}

module.exports = initializeUserModel;