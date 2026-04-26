require("dotenv").config();

const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const setupRepeatableJobs = require("./queues/scheduler");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to DB
    await connectDB();
    console.log("MongoDB connected");

    //Setup jobs
    await setupRepeatableJobs();

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
        console.log("User joined room:", userId);
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); //prevents infinite PM2 restart loop
  }
};

startServer();