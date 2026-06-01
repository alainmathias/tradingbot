const client = require('./src/binance');

async function test() {

    try {

        console.log("🔄 PING BINANCE");

        const time = await client.time();

        console.log("✅ BINANCE OK");

        console.log(time);

    } catch (err) {

        console.log("❌ ERROR");

        console.log(err);

    }

}

test();

