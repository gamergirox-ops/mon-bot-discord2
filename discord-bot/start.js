const http = require('http');

// 1. Crée le serveur pour Render
http.createServer((req, res) => res.end('Le bot est en ligne !')).listen(process.env.PORT || 3000);

// 2. Charge les variables d'environnement
require('dotenv').config();

// 3. Capture les erreurs de syntaxe ou de chargement du bot
try {
  console.log('⏳ Tentative de lancement du bot (index.js)...');
  require('./index.js');
} catch (error) {
  console.error('💥 ERREUR CRITIQUE AU DÉMARRAGE DU CODE :');
  console.error(error.stack || error);
}

// 4. Sécurité globale pour éviter les arrêts futurs
process.on('uncaughtException', (err) => {
  console.error('💥 Crache évité (uncaughtException) :', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Erreur de promesse évitée (unhandledRejection) :', err.message);
});
