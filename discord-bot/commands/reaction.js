// commands/reaction.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

const activeGames = new Set();

module.exports = {
  name: 'reaction',
  description: 'Clique le plus vite possible sur 🟢',
  cooldown: 8,
  async execute(message, args, client) {
    const userId = message.author.id;
    if (activeGames.has(message.channelId)) {
      return message.reply('⚠️ Un jeu de réaction est déjà en cours dans ce salon !');
    }

    activeGames.add(message.channelId);

    const embed = new EmbedBuilder()
      .setTitle('⚡ Réaction Rapide !')
      .setColor(0xFEE75C)
      .setDescription('Prépare-toi... Le feu vert va apparaître. Réagis avec 🟢 le plus vite possible !');

    const msg = await message.channel.send({ embeds: [embed] });

    const delay = Math.floor(Math.random() * 4000) + 2000; // 2-6s

    await new Promise(r => setTimeout(r, delay));

    if (!activeGames.has(message.channelId)) return; // cancelled

    const goEmbed = new EmbedBuilder()
      .setTitle('🟢 MAINTENANT !')
      .setColor(0x57F287)
      .setDescription('React avec 🟢 le plus vite possible !');

    await msg.edit({ embeds: [goEmbed] });
    await msg.react('🟢');

    const start = Date.now();

    const filter = (reaction, user) => reaction.emoji.name === '🟢' && !user.bot;
    try {
      const collected = await msg.awaitReactions({ filter, max: 1, time: 10000, errors: ['time'] });
      const winner = collected.first().users.cache.filter(u => !u.bot).first();
      const time = ((Date.now() - start) / 1000).toFixed(3);

      activeGames.delete(message.channelId);
      db.addWin(winner.id, winner.username, 'reaction');
      await updateLeaderboard(client, message.guildId);

      let rating = time < 0.3 ? '🚀 Surhumain !' : time < 0.5 ? '⚡ Fulgurant !' : time < 1 ? '💨 Rapide !' : '🐢 Peut mieux faire...';
      const winEmbed = new EmbedBuilder()
        .setTitle('🏆 Vainqueur !')
        .setColor(0xFFD700)
        .setDescription(`**${winner.username}** a réagi en **${time}s** ! ${rating}\n+1 victoire Réaction Rapide 🏆`);
      await msg.edit({ embeds: [winEmbed] });
    } catch {
      activeGames.delete(message.channelId);
      await msg.edit({ content: '⏰ Personne n\'a réagi à temps !', embeds: [] });
    }
  },
};
