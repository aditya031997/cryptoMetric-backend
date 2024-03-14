const cron = require('cron');
const axios = require('axios');

let socketData = null;

const fetchData = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/coins/cryptoCurrencyInfo',
    );
    socketData = response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};
const startCronJob = (io) => {
  try {
    const job = new cron.CronJob('* * * * *24', async () => {
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
