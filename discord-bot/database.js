// database.js — stockage JSON simple (pas besoin de SQLite natif)
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ scores: {}, leaderboardChannels: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Ajoute une victoire pour un joueur sur un mini-jeu donné
function addWin(userId, username, game) {
  const data = load();
  if (!data.scores[game]) data.scores[game] = {};
  if (!data.scores[game][userId]) data.scores[game][userId] = { username, wins: 0 };
  data.scores[game][userId].wins++;
  data.scores[game][userId].username = username; // met à jour le pseudo
  save(data);
}

// Retourne le top 5 pour un jeu donné
function getTop5(game) {
  const data = load();
  if (!data.scores[game]) return [];
  return Object.entries(data.scores[game])
    .map(([id, v]) => ({ id, username: v.username, wins: v.wins }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5);
}

// Retourne le score d'un joueur pour un jeu
function getScore(userId, game) {
  const data = load();
  if (!data.scores[game]) return 0;
  return data.scores[game][userId]?.wins || 0;
}

// Tous les jeux connus
function getAllGames() {
  const data = load();
  return Object.keys(data.scores);
}

// Enregistre le salon classement
function setLeaderboardChannel(guildId, channelId, messageId) {
  const data = load();
  data.leaderboardChannels[guildId] = { channelId, messageId };
  save(data);
}

function getLeaderboardChannel(guildId) {
  const data = load();
  return data.leaderboardChannels[guildId] || null;
}

module.exports = { addWin, getTop5, getScore, getAllGames, setLeaderboardChannel, getLeaderboardChannel };
