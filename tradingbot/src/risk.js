let dailyLoss = 0;

function canTrade(score, config) {

    if (
        score <
        config.risk.minScoreToTrade
    ) {

        return false;

    }

    if (
        dailyLoss >=
        config.risk.maxDailyLoss
    ) {

        return false;

    }

    return true;

}

function updateLoss(lossPercent) {

    dailyLoss += lossPercent;

}

module.exports = {

    canTrade,

    updateLoss

};
