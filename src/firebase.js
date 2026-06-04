// firebase.js
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

async function saveTrade(trade) {
    if (!db) return false;
    
    try {
        const docRef = await db.collection('trades').add({
            ...trade,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`💾 Trade sauvegardé (${trade.type})`);
        return true;
    } catch (err) {
        console.log("❌ Erreur sauvegarde:", err.message);
        return false;
    }
}

module.exports = { initFirebase, saveTrade };