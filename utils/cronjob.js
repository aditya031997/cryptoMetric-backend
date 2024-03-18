const cron = require('cron');
const axios = require('axios');

let socketData = null;

const fetchMarketData = async () => {
  try {
    await axios.get(`${process.env.SERVER_PORT}/api/coins/addMarketData`);
  } catch (error) {
    console.error('Error adding market data:', error.message);
    throw error;
  }
};

const fetchCryptoCurrencyInfo = async () => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_PORT}/api/coins/cryptoCurrencyInfo`,
    );
    socketData = response.data;
  } catch (error) {
    console.error('Error fetching crypto currency info:', error.message);
    throw error;
  }
};

const fetchData = async () => {
  try {
    await fetchMarketData();
    await fetchCryptoCurrencyInfo();
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};
const startCronJob = (io) => {
  try {
    //the expression should be '0 0 * * *'. This expression runs at midnight every day.
    const job = new cron.CronJob('0 0 * * *', async () => {
      await fetchData();
      if (io) {
        io.emit('UpdatedTableListing', socketData);
      }
    });
    job.start();
    console.log('Cronjob started:', new Date());
  } catch (error) {
    console.error('Cronjob error:', error.message);
  }
};

module.exports = { startCronJob, socketData };
