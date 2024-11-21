const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  external_id: { type: Number, required: true },
  ate_slug: { type: String, maxlength: 100 },
  name: { type: String, maxlength: 100 },
  symbol: { type: String, maxlength: 20 },
  token_type: { type: String, maxlength: 255 },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  rank: { type: Number, required: true },
  has_icon: { type: Boolean, required: true },
  cryptocompare_id: { type: Number, required: true },
  cmc_id: { type: Number, maxlength: 255 },
  description: { type: String, maxlength: 65535 },
  features: { type: String, maxlength: 65535 },
  technology: { type: String, maxlength: 65535 },
  cryptowat_market_id: { type: Number, required: true },
  tradingview_trading_pair: { type: String, maxlength: 65535 },
  cec_coin_info: { type: String, maxlength: 65535 }
});

const CoinModel = mongoose.model('Coin', schema);