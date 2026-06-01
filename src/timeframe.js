function getTrend(
    ema9,
    ema21
) {

    // 📈 bullish
    if (ema9 > ema21) {

        return 'BULL';

    }

    // 📉 bearish
    if (ema9 < ema21) {

        return 'BEAR';

    }

    return 'RANGE';

}

// 📊 alignment check
function isAligned(
    tf1,
    tf5,
    tf15
) {

    // 🚀 bullish alignment
    if (

        tf1 === 'BULL' &&
        tf5 === 'BULL' &&
        tf15 === 'BULL'

    ) {

        return 'BULL';

    }

    // 📉 bearish alignment
    if (

        tf1 === 'BEAR' &&
        tf5 === 'BEAR' &&
        tf15 === 'BEAR'

    ) {

        return 'BEAR';

    }

    return 'NONE';

}

module.exports = {

    getTrend,

    isAligned

};
