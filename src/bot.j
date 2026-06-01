const { getCandles } = require('./market');

const { getIndicators } = require('./indicators');

const { getScore, getSignal } = require('./strategy');

const { canTrade } = require('./risk');

const { hasPosition, openPosition } = require('./position');

const { saveLog } = require('./logger');

const config = require('./config');

let lastTradeTime = 0;

async function run() {

    try {

        const candles = await getCandles(config.symbol);

        const closes = candles.map(c =>
            parseFloat(c[4])
        );

        const ind = getIndicators(closes);

        const score = getScore(
            ind.rsi,
            ind.ema9,
            ind.ema21
        );

        const signal = getSignal(
            score,
            ind.rsi,
            ind.ema9,
            ind.ema21
        );

        console.log('---------------------');

        console.log(
            'PRICE:',
            closes[closes.length - 1]
        );

        console.log(
            'RSI:',
            ind.rsi.toFixed(2)
        );

        console.log(
            'EMA9:',
            ind.ema9.toFixed(2)
        );

        console.log(
            'EMA21:',
            ind.ema21.toFixed(2)
        );

        console.log(
            'SCORE:',
            score
        );

        console.log(
            'SIGNAL:',
            signal
        );

        // 🚫 Risk management
        if (!canTrade(score, config)) {

            console.log(
                '🚫 TRADE BLOCKED'
            );

            return;

        }

        // ⏳ Cooldown protection
        const now = Date.now();

        if (
            now - lastTradeTime <
            config.cooldown
        ) {

            console.log(
                '⏳ COOLDOWN ACTIVE'
            );

            return;

        }

        // 🚫 Prevent double position
        if (hasPosition()) {

            console.log(
                '⚠️ POSITION ALREADY OPEN'
            );

            return;

        }

        // 🚀 BUY
        if (signal === 'BUY') {

            console.log(
                '🚀 EXECUTE BUY'
            );

            openPosition(
                'BUY',
                closes[closes.length - 1]
            );

            lastTradeTime = now;

            saveLog({

                price:
                    closes[closes.length - 1],

                signal: 'BUY',

                score: score

            });

        }

        // 📉 SELL
        if (signal === 'SELL') {

            console.log(
                '📉 EXECUTE SELL'
            );

            openPosition(
                'SELL',
                closes[closes.length - 1]
            );

            lastTradeTime = now;

            saveLog({

                price:
                    closes[closes.length - 1],

                signal: 'SELL',

                score: score

            });

        }

    } catch (error) {

        console.log(
            '❌ ERROR:',
            error.message
        );

    }

}

setInterval(
    run,
    config.interval
);

run();
