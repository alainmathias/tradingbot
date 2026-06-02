require('dotenv').config();

module.exports = {
    // ===== API KEYS =====
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    useTestnet: true,  // Met false pour le réel
    
    // ===== PARAMÈTRES DE TRADING =====
    symbol: "BTCUSDT",
    interval: "5m",
    
    // ===== GESTION DES RISQUES (OPTIMISÉ) =====
    tradingCapital: 50,      // Capital virtuel de départ
    riskPercent: 0.5,        // 0.5% = 0.25$ par trade
    stopLoss: 1,             // 1%
    takeProfit: 2,           // 2%
    
    // ===== STRATÉGIE =====
    minScoreToTrade: 65,
    cooldown: 30000,         // 30 secondes
    
    // ===== FILTRES =====
    useATRFilter: true,      // ← ACTIF
    atrMinRatio: 0.5,        // Évite les trades en faible volatilité
    
    // ===== DEBUG =====
    debug: false
};