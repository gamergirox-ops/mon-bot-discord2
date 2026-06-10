// leaderboard.js — Affiche et met à jour le classement en direct
const { EmbedBuilder } = require('discord.js');
const db = require('./database');

const GAMES_INFO = {
  devinombre: { name: '🔢 Devine le Nombre', emoji: '🔢' },
  motmele:    { name: '🔤 Mot Mêlé',         emoji: '🔤' },
  reaction:   { name: '⚡ Réaction Rapide',  emoji: '⚡' },
  pierre:     { name: '✊ Pierre-Feuille-Ciseaux', emoji: '✊' },
  math:       { name: '🧮 Calcul Mental',    emoji: '🧮' },
  trivia:     { name: '❓ Trivia',            emoji: '❓' },
};

function buildLeaderboardEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('🏆 Classement des Mini-Jeux')
    .setColor(0xFFD700)
    .setFooter({ text: `Mis à jour le ${new Date().toLocaleString('fr-FR')}` })
    .setTimestamp();

  const games = db.getAllGames();

  if (games.length === 0) {
    embed.setDescription('Aucune partie jouée encore ! Lance un mini-jeu avec `!aide`.');
    return embed;
  }

  for (const gameKey of games) {
    const info = GAMES_INFO[gameKey] || { name: gameKey, emoji: '🎮' };
    const top = db.getTop5(gameKey);

    if (top.length === 0) continue;

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const lines = top.map((p, i) =>
      `${medals[i]} **${escapeMarkdown(p.username)}** — ${p.wins} victoire${p.wins > 1 ? 's' : ''}`
    );

    embed.addFields({
      name: info.name,
      value: lines.join('\n'),
      inline: true,
    });
  }

  return embed;
}

function escapeMarkdown(text) {
  return text.replace(/[_*~`|]/g, '\\$&');
}

async function updateLeaderboard(client, guildId) {
  const info = db.getLeaderboardChannel(guildId);
  if (!info) return;

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = await guild.channels.fetch(info.channelId).catch(() => null);
    if (!channel) return;

    const embed = buildLeaderboardEmbed();

    if (info.messageId) {
      // Essaie de modifier le message existant
      const msg = await channel.messages.fetch(info.messageId).catch(() => null);
      if (msg) {
        await msg.edit({ embeds: [embed] });
        return;
      }
    }

    // Crée un nouveau message si aucun n'existe
    const sent = await channel.send({ embeds: [embed] });
    db.setLeaderboardChannel(guildId, info.channelId, sent.id);
  } catch (err) {
    console.error('Erreur update leaderboard:', err.message);
  }
}

module.exports = { updateLeaderboard, buildLeaderboardEmbed };
