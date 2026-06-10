// commands/classement.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database');

const GAMES_INFO = {
  devinombre: '🔢 Devine le Nombre',
  motmele:    '🔤 Mot Mêlé',
  reaction:   '⚡ Réaction Rapide',
  pierre:     '✊ Pierre-Feuille-Ciseaux',
  math:       '🧮 Calcul Mental',
  trivia:     '❓ Trivia',
};

module.exports = {
  name: 'classement',
  description: 'Affiche ton score personnel',
  cooldown: 3,
  async execute(message) {
    const target = message.mentions.users.first() || message.author;
    const games = db.getAllGames();

    const embed = new EmbedBuilder()
      .setTitle(`📊 Scores de ${target.username}`)
      .setColor(0x5865F2)
      .setThumbnail(target.displayAvatarURL());

    if (games.length === 0) {
      embed.setDescription('Aucune partie jouée encore !');
    } else {
      let total = 0;
      const lines = [];
      for (const game of games) {
        const wins = db.getScore(target.id, game);
        const name = GAMES_INFO[game] || game;
        lines.push(`${name} : **${wins}** victoire${wins > 1 ? 's' : ''}`);
        total += wins;
      }
      embed.setDescription(lines.join('\n'));
      embed.setFooter({ text: `Total : ${total} victoire${total > 1 ? 's' : ''}` });
    }

    message.reply({ embeds: [embed] });
  },
};
