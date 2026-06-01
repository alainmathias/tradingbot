const {
    RSI,
    EMA,
    MACD,
    ATR
} = require('technicalindicators');

function getIndicators(candles) {

    const closes = candles.map(c =>
        parseFloat(c[4])
    );

    const highs = candles.map(c =>
        parseFloat(c[2])
    );

    const lows = candles.map(c =>
        parseFloat(c[3])
    );

    // RSI
    const rsi = RSI.calculate({

        values: closes,

        period: 14

    });

    // EMA
    const ema9 = EMA.calculate({

        values: closes,

        period: 9

    });

    const ema21 = EMA.calculate({

        values: closes,

        period: 21

    });

    // MACD
    const macd = MACD.calculate({

        values: closes,

        fastPeriod: 12,

        slowPeriod: 26,

        signalPeriod: 9,

        SimpleMAOscillator: false,

        SimpleMASignal: false

    });

    // ATR
    const atr = ATR.calculate({

        high: highs,

        low: lows,

        close: closes,

        period: 14

    });

    return {

        rsi: rsi[rsi.length - 1],

        ema9: ema9[ema9.length - 1],

        ema21: ema21[ema21.length - 1],

        macd:
            macd[macd.length - 1],

        atr:
            atr[atr.length - 1],

volume:parseFloat(
        candles[candles.length - 1][5]
    ),

avgVolume:

    candles
        .slice(-20)
        .reduce(
            (a, c) =>
                a + parseFloat(c[5]),
            0
        ) / 20



    };

}

module.exports = {

    getIndicators

};
