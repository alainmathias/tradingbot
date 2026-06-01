let weights = {

    rsi: 25,

    ema: 20,

    macd: 25,

    breakout: 50,

    atr: 15

};

// 📊 update weights
function updateWeights(
    trade
) {

    // 🟢 WIN
    if (trade.pnl > 0) {

        if (trade.reason === 'MACD') {

            weights.macd += 1;

        }

        if (trade.reason === 'BREAKOUT') {

            weights.breakout += 2;

        }

    }

    // 🔴 LOSS
    else {

        if (trade.reason === 'MACD') {

            weights.macd -= 1;

        }

        if (trade.reason === 'BREAKOUT') {

            weights.breakout -= 2;

        }

    }

    // 🛡 min/max protection
    weights.macd =
        Math.max(
            5,
            Math.min(
                50,
                weights.macd
            )
        );

    weights.breakout =
        Math.max(
            10,
            Math.min(
                80,
                weights.breakout
            )
        );

}

// 📈 get current weights
function getWeights() {

    return weights;

}

module.exports = {

    updateWeights,

    getWeights

};
