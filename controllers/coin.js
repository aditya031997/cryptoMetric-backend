const CoinMarket=require('../models/coins')

// const Data = async ( req, res) => {
//     try {
//         const apiKey = process.env.COIN_APIKEY;
//         const apiUrl = process.env.API_URL;
//        // const idString = ids.join(',');

//         const params = new URLSearchParams({
//             id: "2"//idString,
//         })
//         const response = await fetch(`${apiUrl}?${params}`, {
//             headers: {
//                 'X-CMC_PRO_API_KEY': apiKey,
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const coindata = await response.json();
//         console.log('Sent updated coin data:', coindata);
//         res.status(200).json({ status: true, msg: coindata });

//         return coindata; 
//     } catch (error) {
//         console.error('Error fetching cryptocurrency info:', error.message);
//         return null;
//     }
// };


const create = async (req, res) => {
    try {
      const Coin = await CoinMarket();
      const apiKey = process.env.COIN_APIKEY;
      const apiUrl = process.env.API_URL;
      const apiInfoUrl =process.env.APIINFO_URL ;

  
      const response = await fetch(`${apiUrl}`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const coindata = await response.json();
      const dataArray = coindata.data || [];
      const allIds = dataArray.map((entry) => entry.id);
  
      const params = new URLSearchParams({id: allIds.join(',')});
      const response2 = await fetch(`${apiInfoUrl}?${params}`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      });
      const dataForId = await response2.json();

      try {   
        for (const coin of dataArray) {
          const coinInfo = dataForId.data[coin.id];
          if (coinInfo) {
            const coinObject = {
              id: coin.id,  
              name: coin.name, 
              slug: coin.slug,  
              symbol: coin.symbol,  
              image: coinInfo.logo,
              price:coin.quote.USD.price,
              num_market_pairs:coin.num_market_pairs, 
              cmc_rank:coin.cmc_rank,
              circulating_supply:coin.circulating_supply,
              total_supply:coin.total_supply,
              last_updated:coin.last_updated,
              volume_24h: coin.quote.USD.volume_24h,
              volume_change_24h:coin.quote.USD.volume_change_24h,
              percent_change_1h:coin.quote.USD.percent_change_1h,
              percent_change_24h: coin.quote.USD.percent_change_24h,
              percent_change_7d: coin.quote.USD.percent_change_7d,
              percent_change_30d: coin.quote.USD.percent_change_30d,
              percent_change_60d: coin.quote.USD.percent_change_60d,
              percent_change_90d: coin.quote.USD.percent_change_90d,
              market_cap: coin.quote.USD.market_cap,
              market_cap_dominance: coin.quote.USD.market_cap_dominanc

            };
            const existingCoin = await Coin.findOne({ where: { symbol: coin.symbol } });
           
            if(existingCoin){
          
              await existingCoin.update(coinObject)
            }else{

            await Coin.create(coinObject);
            }

          }
        }
    } catch (error) {
      console.error('Error saving or updating coin:', error);
    }
      return res.status(200).json({
        status: true,
        msg: {
          dataArray,
        },
      });
    } catch (error) {
      console.error('Error fetching cryptocurrency info:', error.message);
      res.status(500).json({ error: error.message });
    }
  };

const getCoinData=async(req,res)=>{
  try {
    const Coin = await CoinMarket();
    const allCoins = await Coin.findAll();

    res.status(200).json({
      status: true,
      msg: {
        coins: allCoins,
      },
    }); 
  } catch (error) {
    console.log(error)
    res.status(500).json({message:error})
  }
}

module.exports = {
    // Data,
    create,
    getCoinData
};
