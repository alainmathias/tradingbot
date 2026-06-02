/*module.exports = {

    apiKey: 'Pbtsd0fEA6nY3WDvoP9OzoQogFBo2fMVumWxPrt6I4DmP5Z3wHRaXU7OCbMMZjN4',

    apiSecret: 'uO7EuGZMmruaFo47Nbzol8IeTHdCCX4NVs4GDa79dR0BcNPSBXeeq1FahBZVLjPR',

  
    symbol: "BTCUSDT",
    interval: "5m",  // ← Changé de 1m à 5m (plus fiable)
    
    riskPercent: 1,
    stopLoss: 1.5,      // ← Augmenté pour éviter les stop trop serrés
    takeProfit: 2.5,    // ← Ratio 1:1.67
    
    minScoreToTrade: 65,  // ← Plus exigeant = moins de trades mais plus fiables
    cooldown: 30000       // ← 30 secondes entre les trades
};*/


/*

// config.js - Version Railway
module.exports = {
    // ===== API KEYS (depuis variables Railway) =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: process.env.USE_TESTNET === 'true' || true,
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",
    
    // ===== GESTION DES RISQUES =====
    riskPercent: 1,
    stopLoss: 1.5,
    takeProfit: 2.5,
    
    // ===== STRATÉGIE =====
    minScoreToTrade: 65,
    cooldown: 30000,
    
    // ===== DEBUG =====
    debug: false
};

*/


    require('dotenv').config();

module.exports = {
    // ===== API KEYS (Testnet) =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: true,  // ← Reste TRUE
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",              // Timeframe original
    
    // ===== GESTION DES RISQUES =====
    tradingCapital: 50,          // ← 50 USDT virtuels
    riskPercent: 1,              // 1% = 0.50 USDT par trade
    stopLoss: 1.5,               // 1.5%
    takeProfit: 2.5,             // 2.5%
    
    // ===== STRATÉGIE ORIGINALE =====
    minScoreToTrade: 65,         // Seuil élevé
    cooldown: 30000,             // 30 secondes
    
    // ===== DEBUG =====
    debug: false
};