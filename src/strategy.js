// strategy.js - Version avec filtre ATR
const config = require('./config');
const { getRSI, getATR } = require('./indicators');

let lastSignal = "NONE";
let consecutiveSignals = 0;

function getRSIScore(rsi) {
    if (rsi <= 25) return 100;
    if (rsi <= 30) return 85;
    if (rsi <= 35) return 60;
    if (rsi <= 45) return 30;
    
    if (rsi >= 75) return -100;
    if (rsi >= 70) return -85;
    if (rsi >= 65) return -60;
    if (rsi >= 55) return -30;
    
    return 0;
}

function getSignal(price, closes, highs, lows, volumes) {
    // Calcul du RSI
    const rsi = getRSI(closes);
    let score = getRSIScore(rsi);
    
    // ========== FILTRE ATR (volatilité) ==========
    if (config.useATRFilter && highs && lows && highs.length > 0) {
        const atr = getATR(highs, lows, closes);
        const avgRange = price * 0.01;  // 1% du prix
        const minATR = avgRange * (config.atrMinRatio || 0.5);
        
        if (atr < minATR) {
            if (config.debug) {
                console.log(`   ⚠️ Volatilité trop faible (ATR: ${atr.toFixed(2)} < ${minATR.toFixed(2)}) → signal ignoré`);
            }
            return "NONE";
        }
        if (config.debug) {
            console.log(`   ✅ Volatilité OK (ATR: ${atr.toFixed(2)})`);
        }
    }
    
    // Confirmation sur 2 bougies consécutives
    let signal = "NONE";
    if (score >= config.minScoreToTrade) {
        signal = "BUY";
    } else if (score <= -config.minScoreToTrade) {
        signal = "SELL";
    }
    
    if (signal === lastSignal && signal !== "NONE") {
        consecutiveSignals++;
        if (consecutiveSignals < 2) {
            return "NONE";
        }
    } else {
        consecutiveSignals = signal === "NONE" ? 0 : 1;
    }
    
    lastSignal = signal;
    
    console.log(`\n📊 RSI: ${rsi.toFixed(2)} | SCORE: ${score} | SIGNAL: ${signal}`);
    
    return signal;
}

module.exports = { getSignal };