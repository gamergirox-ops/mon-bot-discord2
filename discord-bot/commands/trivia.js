// commands/trivia.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

const QUESTIONS = [
  { q: 'Quelle est la capitale de l\'Australie ?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2 },
  { q: 'Combien de côtés a un hexagone ?', options: ['5', '6', '7', '8'], answer: 1 },
  { q: 'Quel est le plus grand océan du monde ?', options: ['Atlantique', 'Indien', 'Arctique', 'Pacifique'], answer: 3 },
  { q: 'En quelle année a été fondé Facebook ?', options: ['2002', '2003', '2004', '2005'], answer: 2 },
  { q: 'Qui a peint la Joconde ?', options: ['Michel-Ange', 'Raphaël', 'Léonard de Vinci', 'Botticelli'], answer: 2 },
  { q: 'Quel est le symbole chimique de l\'or ?', options: ['Ag', 'Au', 'Fe', 'Cu'], answer: 1 },
  { q: 'Combien de joueurs dans une équipe de basket (sur le terrain) ?', options: ['4', '5', '6', '7'], answer: 1 },
  { q: 'Quelle planète est surnommée la planète rouge ?', options: ['Vénus', 'Jupiter', 'Mars', 'Saturne'], answer: 2 },
  { q: 'Dans quel pays se trouve la Tour de Pise ?', options: ['France', 'Espagne', 'Grèce', 'Italie'], answer: 3 },
  { q: 'Quelle est la langue la plus parlée au monde ?', options: ['Anglais', 'Espagnol', 'Mandarin', 'Hindi'], answer: 2 },
  { q: 'Quel animal est le plus rapide sur terre ?', options: ['Lion', 'Guépard', 'Faucon', 'Antilope'], answer: 1 },
  { q: 'Combien de grammes dans un kilogramme ?', options: ['100', '500', '1000', '10000'], answer: 2 },
  { q: 'Quel est le pays le plus grand du monde en superficie ?', options: ['Canada', 'Chine', 'Russie', 'USA'], answer: 2 },
  { q: 'Qui a écrit "Les Misérables" ?', options: ['Zola', 'Balzac', 'Flaubert', 'Victor Hugo'], answer: 3 },
  { q: 'Quelle est la monnaie du Japon ?', options: ['Won', 'Yuan', 'Yen', 'Ringgit'], answer: 2 },
];

const activeGames = new Set();

module.exports = {
  name: 'trivia',
  description: 'Question de culture générale',
  cooldown: 5,
  async execute(message, args, client) {
    if (activeGames.has(message.channelId)) {
      return message.reply('⚠️ Une question est déjà en cours dans ce salon !');
    }
    activeGames.add(message.channelId);

    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    const labels = ['A', 'B', 'C', 'D'];
    const styles = [ButtonStyle.Primary, ButtonStyle.Success, ButtonStyle.Danger, ButtonStyle.Secondary];

    const row = new ActionRowBuilder().addComponents(
      q.options.map((opt, i) =>
        new ButtonBuilder()
          .setCustomId(`trivia_${i}`)
          .setLabel(`${labels[i]}. ${opt}`)
          .setStyle(styles[i])
      )
    );

    const embed = new EmbedBuilder()
      .setTitle('❓ Trivia !')
      .setColor(0x5865F2)
      .setDescription(`**${q.q}**\n\nTu as **20 secondes** !`)
      .setFooter({ text: 'Le premier à répondre correctement gagne !' });

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => !i.user.bot && i.customId.startsWith('trivia_');
    const collector = msg.createMessageComponentCollector({ filter, time: 20000 });

    let won = false;
    collector.on('collect', async (interaction) => {
      const idx = parseInt(interaction.customId.split('_')[1]);

      if (idx === q.answer) {
        won = true;
        collector.stop('win');
        db.addWin(interaction.user.id, interaction.user.username, 'trivia');
        await updateLeaderboard(client, message.guildId);

        const win = new EmbedBuilder()
          .setTitle('✅ Bonne réponse !')
          .setColor(0x57F287)
          .setDescription(`**${interaction.user.username}** a trouvé la bonne réponse : **${q.options[q.answer]}** ! +1 victoire Trivia 🏆`);
        await interaction.update({ embeds: [win], components: [] });
      } else {
        await interaction.reply({ content: `❌ Mauvaise réponse, **${interaction.user.username}** !`, ephemeral: true });
      }
    });

    collector.on('end', async (_, reason) => {
      activeGames.delete(message.channelId);
      if (!won) {
        const lose = new EmbedBuilder()
          .setTitle('⏰ Temps écoulé !')
          .setColor(0xED4245)
          .setDescription(`La bonne réponse était : **${q.options[q.answer]}**`);
        await msg.edit({ embeds: [lose], components: [] });
      }
    });
  },
};
