const { getWeights } = require('./ai');

function getScore(ind) {

    // 🟢 RSI très bas
    if (ind.rsi < 30) {
        return 100;
    }

    // 🟡 RSI bas
    if (ind.rsi < 35) {
        return 70;
    }

    // ⚪ RSI légèrement bas
    if (ind.rsi < 50) {
        return 50;
    }

    // 🔴 pas de setup
    return 0;
}

function getSignal(score, rsi) {

    // 🚀 BUY fort
    if (score >= 50) {
        return "BUY";
    }

    // 📉 EXIT
    if (rsi > 70) {
        return "EXIT";
    }

    // ⚪ rien
    return "NONE";
}

module.exports = {

    getScore,
    getSignal

};