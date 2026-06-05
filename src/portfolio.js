// portfolio.js - Version corrigée sans doublons
const { client } = require('./binance');
const config = require('./config');
const firebase = require('./firebase');

let position = null;
let isClosing = false;  // Anti-doublon

function getPosition() { return position; }
function setPosition(pos) { position = pos; }
function hasOpenPosition() { return position !== null; }

// Calcul taille position
function calculatePositionSize(price) {
    const capital = config.tradingCapital;
    const riskPercent = config.riskPercent;
    const stopLossPercent = config.stopLoss;
    
    const riskAmount = capital * (riskPercent / 100);
    const stopDistance = price * (stopLossPercent / 100);
    let size = riskAmount / stopDistance;
    size = Math.max(size, 0.001);
    return parseFloat(size.toFixed(3));
}

async function openTrade(side, price) {
    try {
        // Vérifier position existante
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (btc && Number(btc.positionAmt) !== 0) {
            console.log("⚠️ Position déjà ouverte");
            return;
        }
        
        if (position) {
            console.log("⚠️ Position déjà enregistrée");
            return;
        }
        
        const size = calculatePositionSize(price);
        const riskAmount = config.tradingCapital * (config.riskPercent / 100);
        
        console.log(`💰 Risque: $${riskAmount.toFixed(2)} | Taille: ${size} BTC`);
        
        // Ordre principal
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: side,
            type: "MARKET",
            quantity: size
        });
        
        // SL et TP (identiques pour ratio 1:1)
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
        
        // Sauvegarde Firebase (UNIQUEMENT OPEN)
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

async function closePosition(reason = "MANUAL", exitPrice = null) {
    if (isClosing) {
        console.log("⚠️ Fermeture déjà en cours");
        return;
    }
    
    if (!position) {
        console.log("⚠️ Aucune position locale");
        return;
    }
    
    isClosing = true;
    
    try {
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (!btc || Number(btc.positionAmt) === 0) {
            console.log("⚠️ Position déjà fermée");
            
            // Utiliser le prix fourni ou le dernier prix connu
            const finalExitPrice = exitPrice || position.entry;
            const pnl = position.side === "BUY"
                ? (finalExitPrice - position.entry) * position.size
                : (position.entry - finalExitPrice) * position.size;
            
            // Éviter d'enregistrer les P&L nuls
            if (Math.abs(pnl) >= 0.01) {
                await firebase.saveTrade({
                    side: position.side,
                    entryPrice: position.entry,
                    exitPrice: finalExitPrice,
                    size: position.size,
                    pnl: pnl.toFixed(2),
                    type: "CLOSED",
                    closeReason: reason,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ Position fermée enregistrée | P&L: ${pnl.toFixed(2)} USDT`);
            } else {
                console.log(`⚠️ P&L nul (${pnl.toFixed(4)}), non enregistré`);
            }
            
            position = null;
            isClosing = false;
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
        
        const finalExitPrice = parseFloat(order.price) || position.entry;
        const pnl = position.side === "BUY"
            ? (finalExitPrice - position.entry) * position.size
            : (position.entry - finalExitPrice) * position.size;
        
        // Éviter d'enregistrer les P&L nuls
        if (Math.abs(pnl) >= 0.01) {
            await firebase.saveTrade({
                side: position.side,
                entryPrice: position.entry,
                exitPrice: finalExitPrice,
                size: position.size,
                pnl: pnl.toFixed(2),
                type: "CLOSED",
                closeReason: reason,
                timestamp: new Date().toISOString()
            });
            console.log(`✅ Position fermée | P&L: ${pnl.toFixed(2)} USDT`);
        } else {
            console.log(`⚠️ P&L nul (${pnl.toFixed(4)}), non enregistré`);
        }
        
        position = null;
        
    } catch (err) {
        console.log("❌ CLOSE ERROR:", err.message);
    } finally {
        isClosing = false;
    }
}

module.exports = { openTrade, closePosition, getPosition, setPosition, hasOpenPosition };