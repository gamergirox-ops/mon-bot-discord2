// start.js — Point d'entrée avec support Render et Diagnostic
const http = require('http');

// 1. Crée un serveur web fictif pour que Render ne coupe pas le bot
http.createServer((req, res) => {
  res.end('Le bot PlayZone est en ligne !');
}).listen(process.env.PORT || 3000, () => {
  console.log(`🌐 Faux serveur web démarré sur le port ${process.env.PORT || 3000}`);
});

// 2. Charge le module dotenv (au cas où)
require('dotenv').config();

// 3. DIAGNOSTIC : Vérifie si Render transmet bien le token
console.log('🔍 Vérification des variables d\'environnement...');
if (process.env.DISCORD_TOKEN) {
  console.log('✅ DISCORD_TOKEN a bien été détecté par l\'hébergeur !');
} else {
  console.log('❌ DISCORD_TOKEN est INTROUVABLE dans le système.');
  // Liste les clés disponibles pour comprendre le problème (sans afficher les valeurs secrètes)
  console.log('Clés visibles par le bot :', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')));
}

// 4. Lance le bot principal
require('./index.js');
