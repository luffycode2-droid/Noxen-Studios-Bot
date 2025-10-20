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

// Armazena IDs de mensagens já respondidas
const respondedMessages = new Set();

// Evento: quando o bot fica online
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  client.user.setActivity("criar jogos na Roblox 🎮", { type: 0 });
});

// Evento: ao receber mensagem
client.on(Events.MessageCreate, async (message) => {
  try {
    // Ignora mensagens de bots
    if (message.author.bot) return;

    // Apenas responde DMs
    if (message.channel.type !== ChannelType.DM) return;

    // Evita responder a mesma mensagem mais de uma vez
    if (respondedMessages.has(message.id)) return;
    respondedMessages.add(message.id);

    console.log(`💬 [DM de ${message.author.tag}] ${message.content}`);

    const msgLower = message.content.toLowerCase();

    // Resposta automática sobre o site
    if (msgLower.includes("site") || msgLower.includes("website")) {
      await message.channel.send("🌐 O site oficial da **Noxen Studios** é: https://noxenstd.wixsite.com/noxen-studios");
      return;
    }

    // IA da Noxen Studios
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é o assistente oficial da Noxen Studios.
A Noxen Studios desenvolve jogos criativos e modernos para Roblox.
O site oficial é https://noxenstd.wixsite.com/noxen-studios.
Responda sempre com simpatia e profissionalismo.
Nunca invente links diferentes deste.`,
        },
        { role: "user", content: message.content },
      ],
    });

    const resposta = completion.choices[0].message.content.trim();
    console.log(`🤖 Resposta: ${resposta}`);

    await message.channel.send(resposta);
  } catch (err) {
    console.error("❌ Erro ao responder:", err);
    await message.channel.send("⚠️ Desculpe, houve um erro ao processar sua mensagem.");
  }
});

// Login do bot
client.login(process.env.DISCORD_TOKEN);
