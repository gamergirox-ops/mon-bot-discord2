// commands/pierre.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

const CHOICES = ['✊', '✋', '✌️'];
const NAMES   = { '✊': 'Pierre', '✋': 'Feuille', '✌️': 'Ciseaux' };

function getWinner(player, bot) {
  if (player === bot) return 'draw';
  if (
    (player === '✊' && bot === '✌️') ||
    (player === '✋' && bot === '✊') ||
    (player === '✌️' && bot === '✋')
  ) return 'player';
  return 'bot';
}

module.exports = {
  name: 'pierre',
  description: 'Pierre-Feuille-Ciseaux contre le bot',
  cooldown: 5,
  async execute(message, args, client) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pfc_pierre').setLabel('✊ Pierre').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('pfc_feuille').setLabel('✋ Feuille').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('pfc_ciseaux').setLabel('✌️ Ciseaux').setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setTitle('✊ Pierre-Feuille-Ciseaux')
      .setColor(0x5865F2)
      .setDescription('Choisis ton arme ! Tu as 15 secondes.');

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id && i.customId.startsWith('pfc_');
    try {
      const interaction = await msg.awaitMessageComponent({ filter, time: 15000 });

      const playerChoice = interaction.customId === 'pfc_pierre' ? '✊'
        : interaction.customId === 'pfc_feuille' ? '✋' : '✌️';
      const botChoice = CHOICES[Math.floor(Math.random() * 3)];
      const result = getWinner(playerChoice, botChoice);

      let color, title, desc;
      if (result === 'player') {
        color = 0x57F287; title = '🎉 Tu as gagné !';
        db.addWin(message.author.id, message.author.username, 'pierre');
        await updateLeaderboard(client, message.guildId);
        desc = `Tu joues **${NAMES[playerChoice]}**, le bot joue **${NAMES[botChoice]}**.\n🏆 +1 victoire PFC !`;
      } else if (result === 'bot') {
        color = 0xED4245; title = '😞 Perdu !';
        desc = `Tu joues **${NAMES[playerChoice]}**, le bot joue **${NAMES[botChoice]}**.\nMeilleure chance la prochaine fois !`;
      } else {
        color = 0xFEE75C; title = '🤝 Égalité !';
        desc = `Vous jouez tous les deux **${NAMES[playerChoice]}**. Relance !`;
      }

      const resultEmbed = new EmbedBuilder().setTitle(title).setColor(color).setDescription(desc);
      await interaction.update({ embeds: [resultEmbed], components: [] });
    } catch {
      await msg.edit({ content: '⏰ Temps écoulé !', components: [] });
    }
  },
};
