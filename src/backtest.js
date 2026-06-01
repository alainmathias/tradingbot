let returns = [];
let equityCurve = [];
const fs =
    require('fs');

const {
    getIndicators
} = require('./indicators');

const {
    getScore,
    getSignal
} = require('./strategy');

let balance = 1000;

let wins = 0;

let losses = 0;

let position = null;

// 📊 READ CSV
const raw =
    fs.readFileSync(
        'data/btc.csv',
        'utf8'
    );

const lines =
    raw.trim().split('\n');

// 🚀 remove header
lines.shift();

const candles =
    lines.map(line => {

        const cols =
            line.split(',');

        return {

            close:
                parseFloat(cols[4]),

            volume:
                parseFloat(cols[5])

        };

    });

// 🚀 BACKTEST
for (
    let i = 50;
    i < candles.length;
    i++
) {

    const slice =
        candles.slice(0, i);

    const closes =
        slice.map(
            c => c.close
        );

    const ind =
        getIndicators(
            closes
        );

    const score =
        getScore(
            ind,
            'RANGE',
            'NONE'
        );

    const signal =
        getSignal(
            score,
            ind.rsi,
            ind.ema9,
            ind.ema21,
            'RANGE',
            closes
        );

    const price =
        closes[
            closes.length - 1
        ];

    // 🟢 BUY
    if (
        !position &&
        signal === 'BUY'
    ) {

        position = {

            entry: price

        };

    }

    // 🔴 SELL
    if (
        position &&
        signal === 'SELL'
    ) {

        const pnl =
            price -
            position.entry;

        balance += pnl;
        returns.push(pnl);
        equityCurve.push(balance);

        if (pnl > 0) {

            wins++;

        }

        else {

            losses++;

        }

        position = null;

    }

}

// 📊 RESULTS
const totalTrades =
    wins + losses;

const winRate =
    totalTrades > 0

    ? (
        wins /
        totalTrades
    ) * 100

    : 0;

console.log(
    '----------------'
);

console.log(
    '💰 FINAL BALANCE:',
    balance.toFixed(2)
);

console.log(
    '📊 TOTAL TRADES:',
    totalTrades
);

console.log(
    '🟢 WINS:',
    wins
);

console.log(
    '🔴 LOSSES:',
    losses
);

console.log(
    '🎯 WIN RATE:',
    winRate.toFixed(2) + '%'
);


console.log(
    '📈 EQUITY CURVE'
);

equityCurve.forEach((v, i) => {

    const bars =
        '█'.repeat(
            Math.max(
                1,
                Math.floor(
                    v / 20
                )
            )
        );

    console.log(
        i + 1,
        bars,
        v.toFixed(2)
    );

});

// 📊 average return
const avgReturn =

    returns.reduce(
        (a, b) => a + b,
        0
    ) / returns.length;

// 📉 standard deviation
const variance =

    returns.reduce(
        (sum, r) =>

            sum +
            Math.pow(
                r - avgReturn,
                2
            ),

        0

    ) / returns.length;

const stdDev =
    Math.sqrt(variance);

// 🚀 sharpe ratio
const sharpe =

    stdDev !== 0

    ? avgReturn / stdDev

    : 0;

console.log(
    '📈 SHARPE RATIO:',
    sharpe.toFixed(2)
);