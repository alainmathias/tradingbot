function getMarketRegime(closes) {

    const last = closes.length;

    const recent = closes.slice(last - 20);

    const max = Math.max(...recent);

    const min = Math.min(...recent);

    const range = (max - min) / min * 100;

    const current = closes[last - 1];

    // 📊 RANGE MARKET
    if (range < 0.8) {
        return "RANGE";
    }

    // 🚀 BREAKOUT
    if (current > max * 0.999 || current < min * 1.001) {
        return "BREAKOUT";
    }

    // 📈 TREND
    return "TREND";

}

module.exports = { getMarketRegime };
