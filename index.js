// index.js
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

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
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Servidor web (mantém o bot ativo no Render)
const app = express();
app.get("/", (req, res) => res.send("🤖 Bot da Noxen Studios online!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor web rodando na porta ${PORT}...`));

// Quando o bot estiver pronto
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// Quando o bot receber mensagem
client.on(Events.MessageCreate, async (message) => {
  // Evita responder a outros bots (inclusive ele mesmo)
  if (message.author.bot) return;

  // Só responde mensagens privadas (DM)
  if (message.channel.type === 1) {
    try {
      console.log(`💬 Mensagem recebida de ${message.author.tag}: ${message.content}`);

      // Gera resposta com OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é o assistente oficial da Noxen Studios. Responda de forma simpática, criativa e profissional." },
          { role: "user", content: message.content }
        ],
      });

      const resposta = completion.choices[0].message.content;
      console.log(`🤖 Resposta gerada: ${resposta}`);

      await message.channel.send(resposta);
    } catch (err) {
      console.error("❌ Erro ao processar mensagem:", err.message);
      // NÃO enviar mensagem de erro para o usuário → evita loop
    }
  }
});

// Login do bot
client.login(process.env.DISCORD_TOKEN);
