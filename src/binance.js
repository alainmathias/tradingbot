/*const Binance = require('binance-api-node').default;
const axios = require('axios');
const config = require('./config');

// Configuration du client pour le testnet Futures
const client = Binance({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    httpFutures: 'https://testnet.binancefuture.com'
});

let timeOffset = 0;

async function syncTime() {
    try {
        const res = await axios.get(
            'https://testnet.binancefuture.com/fapi/v1/time'
        );
        const serverTime = res.data.serverTime;
        timeOffset = serverTime - Date.now();
        console.log("🕒 BINANCE FUTURES TIME:", serverTime);
        console.log("🕒 OFFSET:", timeOffset);
    } catch (err) {
        console.log("❌ TIME SYNC ERROR:", err.message);
    }
}

function getTimestamp() {
    return Date.now() + timeOffset;
}

module.exports = {
    client,
    syncTime,
    getTimestamp
};*/


const Binance = require('binance-api-node').default;
const axios = require('axios');
const config = require('./config');

// Supprimez ce bloc qui cause l'erreur :
// if (!config.apiKey || !config.apiSecret) {
//     console.error("❌ ERREUR: Clés API manquantes dans .env");
//     console.error("   Créez un fichier .env avec:");
//     console.error("   BINANCE_API_KEY=votre_clé");
//     process.exit(1);
// }

// Remplacez par une vérification plus simple
if (!config.apiKey || !config.apiSecret) {
    console.error("❌ ERREUR: Clés API manquantes dans les variables d'environnement");
    console.error("   Configurez BINANCE_API_KEY et BINANCE_API_SECRET sur Railway");
    process.exit(1);
}

const baseURL = config.useTestnet 
    ? 'https://testnet.binancefuture.com'
    : 'https://fapi.binance.com';

const client = Binance({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    httpFutures: baseURL
});

console.log(`🔌 Connexion à ${config.useTestnet ? 'TESTNET' : 'MAINNET'} Futures`);

let timeOffset = 0;

async function syncTime() {
    try {
        const url = config.useTestnet
            ? 'https://testnet.binancefuture.com/fapi/v1/time'
            : 'https://fapi.binance.com/fapi/v1/time';
            
        const res = await axios.get(url);
        const serverTime = res.data.serverTime;
        timeOffset = serverTime - Date.now();
        
        console.log("🕒 SERVER TIME:", new Date(serverTime).toLocaleTimeString());
        console.log("🕒 OFFSET:", timeOffset, "ms");
    } catch (err) {
        console.log("❌ TIME SYNC ERROR:", err.message);
    }
}

function getTimestamp() {
    return Date.now() + timeOffset;
}

module.exports = {
    client,
    syncTime,
    getTimestamp
};