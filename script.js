const form = document.querySelector("#chatForm");
const input = document.querySelector("#userInput");
const sendButton = document.querySelector("#sendButton");
const messages = document.querySelector("#messages");
const statusPill = document.querySelector("#connectionStatus");
const suggestions = document.querySelectorAll(".suggestion");

function addMessage(role, text, isLoading = false) {
  const message = document.createElement("article");
  message.className = `message ${role}${isLoading ? " loading" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "TA";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.append(avatar, bubble);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function setBusy(isBusy) {
  sendButton.disabled = isBusy;
  input.disabled = isBusy;
  sendButton.textContent = isBusy ? "Sending" : "Send";
}

async function sendMessage(text) {
  const message = text.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";
  setBusy(true);

  const loadingMessage = addMessage("assistant", "Checking the live card sheet...", true);
  const loadingBubble = loadingMessage.querySelector(".bubble");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "The chat service is not available right now.");
    }

    loadingMessage.classList.remove("loading");
    loadingBubble.textContent = data.reply;
    statusPill.classList.remove("error");
    statusPill.innerHTML = "<span aria-hidden=\"true\"></span> Live sheet";
  } catch (error) {
    loadingMessage.classList.remove("loading");
    loadingBubble.textContent = `${error.message} Please try again in a moment.`;
    statusPill.classList.add("error");
    statusPill.innerHTML = "<span aria-hidden=\"true\"></span> Needs attention";
  } finally {
    setBusy(false);
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.textContent);
  });
});
