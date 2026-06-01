
const {
    getWeights
} = require('./ai');



function getScore(
    ind,
    closes,
    regime,
    breakout
) {


const weights =
    getWeights();
    
    
    
    let score = 0;

    const last =
        closes[closes.length - 1];

    const prev =
        closes[closes.length - 2];

    // 📊 RSI
    if (
        ind.rsi < 30 ||
        ind.rsi > 70
    ) {
        score += weights.rsi;
    }

    // 📈 EMA trend
    if (
        ind.ema9 > ind.ema21
    ) {
        score += 20;
    }

    // 📊 MACD
    if (
    ind.macd.MACD >
    ind.macd.signal
) {

    score += weights.macd;

}

    // 📉 ATR volatility
    if (
        ind.atr > 80
    ) {
        score += 15;
    }

    // 🚀 BREAKOUT (IMPORTANT FIX)
    if (
    breakout ===
    "BULL_BREAKOUT"
) {

    score +=
        weights.breakout;

}




    if (
        breakout === "BEAR_BREAKOUT"
    ) {
        score += 35;
    }
    // fake breakout protection
if (
    breakout === "NONE"
) {

    score -= 10;

}

    // ⚡ MOMENTUM
    const momentum =
        ((last - prev) / prev) * 100;

    if (
        Math.abs(momentum) > 0.15
    ) {
        score += 15;
    }

    return score;

}

function getSignal(
    score,
    rsi,
    ema9,
    ema21,
    regime
) {

    // 🚫 zone morte
    if (
        rsi > 45 &&
        rsi < 55
    ) {

        return "NONE";

    }

    // 🟢 BUY SCALPING
    if (

        score >= 60 &&

        ema9 > ema21 &&

        rsi < 60 &&

        regime !== "RANGE"

    ) {

        return "BUY";

    }

    // 🔴 EXIT
    if (

        score >= 50 &&

        ema9 < ema21 &&

        rsi > 50

    ) {

        return "EXIT";

    }

    // 📊 RANGE MODE
  if (
    regime === "RANGE"
) {

    if (

        rsi < 35 &&

        ema9 > ema21

    )

        return "BUY";



    if (

        rsi > 65 &&

        ema9 < ema21

    )

        return "EXIT";

}

    return "NONE";

}

module.exports = {

    getScore,
    getSignal

};
