// start.js — point d'entrée avec support .env et serveur web pour Render
const http = require('http');

// Crée un faux serveur web pour que Render ne coupe pas le bot
http.createServer((req, res) => res.end('Le bot est en ligne !')).listen(process.env.PORT || 3000);

require('dotenv').config();
require('./index.js');
