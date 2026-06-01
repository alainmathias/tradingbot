const axios = require('axios');
const config = require('./config');
const { client, syncTime } = require('./binance');
const portfolio = require('./portfolio');
const { getSignal } = require('./strategy');
const firebase = require('./firebase');  // 🔵 NOUVEAU

let lastTrade = 0;

// Récupération des bougies
async function getCandles() {
    const res = await axios.get(
        `https://testnet.binancefuture.com/fapi/v1/klines?symbol=${config.symbol}&interval=${config.interval}&limit=100`
    );
    return {
        closes: res.data.map(c => parseFloat(c[4])),
        highs: res.data.map(c => parseFloat(c[2])),
        lows: res.data.map(c => parseFloat(c[3])),
        volumes: res.data.map(c => parseFloat(c[5]))
    };
}

async function run() {
    try {
        const { closes, volumes } = await getCandles();
        const price = closes[closes.length - 1];
        
        console.log(`\n🕐 ${new Date().toLocaleTimeString()} - Prix: ${price}`);

        // Calcul du signal
        const signal = getSignal(price, closes, volumes);
        const now = Date.now();

        // Récupération des positions Futures
        const positions = await client.futuresPositionRisk();
        const current = positions.find(p => p.symbol === config.symbol);
        const qty = current ? Number(current.positionAmt) : 0;

        if (qty === 0) {
            if (portfolio.hasOpenPosition()) {
                console.log("♻️ BINANCE CLOSED POSITION");
                portfolio.setPosition(null);
            }
        } else {
            portfolio.setPosition({
                side: qty > 0 ? "BUY" : "SELL",
                size: Math.abs(qty),
                entry: Number(current.entryPrice)
            });
        }

        const position = portfolio.getPosition();
        // Au lieu de :
//const size = 0.001;

// Utilisez plutôt (selon la précision requise) :
//const size = 0.001;  // pour BTCUSDT Futures, c'est OK en théorie

// Ou essayez une taille plus petite :
//const size = 0.0001;  // 10,000 satoshis

// Pour être sûr, utilisez toFixed(3) :
const size = parseFloat((0.001).toFixed(3));

        // SIGNAL BUY
        if (signal === "BUY" && now - lastTrade > config.cooldown) {
            if (position) {
                if (position.side === "BUY") {
                    console.log("⏳ BUY ALREADY OPEN");
                    return;
                }
                console.log("🔄 REVERSAL SELL → BUY");
                await portfolio.closePosition();
            }
            
            await portfolio.openTrade("BUY", price, size);
            
            // 🔵 NOUVEAU : Sauvegarder le trade dans Firebase
            await firebase.saveTrade({
                side: "BUY",
                price: price,
                size: size,
                timestamp: new Date().toISOString(),
                type: "OPEN"
            });
            
            lastTrade = now;
            return;
        }
        
        // SIGNAL SELL
        if (signal === "SELL" && now - lastTrade > config.cooldown) {
            if (position) {
                if (position.side === "SELL") {
                    console.log("⏳ SELL ALREADY OPEN");
                    return;
                }
                console.log("🔄 REVERSAL BUY → SELL");
                await portfolio.closePosition();
            }
            
            await portfolio.openTrade("SELL", price, size);
            
            // 🔵 NOUVEAU : Sauvegarder le trade dans Firebase
            await firebase.saveTrade({
                side: "SELL",
                price: price,
                size: size,
                timestamp: new Date().toISOString(),
                type: "OPEN"
            });
            
            lastTrade = now;
            return;
        }
        
    } catch (err) {
        console.log("❌ BOT ERROR:", err.message);
        console.log(err.stack);
    }
}

// ===== DÉMARRAGE =====
(async () => {
    try {
        await syncTime();
        
        // 🔵 NOUVEAU : Initialiser Firebase
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
        console.log(`🎯 minScore: ${config.minScoreToTrade} | Cooldown: ${config.cooldown}ms\n`);
        console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID ? 'Connecté' : 'Non configuré'}`);
        
        setInterval(run, 10000);
        
    } catch (err) {
        console.log("❌ START ERROR:", err.message);
        console.log(err.stack);
    }
})();