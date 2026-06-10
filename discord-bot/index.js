const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Les requêtes textuelles ne sont plus obligatoires pour les slash commands !
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// 1. Chargement des fichiers de commandes
const commandsArray = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON()); // On prépare l'enregistrement chez Discord
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('🎮 Mini-Jeux | /aide', { type: ActivityType.Playing });

  // 2. ENREGISTREMENT DES COMMANDES CHEZ DISCORD
  try {
    console.log('⏳ Enregistrement des commandes en slash chez Discord...');
    // Cette ligne enregistre les commandes Globalement (sur tous les serveurs où est le bot)
    await client.application.commands.set(commandsArray);
    console.log('✅ Toutes les commandes en slash ont été enregistrées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des commandes :', error);
  }
});

// 3. GESTION DES INTERACTIONS (Quand un utilisateur tape /)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Système de Cooldown (Adapté pour les interactions)
  if (!client.cooldowns.has(command.data.name)) {
    client.cooldowns.set(command.data.name, new Collection());
  }
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.data.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
    if (now < expiration) {
      const remaining = ((expiration - now) / 1000).toFixed(1);
      return interaction.reply({ 
        content: `⏳ Attends encore **${remaining}s** avant de relancer \`/${command.data.name}\`.`, 
        ephemeral: true // Seul l'utilisateur voit ce message d'erreur !
      });
    }
  }
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  // Exécution de la commande
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Une erreur est survenue lors de l\'exécution.', ephemeral: true }).catch(() => null);
    } else {
      await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true }).catch(() => null);
    }
  }
});

module.exports = { client };

// Connexion à Discord
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('❌ Connexion impossible : DISCORD_TOKEN vide.');
  process.exit(1);
}
client.login(TOKEN).catch(err => console.error('💥 Erreur login :', err.message));

// Sécurités anti-crash
process.on('unhandledRejection', (error) => console.error('⚠️ Erreur bloquée :', error.message));
process.on('uncaughtException', (error) => console.error('💥 Crash évité :', error.message));
