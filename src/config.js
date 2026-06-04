require('dotenv').config();

module.exports = {
    // ===== API KEYS =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: true,  // Passer à false pour le réel
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",
    
    // ===== GESTION DES RISQUES =====
    tradingCapital: 50,      // Capital total
    riskPercent: 0.5,        // 0.5% = 0.25$ par trade
    stopLoss: 1.5,           // 1.5%
    takeProfit: 2.5,         // 2.5%
    
    // ===== STRATÉGIE =====
    minScoreToTrade: 65,
    cooldown: 30000,         // 30 secondes
    
    // ===== FILTRE ATR =====
    useATRFilter: true,
    atrMinRatio: 0.5,
    
    // ===== DEBUG =====
    debug: false
};