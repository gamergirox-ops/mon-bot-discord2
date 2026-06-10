const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const { updateLeaderboard } = require('./leaderboard');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('🎮 Mini-Jeux | !aide', { type: ActivityType.Playing });

  // Initial leaderboard update after 3s (let guilds load)
  setTimeout(async () => {
    for (const [, guild] of client.guilds.cache) {
      await updateLeaderboard(client, guild.id);
    }
  }, 3000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  // Cooldown
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expiration = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expiration) {
      const remaining = ((expiration - now) / 1000).toFixed(1);
      return message.reply(`⏳ Attends encore **${remaining}s** avant de relancer \`!${command.name}\`.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply('❌ Une erreur est survenue.');
  }
});

// Export client for use in leaderboard updates
module.exports = { client };

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant dans le fichier .env');
  process.exit(1);
}
process.on('unhandledRejection'...)
client.login(TOKEN);
