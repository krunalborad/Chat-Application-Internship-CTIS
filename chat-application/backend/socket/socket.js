const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join", (username) => {
      socket.username = username;
      io.emit("message", `${username} joined`);
    });

    socket.on("sendMessage", (msg) => {
      io.emit("message", `${socket.username}: ${msg}`);
    });
  });
}

module.exports = { initSocket };