// commands/devinombre.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

const activeGames = new Map();

module.exports = {
  name: 'devinombre',
  description: 'Devine un nombre entre 1 et 100',
  cooldown: 5,
  async execute(message, args, client) {
    const userId = message.author.id;

    if (activeGames.has(userId)) {
      return message.reply('⚠️ Tu as déjà une partie en cours ! Tape un nombre pour deviner.');
    }

    const secret = Math.floor(Math.random() * 100) + 1;
    const maxTries = 7;
    activeGames.set(userId, { secret, tries: 0, maxTries });

    const embed = new EmbedBuilder()
      .setTitle('🔢 Devine le Nombre !')
      .setColor(0x57F287)
      .setDescription(`J'ai choisi un nombre entre **1 et 100**.\nTu as **${maxTries} essais**. Tape ton nombre directement dans le chat !`)
      .setFooter({ text: 'Tape "stop" pour abandonner' });

    await message.reply({ embeds: [embed] });

    const filter = m => m.author.id === userId && m.channelId === message.channelId;
    const collector = message.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async (m) => {
      const game = activeGames.get(userId);
      if (!game) return collector.stop('done');

      if (m.content.toLowerCase() === 'stop') {
        collector.stop('abandon');
        return;
      }

      const guess = parseInt(m.content);
      if (isNaN(guess) || guess < 1 || guess > 100) {
        return m.reply('❌ Tape un nombre entre 1 et 100 !');
      }

      game.tries++;

      if (guess === game.secret) {
        collector.stop('win');
        activeGames.delete(userId);
        db.addWin(userId, message.author.username, 'devinombre');
        await updateLeaderboard(client, message.guildId);
        const win = new EmbedBuilder()
          .setTitle('🎉 Bravo !')
          .setColor(0xFFD700)
          .setDescription(`Tu as trouvé **${game.secret}** en **${game.tries} essai${game.tries > 1 ? 's' : ''}** ! +1 victoire 🏆`);
        return m.reply({ embeds: [win] });
      }

      if (game.tries >= maxTries) {
        collector.stop('lose');
        activeGames.delete(userId);
        return m.reply(`💀 Perdu ! Le nombre était **${game.secret}**. Réessaie avec \`!devinombre\` !`);
      }

      const hint = guess < game.secret ? '📈 Plus grand !' : '📉 Plus petit !';
      m.reply(`${hint} — Essai ${game.tries}/${maxTries}`);
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        activeGames.delete(userId);
        message.channel.send(`⏰ ${message.author}, temps écoulé ! Le nombre était **${activeGames.get(userId)?.secret || '?'}**.`);
        activeGames.delete(userId);
      } else if (reason === 'abandon') {
        activeGames.delete(userId);
        message.channel.send(`🏳️ ${message.author} a abandonné.`);
      }
    });
  },
};
