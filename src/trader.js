const Binance = require('binance-api-node').default;

const config = require('./config');

const client = Binance({

    apiKey: config.apiKey,

    apiSecret: config.apiSecret,

    futures: true,

    httpFutures: 'https://testnet.binancefuture.com'

});

async function buyBTC() {

    try {

        const order = await client.futuresOrder({

            symbol: 'BTCUSDT',

            side: 'BUY',

            type: 'MARKET',

            quantity: 0.001,

recvWindow: 60000
        });

        console.log('✅ BUY ORDER SUCCESS');

        console.log(order);

    } catch (error) {

        console.log('❌ ORDER ERROR');

        console.log(error.message);

    }

}

buyBTC();
