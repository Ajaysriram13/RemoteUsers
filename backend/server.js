require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const startCronJobs = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://remotemessagesenderfrontend.onrender.com",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Start cron jobs
startCronJobs();

// Middleware
app.use(cors());
app.use(express.json());

const connectedUsers = {}; // userId -> socketId

io.on('connection', (socket) => {
  console.log(`[SOCKET] New client connected. Socket ID: ${socket.id}`);

  socket.on('userConnected', (userId) => {
    console.log(`[SOCKET] Received userConnected event for userId: ${userId} from socket ID: ${socket.id}`);
    // Remove any existing socket for this user (e.g., if they refreshed the page)
    for (const existingUserId in connectedUsers) {
      if (connectedUsers[existingUserId] === socket.id && existingUserId !== userId) {
        delete connectedUsers[existingUserId];
        console.log(`[SOCKET] Removed stale connection for user ${existingUserId}. Old Socket ID: ${socket.id}.`);
      }
    }
    connectedUsers[userId] = socket.id;
    console.log(`[SOCKET] User ${userId} connected. Socket ID: ${socket.id}. Total connected: ${Object.keys(connectedUsers).length}`);
    console.log('[SOCKET] Current connectedUsers map:', connectedUsers);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Disconnect event for socket ID: ${socket.id}`);
    const disconnectedUserId = Object.keys(connectedUsers).find(
      (userId) => connectedUsers[userId] === socket.id
    );
    if (disconnectedUserId) {
      delete connectedUsers[disconnectedUserId];
      console.log(`[SOCKET] User ${disconnectedUserId} disconnected. Socket ID: ${socket.id}. Total connected: ${Object.keys(connectedUsers).length}`);
      console.log('[SOCKET] Current connectedUsers map:', connectedUsers);
    } else {
      console.log(`[SOCKET] Disconnect event for unknown user. Socket ID: ${socket.id}. No matching userId found in connectedUsers.`);
    }
    console.log('[SOCKET] Client disconnected');
  });

  socket.on('userDisconnected', (userId) => {
    console.log(`[SOCKET] Received userDisconnected event for userId: ${userId} from socket ID: ${socket.id}`);
    if (connectedUsers[userId]) {
      delete connectedUsers[userId];
      console.log(`[SOCKET] User ${userId} explicitly disconnected via logout. Total connected: ${Object.keys(connectedUsers).length}`);
      console.log('[SOCKET] Current connectedUsers map:', connectedUsers);
    } else {
      console.log(`[SOCKET] userDisconnected event for userId: ${userId} but user not found in connectedUsers.`);
    }
  });
});

// Make connectedUsers and io available to controllers
app.set('connectedUsers', connectedUsers);
app.set('io', io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes(io));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));