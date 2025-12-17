const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// 🔥 CONNECT SOCKET FILE
require("./sockets/chatSocket")(io);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
