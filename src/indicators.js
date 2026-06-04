// indicators.js
function getRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function getATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return 0;
    let trSum = 0;
    for (let i = highs.length - period; i < highs.length; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        const tr = Math.max(hl, hc, lc);
        trSum += tr;
    }
    return trSum / period;
}

module.exports = { getRSI, getATR };