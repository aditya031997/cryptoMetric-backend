
const Data = async (req,res) => {
    try {
      const apiKey = process.env.COIN_APIKEY; 
      const apiUrl = process.env.API_URL;
      const params = new URLSearchParams({
        id: '1,2,1027', 
      });
      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'X-CMC_PRO_API_KEY':process.env.COIN_APIKEY,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  const coindata = await response.json();
  res.status(200).json({status:true,msg:coindata})
      console.log(coindata);
    } catch (error) {
      console.error('Error fetching cryptocurrency info:', error.message);
    }
  };
const Listing = async(req,res) => {
    try {
      const apiKey = ''; // Replace with your actual CoinMarketCap API key
      const apiUrl = '';
      
      // Example: Provide the 'id' parameter
      const params = new URLSearchParams({
        id: '1,1027', 
      });
  
      const response = await fetch(`${apiUrl}`, {
        headers: {
          'X-CMC_PRO_API_KEY': '',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  const coindata = await response.json();
 console.log(coindata);
 res.status(200).json({
    status:true,
    msg:coindata
 })} catch (error) {
      console.error('Error fetching cryptocurrency info:', error.message);
}};
  

  module.exports={
    Data,
    Listing
}
  