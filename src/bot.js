const axios = require('axios');
const config = require('./config');
const { client, syncTime } = require('./binance');
const portfolio = require('./portfolio');
const { getSignal } = require('./strategy');
const firebase = require('./firebase');

let lastTrade = 0;

// Récupération des bougies
async function getCandles() {
    try {
        const baseUrl = config.useTestnet 
            ? 'https://testnet.binancefuture.com'
            : 'https://fapi.binance.com';
        const res = await axios.get(
            `${baseUrl}/fapi/v1/klines?symbol=${config.symbol}&interval=${config.interval}&limit=100`
        );
        return {
            closes: res.data.map(c => parseFloat(c[4])),
            highs: res.data.map(c => parseFloat(c[2])),
            lows: res.data.map(c => parseFloat(c[3])),
            volumes: res.data.map(c => parseFloat(c[5]))
        };
    } catch (err) {
        console.log("❌ Erreur getCandles:", err.message);
        return { closes: [], highs: [], lows: [], volumes: [] };
    }
}

// Synchronisation avec Binance (SL/TP détection)
async function syncPositionWithBinance() {
    try {
        const positions = await client.futuresPositionRisk();
        const current = positions.find(p => p.symbol === config.symbol);
        const binanceQty = current ? Number(current.positionAmt) : 0;
        const localPosition = portfolio.getPosition();
        
        if (binanceQty === 0 && localPosition) {
            console.log("🔄 Détection: Position fermée sur Binance (SL/TP)");
            const candles = await getCandles();
            const exitPrice = candles.closes.length > 0 ? candles.closes[candles.closes.length - 1] : localPosition.entry;
            const pnl = localPosition.side === "BUY"
                ? (exitPrice - localPosition.entry) * localPosition.size
                : (localPosition.entry - exitPrice) * localPosition.size;
            
            await firebase.saveTrade({
                side: localPosition.side,
                entryPrice: localPosition.entry,
                exitPrice: exitPrice,
                size: localPosition.size,
                pnl: pnl.toFixed(2),
                type: "CLOSED",
                closeReason: "SL/TP",
                timestamp: new Date().toISOString()
            });
            console.log(`✅ Position fermée enregistrée | P&L: ${pnl.toFixed(2)} USDT`);
            portfolio.setPosition(null);
        }
        
        if (binanceQty !== 0 && !localPosition) {
            portfolio.setPosition({
                side: binanceQty > 0 ? "BUY" : "SELL",
                size: Math.abs(binanceQty),
                entry: Number(current.entryPrice)
            });
        }
    } catch (err) {
        console.log("❌ Erreur synchronisation:", err.message);
    }
}

async function run() {
    try {
        await syncPositionWithBinance();
        
        const { closes, highs, lows, volumes } = await getCandles();
        if (!closes.length) return;
        
        const price = closes[closes.length - 1];
        console.log(`\n🕐 ${new Date().toLocaleTimeString()} - Prix: ${price}`);
        
        const signal = getSignal(price, closes, highs, lows, volumes);
        const now = Date.now();
        
        const positions = await client.futuresPositionRisk();
        const current = positions.find(p => p.symbol === config.symbol);
        const qty = current ? Number(current.positionAmt) : 0;
        
        if (qty === 0 && portfolio.hasOpenPosition()) {
            portfolio.setPosition(null);
        } else if (qty !== 0) {
            portfolio.setPosition({
                side: qty > 0 ? "BUY" : "SELL",
                size: Math.abs(qty),
                entry: Number(current.entryPrice)
            });
        }
        
        const position = portfolio.getPosition();
        
        // Calcul taille position (basé sur capital et risque)
        const riskAmount = config.tradingCapital * (config.riskPercent / 100);
        const stopDistance = price * (config.stopLoss / 100);
        let size = riskAmount / stopDistance;
        size = Math.max(size, 0.001);
        size = parseFloat(size.toFixed(3));
        
        console.log(`💰 Risque: $${riskAmount.toFixed(2)} | Taille: ${size} BTC | Stop: ${stopDistance.toFixed(2)}`);
        
        // SIGNAL BUY
        if (signal === "BUY" && now - lastTrade > config.cooldown) {
            if (position && position.side === "BUY") return;
            if (position) await portfolio.closePosition();
            await portfolio.openTrade("BUY", price, size);
            lastTrade = now;
            return;
        }
        
        // SIGNAL SELL
        if (signal === "SELL" && now - lastTrade > config.cooldown) {
            if (position && position.side === "SELL") return;
            if (position) await portfolio.closePosition();
            await portfolio.openTrade("SELL", price, size);
            lastTrade = now;
            return;
        }
        
    } catch (err) {
        console.log("❌ BOT ERROR:", err.message);
    }
}

(async () => {
    try {
        await syncTime();
        firebase.initFirebase();
        
        const positions = await client.futuresPositionRisk();
        const current = positions.find(p => p.symbol === config.symbol);
        if (current && Number(current.positionAmt) !== 0) {
            portfolio.setPosition({
                side: Number(current.positionAmt) > 0 ? "BUY" : "SELL",
                size: Math.abs(Number(current.positionAmt)),
                entry: Number(current.entryPrice)
            });
            console.log("♻️ POSITION RESTORED");
        }
        
        console.log(`✅ BOT STARTED - ${config.symbol} on ${config.interval}`);
        console.log(`💰 Capital: $${config.tradingCapital} | Risk: ${config.riskPercent}% | SL:${config.stopLoss}% TP:${config.takeProfit}%`);
        console.log(`🔍 Filtre ATR: ${config.useATRFilter ? 'ACTIF' : 'INACTIF'}`);
        
        setInterval(run, 10000);
    } catch (err) {
        console.log("❌ START ERROR:", err.message);
    }
})();