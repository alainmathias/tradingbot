function detectBreakout(
    closes,
    volume,
    avgVolume,
    ema9,
    ema21
) {

    const recent =
        closes.slice(-20);

    const max =
        Math.max(...recent);

    const min =
        Math.min(...recent);

    const current =
        closes[closes.length - 1];

    const prev =
        closes[closes.length - 2];

    // 📈 momentum %
    const momentum =
        (
            (
                current - prev
            ) / prev
        ) * 100;

    // 📊 EMA distance
    const emaDistance =
        Math.abs(
            ema9 - ema21
        );

    // 🚀 VALID BULL BREAKOUT
    if (

        current > max * 1.001 &&

        volume >
        avgVolume * 1.8 &&

        momentum > 0.15 &&

        ema9 > ema21 &&

        emaDistance > 10

    ) {

        return "BULL_BREAKOUT";

    }

    // 📉 VALID BEAR BREAKOUT
    if (

        current < min * 0.999 &&

        volume >
        avgVolume * 1.8 &&

        momentum < -0.15 &&

        ema9 < ema21 &&

        emaDistance > 10

    ) {

        return "BEAR_BREAKOUT";

    }

    return "NONE";

}

module.exports = {

    detectBreakout

};