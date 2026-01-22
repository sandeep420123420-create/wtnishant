const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// DEMO USERS (each user has DIFFERENT password)
const registeredUsers = {
  nishant: "123",
  aman: "456",
  rahul: "789"
};

const users = new Map();
const MAX_USERS = 6;

io.on("connection", socket => {
  console.log("Connected:", socket.id);

  socket.on("join", ({ username, password }) => {

    if (!registeredUsers[username]) {
      socket.emit("join_error", "User not found");
      return;
    }

    if (registeredUsers[username] !== password) {
      socket.emit("join_error", "Wrong password");
      return;
    }

    if (users.size >= MAX_USERS) {
      socket.emit("join_error", "Room is full");
      return;
    }

    users.set(socket.id, username);
    socket.emit("join_success");

    socket.broadcast.emit("user_joined", username);
    io.emit("users_list", Array.from(users.values()));
  });

  socket.on("message", msg => {
    const user = users.get(socket.id);
    if (!user) return;

    io.emit("message", { user, text: msg });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (!user) return;

    users.delete(socket.id);
    socket.broadcast.emit("user_left", user);
    io.emit("users_list", Array.from(users.values()));
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
