require('dotenv').config();

module.exports = {
    // ===== API KEYS =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: true,
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",
    
    // ===== GESTION DES RISQUES (RATIO 1:1) =====
    tradingCapital: 50,
    riskPercent: 0.5,        // 0.25$ par trade
    stopLoss: 1.5,           // 1.5%
    takeProfit: 1.5,         // 1.5% (identique)
    
    // ===== STRATÉGIE =====
    minScoreToTrade: 65,
    cooldown: 30000,
    
    // ===== FILTRE ATR =====
    useATRFilter: true,
    atrMinRatio: 0.5,
    
    debug: false
};