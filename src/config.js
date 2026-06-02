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
    // ===== API KEYS =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: true,
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",
    
    // ===== GESTION DES RISQUES (OPTIMISÉ) =====
    tradingCapital: 50,
    riskPercent: 0.5,       // ← MODIFIÉ (0.5%)
    stopLoss: 1,            // ← MODIFIÉ (1%)
    takeProfit: 2,          // ← MODIFIÉ (2%)
    
    // ===== STRATÉGIE =====
    minScoreToTrade: 65,
    cooldown: 30000,
    
    // ===== DEBUG =====
    debug: false
};