const client = require('./src/binance');

async function testOrder() {

    try {

        console.log("📡 SENDING TEST ORDER");

      
const serverTime =
    await client.time();

console.log(
    "SERVER TIME:",
    serverTime
);

const order =
    await client.futuresOrder({



                symbol: 'BTCUSDT',

                side: 'BUY',

                type: 'MARKET',

                quantity: 0.001

            });

        console.log("✅ ORDER SUCCESS");

        console.log(order);

    } catch (err) {

        console.log("❌ ORDER ERROR");

        console.log(err);
    }

}

testOrder();

