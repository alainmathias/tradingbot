const fs =
    require('fs');

const https =
    require('https');

// 📊 Binance API
const url =

'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=500';

https.get(url, res => {

    let data = '';

    res.on('data', chunk => {

        data += chunk;

    });

    res.on('end', () => {

        const candles =
            JSON.parse(data);

        let csv =

'timestamp,open,high,low,close,volume\n';

        candles.forEach(c => {

            csv +=

`${c[0]},${c[1]},${c[2]},${c[3]},${c[4]},${c[5]}\n`;

        });

        // 📁 ensure data folder
        if (
            !fs.existsSync('data')
        ) {

            fs.mkdirSync('data');

        }

        fs.writeFileSync(
            'data/btc.csv',
            csv
        );

        console.log(
            '✅ BTC DATA SAVED'
        );

    });

}).on('error', err => {

    console.log(
        '❌ ERROR:',
        err.message
    );

});
