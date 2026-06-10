// commands/setclassement.js
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

module.exports = {
  name: 'setclassement',
  description: 'Configure le salon du classement live (Admin)',
  cooldown: 5,
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Tu as besoin de la permission **Gérer les salons** pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    db.setLeaderboardChannel(message.guildId, channel.id, null);
    await updateLeaderboard(client, message.guildId);

    const embed = new EmbedBuilder()
      .setTitle('✅ Classement configuré !')
      .setColor(0x57F287)
      .setDescription(`Le classement live sera affiché dans ${channel}.\nIl se met à jour automatiquement après chaque partie !`);

    message.reply({ embeds: [embed] });
  },
};
