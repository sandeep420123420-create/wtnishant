const socket = io();

const joinContainer = document.getElementById("join-container");
const chatContainer = document.getElementById("chat-container");
const joinBtn = document.getElementById("join-btn");
const sendBtn = document.getElementById("send-btn");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("message-input");

const messagesDiv = document.getElementById("messages");
const usersDiv = document.getElementById("users");
const joinError = document.getElementById("join-error");

// JOIN
joinBtn.onclick = () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    joinError.textContent = "Username and password required";
    return;
  }

  socket.emit("join", { username, password });
};

// JOIN RESULT
socket.on("join_error", msg => {
  joinError.textContent = msg;
  alert(msg);
});

socket.on("join_success", () => {
  joinContainer.classList.add("hidden");
  chatContainer.classList.remove("hidden");
  joinError.textContent = "";
});

// SEND MESSAGE
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("message", msg);
  messageInput.value = "";
}

// RECEIVE MESSAGE
socket.on("message", data => {
  addMessage(`${data.user}: ${data.text}`);
});

// USERS
socket.on("users_list", users => {
  usersDiv.textContent = `Users (${users.length}): ${users.join(", ")}`;
});

socket.on("user_joined", name => {
  addSystemMessage(`${name} joined`);
});

socket.on("user_left", name => {
  addSystemMessage(`${name} left`);
});

// HELPERS
function addMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  messagesDiv.appendChild(div);
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.style.color = "gray";
  div.textContent = text;
  messagesDiv.appendChild(div);
}
