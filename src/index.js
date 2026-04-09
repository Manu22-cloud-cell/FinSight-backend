require("dotenv").config();
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

connectDB();

const setupRepeatableJobs = require("./queues/scheduler");

setupRepeatableJobs();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

server.listen(PORT, () => {
  console.log("Server running on port 3000");
});





