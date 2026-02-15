require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

/* ================== MongoDB Connection ================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

/* 🔥 IMPORTANT: increase buffer size for images/audio */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 2 * 1024 * 1024, // 2MB
});

let users = {};

/* ================== Socket Connection ================== */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ================= JOIN =================
  socket.on("join", (name) => {
    users[socket.id] = name;
    io.emit("message", `${name} joined the chat`);
  });

  // ================= SEND TEXT MESSAGE =================
  socket.on("sendMessage", (msg) => {
    io.emit("message", msg);
  });

  // ================= SEND FILE / IMAGE =================
  socket.on("sendFile", (data) => {
    if (!data || !data.sender || !data.file) return;
    io.emit("file", data);
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (name) {
      io.emit("message", `${name} left the chat`);
      delete users[socket.id];
    }
    console.log("User disconnected:", socket.id);
  });
});

/* ================== Start Server ================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});