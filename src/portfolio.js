// portfolio.js
const { client } = require('./binance');
const config = require('./config');
const firebase = require('./firebase');

let position = null;

function getPosition() { return position; }
function setPosition(pos) { position = pos; }
function hasOpenPosition() { return position !== null; }

async function openTrade(side, price) {
    try {
        // Vérifier position existante sur Binance
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (btc && Number(btc.positionAmt) !== 0) {
            console.log("⚠️ Position déjà ouverte sur Binance");
            return;
        }
        
        if (position) {
            console.log("⚠️ Position déjà enregistrée localement");
            return;
        }
        
        // Calcul taille position
        const capital = config.tradingCapital;
        const riskPercent = config.riskPercent;
        const stopLossPercent = config.stopLoss;
        
        const riskAmount = capital * (riskPercent / 100);
        const stopDistance = price * (stopLossPercent / 100);
        let size = riskAmount / stopDistance;
        size = Math.max(size, 0.001);
        size = parseFloat(size.toFixed(3));
        
        console.log(`💰 Risque: $${riskAmount.toFixed(2)} | Taille: ${size} BTC`);
        
        // Ordre principal
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: side,
            type: "MARKET",
            quantity: size
        });
        
        // Calcul SL et TP
        const stopLoss = side === "BUY"
            ? price * (1 - config.stopLoss / 100)
            : price * (1 + config.stopLoss / 100);
            
        const takeProfit = side === "BUY"
            ? price * (1 + config.takeProfit / 100)
            : price * (1 - config.takeProfit / 100);
        
        // Stop Loss
        await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: "STOP_MARKET",
            stopPrice: Number(stopLoss.toFixed(2)),
            closePosition: true
        });
        
        // Take Profit
        await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: "TAKE_PROFIT_MARKET",
            stopPrice: Number(takeProfit.toFixed(2)),
            closePosition: true
        });
        
        // Sauvegarde locale
        position = { side, entry: price, size, stopLoss, takeProfit };
        
        // Sauvegarde Firebase (UNIQUE)
        await firebase.saveTrade({
            side: side,
            entryPrice: price,
            size: size,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            type: "OPEN",
            timestamp: new Date().toISOString()
        });
        
        console.log(`✅ ${side} ouvert | Entry: ${price} | Size: ${size} BTC`);
        console.log(`   SL: ${stopLoss.toFixed(2)} | TP: ${takeProfit.toFixed(2)}`);
        
        return order;
        
    } catch (err) {
        console.log("❌ OPEN ERROR:", err.message);
    }
}

async function closePosition() {
    if (!position) {
        console.log("⚠️ Aucune position locale");
        return;
    }
    
    try {
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (!btc || Number(btc.positionAmt) === 0) {
            console.log("⚠️ Position déjà fermée");
            position = null;
            return;
        }
        
        const closeSide = Number(btc.positionAmt) > 0 ? "SELL" : "BUY";
        const realSize = Math.abs(Number(btc.positionAmt));
        
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: closeSide,
            type: "MARKET",
            quantity: realSize,
            reduceOnly: true
        });
        
        const exitPrice = parseFloat(order.price) || position.entry;
        const pnl = position.side === "BUY"
            ? (exitPrice - position.entry) * position.size
            : (position.entry - exitPrice) * position.size;
        
        await firebase.saveTrade({
            side: position.side,
            entryPrice: position.entry,
            exitPrice: exitPrice,
            size: position.size,
            pnl: pnl.toFixed(2),
            type: "CLOSED",
            closeReason: "MANUAL",
            timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Position fermée | P&L: ${pnl.toFixed(2)} USDT`);
        position = null;
        
    } catch (err) {
        console.log("❌ CLOSE ERROR:", err.message);
    }
}

module.exports = { openTrade, closePosition, getPosition, setPosition, hasOpenPosition };