const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Initialisation du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "!"; 

// 2. Lancement du serveur web pour Render (pour éviter que le bot ne coupe)
const renderApp = express();
const RENDER_PORT = process.env.PORT || 10000;

renderApp.get('/', (req, res) => {
    res.send('Bot Discord en ligne et actif !');
});

renderApp.listen(RENDER_PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur web Render actif sur le port ${RENDER_PORT}`);
});

// 3. Événement quand le bot s'allume
client.once('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 4. Gestion des commandes avec le préfixe "!"
client.on('messageCreate', (message) => {
    // Ne pas répondre aux autres bots ou aux messages sans préfixe
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Sépare la commande des arguments
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Tes commandes
    if (command === 'ping') {
        message.reply('Pong ! 🏓');
    } 
    else if (command === 'bonjour') {
        message.reply(`Salut ${message.author.username} ! Comment ça va ?`);
    }
    else if (command === 'help') {
        message.reply('Mes commandes sont : !ping, !bonjour, !help');
    }
});

// Connexion avec le jeton sécurisé
client.login(process.env.DISCORD_TOKEN);
