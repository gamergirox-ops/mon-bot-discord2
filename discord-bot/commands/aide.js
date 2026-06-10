// commands/aide.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'aide',
  description: 'Affiche tous les mini-jeux disponibles',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Mini-Jeux Discord — Menu')
      .setColor(0x5865F2)
      .setDescription('Bienvenue ! Voici tous les jeux disponibles.')
      .addFields(
        { name: '🔢 `!devinombre`',  value: 'Devine un nombre entre 1 et 100', inline: true },
        { name: '⚡ `!reaction`',    value: 'Clique le plus vite possible !',   inline: true },
        { name: '✊ `!pierre`',      value: 'Pierre-Feuille-Ciseaux vs le bot', inline: true },
        { name: '🧮 `!math`',        value: 'Calcul mental rapide',             inline: true },
        { name: '❓ `!trivia`',      value: 'Questions de culture générale',    inline: true },
        { name: '🔤 `!motmele`',     value: 'Reconstitue le mot mélangé',       inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: '📊 `!classement`',  value: 'Affiche ton score personnel',      inline: true },
        { name: '📺 `!setclassement #salon`', value: 'Configure le salon classement live (Admin)', inline: true },
      )
      .setFooter({ text: 'Bonne chance ! 🍀' });

    message.reply({ embeds: [embed] });
  },
};
