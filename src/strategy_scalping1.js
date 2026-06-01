const config = require('../config');

function getScore(rsi) {

    if (rsi <= 30) return 100;   // oversold
    if (rsi <= 35) return 70;
    if (rsi <= 40) return 50;

    if (rsi >= 70) return -100;  // overbought

    return 0;
}

function getSignal(score) {

    if (score >= config.minScoreToTrade) {
        return "BUY";
    }

    if (score <= -100) {
        return "SELL";
    }

    return "NONE";
}

module.exports = { getScore, getSignal };