const cron = require("cron");
const axios = require("axios");

let socketData = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const addCategories = async () => {
  try {
    await axios.post(`${process.env.SERVER_PORT}/api/coins/addCoinsCategories`);
    console.log("Categories added successfully");
  } catch (error) {
    console.log("Error adding categories:", error.message);
  }
};

const fetchMarketData = async () => {
  try {
    await axios.post(`${process.env.SERVER_PORT}/api/coins/addMarketData`);
    console.log("Market data added successfully");
  } catch (error) {
    console.error("Error adding market data:", error.message);
  }
};

const fetchCryptoCurrencyInfo = async () => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_PORT}/api/coins/cryptoCurrencyInfo`
    );
    socketData = response.data;
    console.log("Crypto currency info fetched successfully");
  } catch (error) {
    console.error("Error fetching crypto currency info:", error.message);
  }
};

const fetchData = async () => {
  try {
    // Wait for 1 second after it completes

    await fetchMarketData();
    await delay(7000);

    await fetchCryptoCurrencyInfo();
    await delay(7000);

    await addCategories();
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

const startCronJob = (io) => {
  try {
    const job = new cron.CronJob("*/10 * * * *", async () => {
      await fetchData();
      if (io) {
        io.emit("UpdatedTableListing", socketData);
      }
    });
    job.start();
    console.log("Cronjob started:", new Date());
  } catch (error) {
    console.error("Cronjob error:", error.message);
  }
};

module.exports = { startCronJob, socketData };
