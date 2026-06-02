const { client } = require('./binance');
const config = require('./config');
const firebase = require('./firebase');

let position = null;

// ========== NOUVEAU : CALCUL DYNAMIQUE DE LA TAILLE ==========
function calculatePositionSize(price) {
    // Récupérer le capital depuis la config (50 USDT)
    const capital = config.tradingCapital || 50;
    const riskPercent = config.riskPercent || 1;
    const stopLossPercent = config.stopLoss || 1.5;
    
    // Risque en USDT (ex: 50 × 1% = 0.50 USDT)
    const riskAmount = capital * (riskPercent / 100);
    
    // Distance du stop loss en USDT (ex: 65000 × 1.5% = 975 USDT)
    const stopDistance = price * (stopLossPercent / 100);
    
    // Taille de la position (ex: 0.50 ÷ 975 = 0.00051 BTC)
    let size = riskAmount / stopDistance;
    
    // Arrondir à 3 décimales (minimum 0.001 BTC pour Binance Futures)
    size = Math.max(size, 0.001);
    size = parseFloat(size.toFixed(3));
    
    // Afficher les détails du calcul
    console.log(`\n💰 GESTION DES RISQUES (capital: ${capital} USDT):`);
    console.log(`   Risque par trade: ${riskAmount.toFixed(2)} USDT (${riskPercent}%)`);
    console.log(`   Prix BTC: ${price.toFixed(2)} USDT`);
    console.log(`   Distance SL: ${stopDistance.toFixed(2)} USDT (${stopLossPercent}%)`);
    console.log(`   Taille position: ${size} BTC`);
    console.log(`   Exposition: ${(size * price).toFixed(2)} USDT`);
    console.log(`   Perte max si SL: ${(size * price * stopLossPercent / 100).toFixed(2)} USDT\n`);
    
    return size;
}

// ========== ANCIENNE FONCTION (gardée pour compatibilité) ==========
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

// ========== OUVERTURE DE POSITION (MODIFIÉE) ==========
async function openTrade(side, price, customSize = null) {
    try {
        // Vérifier position existante
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (btc && Number(btc.positionAmt) !== 0) {
            console.log("⏳ Position déjà existante");
            return;
        }

        // 🆕 Calculer la taille automatiquement (basée sur capital 50 USDT)
        let size;
        if (customSize) {
            size = customSize;
            console.log(`📊 Taille manuelle: ${size} BTC`);
        } else {
            size = calculatePositionSize(price);
        }
        
        // Vérifier que la taille est valide
        if (size < 0.001) {
            console.log("❌ Taille trop petite (< 0.001 BTC)");
            return;
        }

        // 1. PLACER L'ORDRE PRINCIPAL
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: side,
            type: "MARKET",
            quantity: Number(size.toFixed(3))
        });

        // 2. CALCULER SL ET TP
        const stopLoss = side === "BUY"
            ? price * (1 - config.stopLoss / 100)
            : price * (1 + config.stopLoss / 100);
            
        const takeProfit = side === "BUY"
            ? price * (1 + config.takeProfit / 100)
            : price * (1 - config.takeProfit / 100);

        // 3. PLACER LE STOP LOSS
        const slOrder = await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: "STOP_MARKET",
            stopPrice: Number(stopLoss.toFixed(2)),
            closePosition: true,
            workingType: "MARK_PRICE"
        });

        // 4. PLACER LE TAKE PROFIT
        const tpOrder = await client.futuresOrder({
            symbol: config.symbol,
            side: side === "BUY" ? "SELL" : "BUY",
            type: "TAKE_PROFIT_MARKET",
            stopPrice: Number(takeProfit.toFixed(2)),
            closePosition: true,
            workingType: "MARK_PRICE"
        });

        // 5. ENREGISTRER LA POSITION LOCALEMENT
        position = {
            side,
            entry: price,
            size: size,
            stopLoss,
            takeProfit,
            slOrderId: slOrder.orderId,
            tpOrderId: tpOrder.orderId,
            time: Date.now()
        };

        // 6. SAUVEGARDER DANS FIREBASE (OPEN)
        await firebase.saveTrade({
            side: side,
            price: price,
            size: size,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            type: "OPEN",
            timestamp: new Date().toISOString()
        });

        console.log(`✅ ${side} ORDER EXECUTED`);
        console.log(`   Entry: ${price}`);
        console.log(`   Size: ${size} BTC`);
        console.log(`   SL: ${stopLoss.toFixed(2)} (${config.stopLoss}%)`);
        console.log(`   TP: ${takeProfit.toFixed(2)} (${config.takeProfit}%)`);
        
        return order;

    } catch (err) {
        console.log("❌ OPEN ERROR:", err.message);
    }
}

// ========== FERMETURE DE POSITION ==========
async function closePosition() {
    if (!position) {
        console.log("⚠️ Aucune position locale");
        return;
    }

    try {
        // Vérifier la position sur Binance
        const positions = await client.futuresPositionRisk();
        const btc = positions.find(p => p.symbol === config.symbol);
        
        if (!btc || Number(btc.positionAmt) === 0) {
            console.log("⚠️ Position déjà fermée sur Binance");
            
            // Sauvegarder la fermeture dans Firebase
            await firebase.saveTrade({
                side: position.side,
                entryPrice: position.entry,
                exitPrice: position.entry,
                size: position.size,
                type: "CLOSED",
                closeReason: "MANUAL",
                timestamp: new Date().toISOString()
            });
            
            position = null;
            return;
        }

        // Fermer la position
        const closeSide = Number(btc.positionAmt) > 0 ? "SELL" : "BUY";
        const realSize = Math.abs(Number(btc.positionAmt));
        
        const order = await client.futuresOrder({
            symbol: config.symbol,
            side: closeSide,
            type: "MARKET",
            quantity: realSize,
            reduceOnly: true
        });

        // Récupérer le prix de fermeture
        const exitPrice = parseFloat(order.price) || position.entry;
        
        // Calculer le P&L
        const pnl = position.side === "BUY"
            ? (exitPrice - position.entry) * position.size
            : (position.entry - exitPrice) * position.size;

        // Sauvegarder la fermeture dans Firebase
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

        console.log(`✅ POSITION CLOSED`);
        console.log(`   Entry: ${position.entry} | Exit: ${exitPrice}`);
        console.log(`   P&L: ${pnl.toFixed(2)} USDT`);
        
        position = null;
        return order;

    } catch (err) {
        console.log("❌ CLOSE ERROR:", err.message);
    }
}

module.exports = {
    openTrade,
    closePosition,
    hasOpenPosition,
    getPosition,
    setPosition,
    getPositionSize,
    calculatePositionSize  // 🆕 Exporter la nouvelle fonction
};