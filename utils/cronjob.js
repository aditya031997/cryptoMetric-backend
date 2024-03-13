const cron = require("cron");
const axios=require("axios")
const {createCryptoCoins} = require('../controllers/coin');

const startCronJob = () => {
    // Set up the initial cron job direct

    try {
        const job = new cron.CronJob('2 * * * * 2', async () => {
        console.log("{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}")
try {
    const response = await axios.get('http://localhost:5000/api/coins/addMarketdata');
    console.log("API Response:", response.data);
} catch (error) {
    console.log(error)
}});
        job.start();
        console.log("Cornjob executing ",new Date())  
    } catch (error) {
        console.log("error",error)
    }
    
};

module.exports = startCronJob;

