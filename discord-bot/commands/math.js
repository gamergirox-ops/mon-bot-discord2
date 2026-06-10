// commands/math.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database');
const { updateLeaderboard } = require('../leaderboard');

function generateQuestion() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;

  if (op === '+') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 50) + 30; b = Math.floor(Math.random() * 30) + 1; answer = a - b; }
  else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; }

  return { question: `${a} ${op} ${b}`, answer };
}

const activeGames = new Set();

module.exports = {
  name: 'math',
  description: 'Calcul mental : réponds le premier !',
  cooldown: 5,
  async execute(message, args, client) {
    if (activeGames.has(message.channelId)) {
      return message.reply('⚠️ Un calcul est déjà en cours dans ce salon !');
    }

    activeGames.add(message.channelId);
    const { question, answer } = generateQuestion();

    const embed = new EmbedBuilder()
      .setTitle('🧮 Calcul Mental !')
      .setColor(0xFEE75C)
      .setDescription(`Combien font **\`${question}\`** ?\n\nLe premier qui répond juste gagne ! (30s)`);

    await message.channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && parseInt(m.content) === answer;
    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const winner = collected.first().author;
      activeGames.delete(message.channelId);

      db.addWin(winner.id, winner.username, 'math');
      await updateLeaderboard(client, message.guildId);

      const win = new EmbedBuilder()
        .setTitle('🏆 Correct !')
        .setColor(0x57F287)
        .setDescription(`**${winner.username}** a trouvé **${answer}** en premier ! +1 victoire Calcul Mental 🏆`);
      await message.channel.send({ embeds: [win] });
    } catch {
      activeGames.delete(message.channelId);
      message.channel.send(`⏰ Temps écoulé ! La réponse était **${answer}**.`);
    }
  },
};
