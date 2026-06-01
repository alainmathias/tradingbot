let balance = 1000;

let position = null;

let trades = [];

let wins = 0;

let losses = 0;

let totalPnL = 0;


let peakBalance = 1000;

let tradingPaused = false;



function openTrade(
    type,
    price,
    size = 0.001
) {

    position = {

        type,

        entry: price,

        size,

        time: Date.now()

    };

    console.log(
        '📈 TRADE OPENED'
        
    );
console.log("✅ openTrade called");
}

function updatePnL(
    currentPrice
) {

    if (!position)
        return null;

    let pnlPercent = 0;

    // BUY
    if (
        position.type === 'BUY'
    ) {

        pnlPercent =
            (
                (
                    currentPrice -
                    position.entry
                ) /
                position.entry
            ) * 100;

    }

    // SELL
    else {

        pnlPercent =
            (
                (
                    position.entry -
                    currentPrice
                ) /
                position.entry
            ) * 100;

    }

    const pnlAmount =
        (
            balance *
            pnlPercent
        ) / 100;

    return {

        pnlPercent,

        pnlAmount

    };

}

function closeTrade(
    currentPrice
) {

if (balance > peakBalance) {

    peakBalance = balance;

}



    const pnl =
        updatePnL(
            currentPrice
        );

    if (
        !pnl ||
        !position
    ) return;

    balance +=
        pnl.pnlAmount;



totalPnL += pnl.pnlAmount;

// 🟢 WIN
if (
    pnl.pnlAmount > 0
) {

    wins++;

}

// 🔴 LOSS
else {

    losses++;

}
    trades.push({

        ...position,

        exit: currentPrice,

        pnlPercent:
            pnl.pnlPercent,

        pnlAmount:
            pnl.pnlAmount,

        balanceAfter:
            balance

    });

    console.log(
        '📊 TRADE CLOSED'
    );

    console.log(
        '💰 NEW BALANCE:',
        balance.toFixed(2)
    );

    position = null;

}




function getDrawdown() {

    const drawdown =

        (
            (
                peakBalance - balance
            ) / peakBalance
        ) * 100;

    return drawdown;

}



function getPositionSize(
    balance,
    riskPercent,
    stopLossPercent
) {

    const riskAmount =
        balance *
        (riskPercent / 100);

    const size =
        riskAmount /
        stopLossPercent;

    return size;

}

function getPosition() {

    return position;

}

function getBalance() {

    return balance;

}

function getTrades() {

    return trades;

}



function shouldPauseTrading() {

    const dd =
        getDrawdown();

    // 🛑 stop si perte forte
    if (dd >= 10) {

        tradingPaused = true;

    }

    return tradingPaused;

}


function getAnalytics() {

    const totalTrades =
        wins + losses;

    let winRate = 0;

    if (
        totalTrades > 0
    ) {

        winRate =
            (
                wins /
                totalTrades
            ) * 100;

    }

    return {

        totalTrades,

        wins,

        losses,

        winRate,

        totalPnL,

        balance

    };

}


module.exports = {

    openTrade,

    updatePnL,

    closeTrade,

    getPosition,

    getBalance,

    getTrades,

    getPositionSize,

    getDrawdown,
    getAnalytics, 

    shouldPauseTrading

};
