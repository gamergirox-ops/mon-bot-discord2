# 🎮 Bot Discord Mini-Jeux

Bot Discord avec **6 mini-jeux** et un **classement live** mis à jour en temps réel.

---

## 🚀 Installation

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18 ou supérieur
- Un bot Discord créé sur [discord.com/developers](https://discord.com/developers/applications)

### 2. Cloner / télécharger le projet

```bash
cd discord-bot
npm install
```

### 3. Configurer le token

Crée un fichier `.env` à la racine :

```
DISCORD_TOKEN=TON_TOKEN_ICI
```

> Ton token se trouve sur le [Discord Developer Portal](https://discord.com/developers/applications) → ton application → **Bot** → **Reset Token**

### 4. Permissions du bot

Sur le Developer Portal, dans **OAuth2 → URL Generator**, coche :
- ✅ `bot`
- ✅ `applications.commands`

Permissions bot nécessaires :
- ✅ Read Messages / View Channels
- ✅ Send Messages
- ✅ Manage Messages *(pour éditer le classement)*
- ✅ Add Reactions
- ✅ Use Slash Commands
- ✅ Embed Links

### 5. Lancer le bot

```bash
node start.js
```

---

## 🎮 Commandes

| Commande | Description |
|---|---|
| `!aide` | Menu de tous les jeux |
| `!devinombre` | Devine un nombre entre 1 et 100 |
| `!reaction` | Clique le plus vite sur 🟢 |
| `!pierre` | Pierre-Feuille-Ciseaux vs le bot |
| `!math` | Calcul mental — réponds en premier ! |
| `!trivia` | Question de culture générale |
| `!motmele` | Retrouve le mot mélangé |
| `!classement [@utilisateur]` | Tes victoires par jeu |
| `!setclassement [#salon]` | Configure le salon classement live *(Admin)* |

---

## 📊 Classement Live

1. Va dans le salon où tu veux afficher le classement
2. Tape `!setclassement` (ou `!setclassement #nom-du-salon`)
3. Le classement s'affiche automatiquement
4. Il se **met à jour en direct** après chaque partie gagnée !

Le classement montre le **Top 5** par mini-jeu avec les médailles 🥇🥈🥉.

---

## 📁 Structure du projet

```
discord-bot/
├── index.js          # Point d'entrée principal
├── start.js          # Lanceur avec .env
├── database.js       # Stockage des scores (JSON)
├── leaderboard.js    # Mise à jour du classement live
├── data.json         # Base de données (créée automatiquement)
├── commands/
│   ├── aide.js
│   ├── devinombre.js
│   ├── reaction.js
│   ├── pierre.js
│   ├── math.js
│   ├── trivia.js
│   ├── motmele.js
│   ├── classement.js
│   └── setclassement.js
└── .env              # Token Discord (à créer)
```

---

## 🛠️ Ajouter de nouvelles questions Trivia

Dans `commands/trivia.js`, dans le tableau `QUESTIONS`, ajoute :

```js
{ q: 'Ta question ?', options: ['A', 'B', 'C', 'D'], answer: 0 }
// answer = index de la bonne réponse (0, 1, 2 ou 3)
```

---

## 🐛 Problèmes fréquents

- **"DISCORD_TOKEN manquant"** → Vérifie ton fichier `.env`
- **Le classement ne se met pas à jour** → Lance `!setclassement` dans un salon où le bot a accès
- **Erreur de permissions** → Vérifie que le bot a les permissions listées ci-dessus
