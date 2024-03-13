// database/db.js
const { Sequelize } = require('sequelize');

async function connectToDatabase() {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // sync: {
    //   force: true, // Use force:true to drop tables and recreate them (be cautious)
    // },
    define: {
      timestamps: false,
    },
  });

  try {
    await sequelize.authenticate();

    console.log('MySQL Connected!');
  } catch (error) {
    console.error('MySQL connection error:', error);
  }
  return sequelize;
}

module.exports = {
  connectToDatabase,
};
