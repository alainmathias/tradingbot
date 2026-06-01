const axios = require('axios');

async function getCandles() {

    const res = await axios.get(

        'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100'

    );

    return res.data;

}

module.exports = {

    getCandles

};