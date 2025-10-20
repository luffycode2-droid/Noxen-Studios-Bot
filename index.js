// index.js
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const OpenAI = require('openai');
const express = require('express');

// Inicializa cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// Inicializa OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Servidor web para manter bot online
const app = express();
app.get('/', (req, res) => res.send('Bot da Noxen Studios online!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor web rodando na porta ${PORT}...`));

// Evento quando bot ficar online
client.on(Events.ClientReady, () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// Responde DMs
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.channel.type === 1) { // DM
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message.content }]
      });

      const botReply = response.choices[0].message.content;
      await message.channel.send(botReply);
    } catch (err) {
      console.error('Erro ao gerar resposta:', err);
      await message.channel.send('Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
  }
});

// Login do bot
client.login(process.env.DISCORD_TOKEN);
