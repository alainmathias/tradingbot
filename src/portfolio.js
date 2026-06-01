const { client } = require('./binance');
const config = require('./config');

let position = null;

// CALCUL DE LA TAILLE
function getPositionSize(balance, riskPercent, stopLossPercent) {

    const risk = balance * (riskPercent / 100);

    return risk / stopLossPercent;
}

// POSITION OUVERTE ?
function hasOpenPosition() {
    return position !== null;
}

// RETOURNE LA POSITION
function getPosition() {
    return position;
}

// RESTAURATION
function setPosition(pos) {
    position = pos;
}

// Ouverture d'un ordre Futures
async function openTrade(side, price, size) {
    try {
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: side,
            type: 'MARKET',
            quantity: size
        });
        
        // Placement du Stop Loss et Take Profit
        const stopLossPrice = side === "BUY" 
            ? price * (1 - config.stopLoss / 100)
            : price * (1 + config.stopLoss / 100);
            
        const takeProfitPrice = side === "BUY"
            ? price * (1 + config.takeProfit / 100)
            : price * (1 - config.takeProfit / 100);
        
        // Stop Loss
        await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: 'STOP_MARKET',
            stopPrice: stopLossPrice,
            closePosition: true
        });
        
        // Take Profit
        await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: 'TAKE_PROFIT_MARKET',
            stopPrice: takeProfitPrice,
            closePosition: true
        });
        
        console.log("✅ ORDER OK");
        return order;
        
    } catch (err) {
        console.log("❌ OPEN ERROR:", err.message);
    }
}

// FERMETURE POSITION
async function closePosition() {

    if (!position) {
        console.log("⚠️ NO POSITION");
        return;
    }

    try {

        const positions = await client.futuresPositionRisk();

        const btc = positions.find(
            p => p.symbol === config.symbol
        );

        if (!btc || Number(btc.positionAmt) === 0) {

            console.log("⚠️ NO BINANCE POSITION");

            position = null;

            return;
        }

        console.log(
            "REAL BINANCE SIZE:",
            btc.positionAmt
        );

        const closeSide =
            Number(btc.positionAmt) > 0
                ? "SELL"
                : "BUY";

        const realSize =
            Math.abs(Number(btc.positionAmt));

        console.log("📡 CLOSING POSITION...");
        console.log("SIDE:", closeSide);
        console.log("SIZE:", realSize);

        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: closeSide,
            type: "MARKET",
            quantity: realSize,
            reduceOnly: true,
            recvWindow: 60000
        });

        console.log("🔒 POSITION CLOSED");
        console.log("CLOSE ORDER ID:", order.orderId);

        // Vérification après fermeture
        await new Promise(r => setTimeout(r, 3000));

position = null;

console.log(
    "♻️ BINANCE CLOSED POSITION"
);

        return order;

    } catch (err) {

        console.log(
            "❌ CLOSE ERROR:",
            err.message
        );
    }
}

module.exports = {
    openTrade,
    closePosition,
    hasOpenPosition,
    getPosition,
    setPosition,
    getPositionSize
};