require("dotenv").config();

const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = __dirname;
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(projectRoot, "public"), { index: false }));

app.get("/", (_request, response) => {
  response.sendFile(path.join(projectRoot, "index.html"));
});

app.post(
  "/api/chat",
  rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }),
  async (request, response) => {
    if (!client) {
      return response.status(503).json({ error: "El servidor aún no está configurado con una clave de API." });
    }

    const messages = request.body?.messages;
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) {
      return response.status(400).json({ error: "La conversación no tiene un formato válido." });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= 4000,
    );
    if (!validMessages || messages[messages.length - 1].role !== "user") {
      return response.status(400).json({ error: "Revisa el mensaje e inténtalo de nuevo." });
    }

    try {
      const result = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: "Responde en el idioma del usuario. Sé claro, útil y conciso.",
        input: messages.map(({ role, content }) => ({ role, content: content.trim() })),
        max_output_tokens: 1200,
      });

      if (!result.output_text) {
        return response.status(502).json({ error: "El modelo no devolvió una respuesta. Inténtalo de nuevo." });
      }
      return response.json({ reply: result.output_text });
    } catch (error) {
      console.error("OpenAI API request failed:", error);
      return response.status(502).json({ error: "No se pudo conectar con el modelo. Comprueba la configuración e inténtalo de nuevo." });
    }
  },
);

app.listen(port, () => {
  console.log(`Chat disponible en http://localhost:${port}`);
  if (!apiKey) console.warn("Falta OPENAI_API_KEY. Añádela al archivo .env antes de enviar mensajes.");
});