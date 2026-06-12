const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// 1. Initialisation du client avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "!"; 

// 2. Lancement du "faux serveur" pour que Render ne coupe pas le bot
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Le bot est en ligne !');
});
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur actif sur le port ${PORT}`);
});

client.once('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 3. Gestion des commandes avec le préfixe "!"
client.on('messageCreate', (message) => {
    // Ne pas répondre aux autres bots ou aux messages sans préfixe
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Sépare la commande des arguments
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Vos commandes ici
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
