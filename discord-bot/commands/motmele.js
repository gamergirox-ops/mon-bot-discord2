// commands/motmele.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

const WORDS = [
  'DISCORD', 'VICTOIRE', 'CHAMPION', 'AVENTURE', 'CRYPTE',
  'DRAGON', 'SORCIER', 'TRÉSOR', 'FANTOME', 'MYSTÈRE',
  'CHEVALIER', 'LICORNE', 'VAMPIRE', 'ZOMBIE', 'PIRATE',
  'GALAXIE', 'PLANÈTE', 'COMÈTE', 'ÉTOILE', 'FUSÉE',
  'PYTHON', 'CLAVIER', 'ÉCRAN', 'SERVEUR', 'CONSOLE',
  'FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEY', 'NATATION',
];

function shuffle(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const shuffled = arr.join('');
  return shuffled === word ? shuffle(word) : shuffled; // re-shuffle if same
}

const activeGames = new Set();

module.exports = {
  name: 'motmele',
  description: 'Retrouve le mot mélangé',
  cooldown: 5,
  async execute(message, args, client) {
    if (activeGames.has(message.channelId)) {
      return message.reply('⚠️ Un mot mêlé est déjà en cours dans ce salon !');
    }
    activeGames.add(message.channelId);

    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const mixed = shuffle(word);
    const hint = word[0] + '_ '.repeat(word.length - 1).trim();

    const embed = new EmbedBuilder()
      .setTitle('🔤 Mot Mêlé !')
      .setColor(0xEB459E)
      .setDescription(`Reconstitue ce mot mélangé :\n\n# \`${mixed}\`\n\n💡 Indice : \`${hint}\` (${word.length} lettres)\n\n30 secondes pour répondre !`)
      .setFooter({ text: 'Le premier à trouver gagne !' });

    await message.channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && m.content.toUpperCase() === word;
    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const winner = collected.first().author;
      activeGames.delete(message.channelId);

      db.addWin(winner.id, winner.username, 'motmele');
      await updateLeaderboard(client, message.guildId);

      const win = new EmbedBuilder()
        .setTitle('🏆 Bravo !')
        .setColor(0xFFD700)
        .setDescription(`**${winner.username}** a trouvé le mot **${word}** ! +1 victoire Mot Mêlé 🏆`);
      await message.channel.send({ embeds: [win] });
    } catch {
      activeGames.delete(message.channelId);
      message.channel.send(`⏰ Temps écoulé ! Le mot était **${word}**.`);
    }
  },
};
