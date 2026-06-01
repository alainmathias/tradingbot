const axios = require('axios');

async function getBTCPrice() {

    const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    );

    console.log('BTC :', response.data.price);

}

getBTCPrice();
