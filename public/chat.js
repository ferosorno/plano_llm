const form = document.querySelector("#chat-form");
const promptInput = document.querySelector("#prompt");
const messagesElement = document.querySelector("#messages");
const statusElement = document.querySelector("#status");
const sendButton = document.querySelector("#send-button");

/** @type {{ role: "user" | "assistant", content: string }[]} */
const conversation = [];

function addMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  if (role === "assistant") {
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "✳";
    article.append(avatar);
  }

  const message = document.createElement("div");
  message.className = "message-content";
  // textContent avoids interpreting model output as HTML.
  message.textContent = content;
  article.append(message);
  messagesElement.append(article);
  article.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setBusy(isBusy) {
  sendButton.disabled = isBusy;
  promptInput.disabled = isBusy;
  sendButton.querySelector("span:first-child").textContent = isBusy ? "Enviando…" : "Enviar";
  statusElement.textContent = isBusy ? "El asistente está pensando…" : "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = promptInput.value.trim();
  if (!content || sendButton.disabled) return;

  conversation.push({ role: "user", content });
  addMessage("user", content);
  promptInput.value = "";
  promptInput.style.height = "auto";
  setBusy(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation.slice(-20) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "No se pudo obtener una respuesta.");

    conversation.push({ role: "assistant", content: data.reply });
    addMessage("assistant", data.reply);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de conexión. Inténtalo de nuevo.";
    addMessage("assistant", `No pude completar la solicitud: ${message}`);
  } finally {
    setBusy(false);
    promptInput.focus();
  }
});

promptInput.addEventListener("input", () => {
  promptInput.style.height = "auto";
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 180)}px`;
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});