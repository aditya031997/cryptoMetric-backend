const cron = require('cron');
const axios = require('axios');

let socketData = null;

const fetchData = async () => {
  try {
    const response = await axios.get(
      `${process.env.apiUrl}api/coins/cryptoCurrencyInfo`,
    );
    socketData = response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};


const addCategories=async()=>{
  try {
    const response =await axios.post(`${process.env.SERVER_PORT}/api/coins/addcoinsCategories`)
    console.log("Categories added sucessfully",response)
  } catch (error) {
    console.log("error adding categories")
  }
}



const startCronJob = (io) => {
  try {
    const job = new cron.CronJob('0 0 */1 * *', async () => {
      await fetchData();
      if (io) {
        io.emit('UpdatedTableListing', socketData);
      }
      addCategories()
    });
    job.start();
    console.log('Cronjob started:', new Date());
  } catch (error) {
    console.error('Cronjob error:', error.message);
  }
};

module.exports = { startCronJob, socketData };
