const fs = require('fs');

const runSpotBot =
    require('./spotBot');

const raw =
    fs.readFileSync(
        'data/btc.csv',
        'utf8'
    );

const lines =
    raw.trim().split('\n');

lines.shift();

const candles =
    lines.map(line => {

        const c =
            line.split(',');

        return {

            close:
                parseFloat(c[4])

        };

    });

runSpotBot(candles);
