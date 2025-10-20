const { Client, GatewayIntentBits, Partials, Events, ChannelType } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

// Inicializa o cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Channel],
});

// Inicializa OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Servidor web para manter o bot ativo (Render)
const app = express();
app.get("/", (req, res) => res.send("🤖 Bot Noxen Studios online e pronto!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor web rodando na porta ${PORT}...`));

// Armazena IDs de mensagens já respondidas para evitar duplicação
const respondedMessages = new Set();

// Evento: quando o bot fica online
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// Evento: ao receber mensagem
client.on(Events.MessageCreate, async (message) => {
  try {
    // Ignora mensagens de bots (incluindo ele mesmo)
    if (message.author.bot) return;

    // Só responde DMs
    if (message.channel.type !== ChannelType.DM) return;

    // Evita responder a mesma mensagem mais de uma vez
    if (respondedMessages.has(message.id)) return;
    respondedMessages.add(message.id);

    console.log(`💬 [DM de ${message.author.tag}] ${message.content}`);

    // Chamada OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é o assistente oficial da Noxen Studios, uma empresa criativa e moderna. Responda de forma simpática, profissional e clara.",
        },
        { role: "user", content: message.content },
      ],
    });

    const resposta = completion.choices[0].message.content.trim();
    console.log(`🤖 Resposta: ${resposta}`);

    // Envia resposta
    await message.channel.send(resposta);
  } catch (err) {
    console.error("❌ Erro ao responder:", err);
  }
});

// Login do bot
client.login(process.env.DISCORD_TOKEN);
