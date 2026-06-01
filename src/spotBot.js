const {
    getIndicators
} = require('./indicators');

const {
    getScore,
    getSignal
} = require('./strategy');

const {
    getTrend,
    isAligned
} = require('./timeframe');

const {
    canTrade
} = require('./risk');

// 💰 SPOT PORTFOLIO
let portfolio = {
    balance: 1000,
    position: null
};

function runSpotBot(
    candles
) {

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

        // 📊 multi timeframe
        const tf1 =
            getTrend(
                ind.ema9,
                ind.ema21
            );

        const tf5 =
            getTrend(
                ind.ema9 * 1.001,
                ind.ema21
            );

        const tf15 =
            getTrend(
                ind.ema9 * 1.002,
                ind.ema21
            );

        const alignment =
            isAligned(
                tf1,
                tf5,
                tf15
            );

        const price =
            closes[
                closes.length - 1
            ];

        // 🟢 BUY
        if (
            !portfolio.position &&
            signal === 'BUY' &&
            alignment === 'BULL' &&
            canTrade(score, alignment, 0)
        ) {

            portfolio.position = {
                entry: price
            };

            console.log(
                '🟢 SPOT BUY:',
                price
            );

        }

        // 🔴 SELL
        if (
            portfolio.position &&
            signal === 'SELL'
        ) {

            const pnl =
                price -
                portfolio.position.entry;

            portfolio.balance += pnl;

            console.log(
                '🔴 SPOT SELL:',
                pnl
            );

            portfolio.position = null;

        }

        console.log(
            'PRICE:',
            price,
            'SCORE:',
            score,
            'ALIGN:',
            alignment
        );

    }

    console.log(
        '💰 FINAL BALANCE:',
        portfolio.balance
    );

}

module.exports =
    runSpotBot;
