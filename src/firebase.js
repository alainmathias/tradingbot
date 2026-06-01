// src/firebase.js
const admin = require('firebase-admin');

let db = null;
let initialized = false;

function initFirebase() {
    if (initialized) return;
    
    try {
        const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;
        
        if (!credentialsJson) {
            console.log("⚠️ Firebase non configuré (variables manquantes)");
            return false;
        }
        
        const serviceAccount = JSON.parse(credentialsJson);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        db = admin.firestore();
        initialized = true;
        console.log("✅ Firebase connecté - Project:", serviceAccount.project_id);
        return true;
        
    } catch (err) {
        console.log("❌ Firebase erreur:", err.message);
        return false;
    }
}

async function saveTrade(trade) {
    if (!db) {
        console.log("⚠️ Firebase non disponible, trade non sauvegardé");
        return false;
    }
    
    try {
        const docRef = await db.collection('trades').add({
            side: trade.side,
            price: trade.price,
            size: trade.size,
            type: trade.type || "OPEN",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString()
        });
        console.log(`💾 Trade sauvegardé dans Firebase (ID: ${docRef.id})`);
        return true;
    } catch (err) {
        console.log("❌ Erreur sauvegarde Firebase:", err.message);
        return false;
    }
}

async function getRecentTrades(limit = 10) {
    if (!db) return [];
    
    try {
        const snapshot = await db.collection('trades')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        const trades = [];
        snapshot.forEach(doc => {
            trades.push({ id: doc.id, ...doc.data() });
        });
        return trades;
    } catch (err) {
        console.log("❌ Erreur lecture:", err.message);
        return [];
    }
}

module.exports = { 
    initFirebase, 
    saveTrade,
    getRecentTrades
};