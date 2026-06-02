// src/firebase.js
const admin = require('firebase-admin');

let db = null;
let initialized = false;

function initFirebase() {
    if (initialized) return;
    
    try {
        const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;
        
        if (!credentialsJson) {
            console.log("⚠️ Firebase non configuré");
            return false;
        }
        
        const serviceAccount = JSON.parse(credentialsJson);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        db = admin.firestore();
        initialized = true;
        console.log("✅ Firebase connecté");
        return true;
        
    } catch (err) {
        console.log("❌ Firebase erreur:", err.message);
        return false;
    }
}

// src/firebase.js (à jour)
async function saveTrade(trade) {
    if (!db) return false;
    
    try {
        const docData = {
            side: trade.side,
            type: trade.type || "OPEN",  // "OPEN" ou "CLOSED"
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString()
        };
        
        // Ajouter les champs optionnels
        if (trade.price) docData.price = trade.price;
        if (trade.entryPrice) docData.entryPrice = trade.entryPrice;
        if (trade.exitPrice) docData.exitPrice = trade.exitPrice;
        if (trade.size) docData.size = trade.size;
        if (trade.pnl) docData.pnl = parseFloat(trade.pnl);
        if (trade.stopLoss) docData.stopLoss = trade.stopLoss;
        if (trade.takeProfit) docData.takeProfit = trade.takeProfit;
        if (trade.closeReason) docData.closeReason = trade.closeReason;
        
        await db.collection('trades').add(docData);
        console.log(`💾 Trade ${trade.type} sauvegardé`);
        return true;
    } catch (err) {
        console.log("❌ Erreur sauvegarde:", err.message);
        return false;
    }
}

module.exports = { initFirebase, saveTrade };
