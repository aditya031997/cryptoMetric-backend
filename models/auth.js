// const { DataTypes } = require('sequelize');
// const sequelize = require('../database/db');

// const User=sequelize.define('users',{
//     id:{
//         type:DataTypes.INTEGER,
//         primarykey:true,
//         autoIncrement:true
//     },
//     name:{
//         type:DataTypes.STRING
//     },
//     email:{
//      type:DataTypes.STRING,
//      unique:true

//     },password: {
//         type: DataTypes.STRING,
//       },
//       remember_token: {
//         type: DataTypes.STRING,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//       provider: {
//         type: DataTypes.STRING,
//       },
//       provider_id: {
//         type: DataTypes.STRING,
//       },
//       is_old: {
//         type: DataTypes.BOOLEAN,
//       },
//       is_new_coin_alert_enabled: {
//         type: DataTypes.BOOLEAN,
//       },
//       is_increase_alert_enabled: {
//         type: DataTypes.BOOLEAN,
//       },
//       is_decrease_alert_enabled: {
//         type: DataTypes.BOOLEAN,
//       },
//       email_alert_status: {
//         type: DataTypes.BOOLEAN,
//       },
//       email_news_notification_level: {
//         type: DataTypes.INTEGER,
//       },
//       chart_theme: {
//         type: DataTypes.INTEGER,
//       },
// })

// module.exports=User

// models/userModel.js
// models/userModel.js
// models/userModel.js
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
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    socketId: {
      type: DataTypes.STRING,
    },
    // ... other fields
  });

  return User;
}

module.exports = initializeUserModel;
