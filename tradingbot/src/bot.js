const {

    getTrend,

    isAligned

} = require('./timeframe');


const {
    updateWeights
} = require('./ai');

const {
    getWeights
} = require('./ai');

const { getCandles } = require('./market');

const { getIndicators } = require('./indicators');
const {
    getAnalytics
} = require('./portfolio');

const {
    getScore,
    getSignal
} = require('./strategy');

const {
    canTrade
} = require('./risk');

const {
    getMarketRegime
} = require('./marketRegime');

const {
    detectBreakout
} = require('./breakout');

const portfolio =
    require('./portfolio');
    
    
   const {
    shouldPauseTrading,
    getDrawdown
} = require('./portfolio');
    

const {
    saveLog
} = require('./logger');

const config =
    require('./config');
    
    
    const {
    getPositionSize
} = require('./portfolio');



let lastTradeTime = 0;

async function run() {

    try {

        // 📊 GET MARKET DATA
        const candles =
            await getCandles(
                config.symbol
            );

        const closes =
            candles.map(c =>
                parseFloat(c[4])
            );

        const currentPrice =
            closes[closes.length - 1];

        // 📈 INDICATORS
        const ind =
            getIndicators(candles);




const tf1 =
    getTrend(
        ind.ema9,
        ind.ema21
    );

// 📊 simulation
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
    console.log(
    '📊 ALIGNMENT:',
    alignment
);
        // 📊 MARKET REGIME
        const regime =
            getMarketRegime(closes);

        // 🚀 BREAKOUT
        const breakout =
detectBreakout(
    closes,
    ind.volume,
    ind.avgVolume,
    ind.ema9,
    ind.ema21
);




console.log(
    '🧠 AI WEIGHTS:',
    getWeights()
);
const drawdown =
    getDrawdown();

console.log(
    '📉 DRAWDOWN:',
    drawdown.toFixed(2) + '%'
);


const stats =
    getAnalytics();

console.log(
    '📊 TOTAL TRADES:',
    stats.totalTrades
);

console.log(
    '🟢 WINS:',
    stats.wins
);

console.log(
    '🔴 LOSSES:',
    stats.losses
);

console.log(
    '🎯 WIN RATE:',
    stats.winRate.toFixed(2) + '%'
);

console.log(
    '💰 TOTAL PnL:',
    stats.totalPnL.toFixed(2)
);


// 🛑 pause trading
if (
    shouldPauseTrading()
) {

    console.log(
        '🛑 TRADING PAUSED'
    );

    return;

}



        // 🧠 SCORE
        const score =
            getScore(
                ind,
                closes,
                regime,
                breakout
            );

        // 📡 SIGNAL
        const signal =
            getSignal(
                score,
                ind.rsi,
                ind.ema9,
                ind.ema21,
                regime
            );

        console.log(
            '---------------------'
        );

        console.log(
            'PRICE:',
            currentPrice
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
            'MACD:',
            ind.macd.MACD.toFixed(2)
        );

        console.log(
            'ATR:',
            ind.atr.toFixed(2)
        );

        console.log(
            'REGIME:',
            regime
        );

        console.log(
            'BREAKOUT:',
            breakout
        );

        console.log(
            'SCORE:',
            score
        );

        console.log(
            'SIGNAL:',
            signal
        );

        // 🚫 RISK FILTER
        if (
            !canTrade(
                score,
                config
            )
        ) {

            console.log(
                '🚫 TRADE BLOCKED'
            );

            return;

        }

        // 📊 PNL MONITOR
        const pnl =
            portfolio.updatePnL(
                currentPrice
            );

        if (pnl) {

            console.log(
                '📊 PnL %:',
                pnl.pnlPercent.toFixed(2)
            );

            console.log(
                '💰 PnL $:',
                pnl.pnlAmount.toFixed(2)
            );

        }

        // 📈 CURRENT POSITION
        const position =
            portfolio.getPosition();

        if (position && pnl) {

            // 💰 TAKE PROFIT
            if (
                pnl.pnlPercent >=
                config.takeProfit
            ) {

                console.log(
                    '💰 TAKE PROFIT HIT'
                );
                
                
                  const pnl =
    portfolio.updatePnL(
        currentPrice
    );

updateWeights({

    pnl: pnl.pnlAmount,

    reason: 'MACD'

});

                portfolio.closeTrade(
                    currentPrice
                );
                
                
              



            }

            // 🛑 STOP LOSS
            if (
                pnl.pnlPercent <=
                -config.stopLoss
            ) {

                console.log(
                    '🛑 STOP LOSS HIT'
                );

                portfolio.closeTrade(
                    currentPrice
                );

            }

        }

        // ⏳ COOLDOWN
        const now =
            Date.now();

        if (
            now - lastTradeTime <
            config.cooldown
        ) {

            console.log(
                '⏳ COOLDOWN ACTIVE'
            );

            return;

        }

        // 🚫 PREVENT DOUBLE POSITION
       const existingPosition =
    portfolio.getPosition();

        // 🚀 BUY
        if (
    !existingPosition &&
    signal === 'BUY' &&
    alignment === 'BULL'
) {

            console.log(
                '🚀 EXECUTE BUY'
            );

          const balance =
    portfolio.getBalance();

const size =
    getPositionSize(
        balance,
        config.riskPercent,
        config.stopLoss
    );

portfolio.openTrade(
    'BUY',
    currentPrice,
    size
);

            lastTradeTime = now;

            saveLog({

                price:
                    currentPrice,

                signal:
                    'BUY',

                score:
                    score

            });

        }

        // 📉 EXIT
      if (
    signal === 'EXIT' &&
    alignment === 'BEAR'
) {

    const position =
        portfolio.getPosition();

    if (position) {

        console.log(
            '🔴 CLOSE POSITION'
        );

        portfolio.closeTrade(
            currentPrice
        );

        lastTradeTime = now;

        saveLog({

            price:
                currentPrice,

            signal:
                'EXIT',

            score:
                score

        });

    } else {

        console.log(
            '⚠️ NO POSITION TO CLOSE'
        );

    }

}

    } catch (error) {

        console.log(
            '❌ ERROR:',
            error.message
        );

    }
    
    

}

// 🔄 LOOP
setInterval(
    run,
    config.interval
);

// 🚀 START
run();
