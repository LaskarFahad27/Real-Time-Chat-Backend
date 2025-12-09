const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require("http");
const { Server } = require("socket.io");

//config dotenv
dotenv.config();

//rest object
const app = express();

//middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
    credentials: true
}));
app.use(express.json());

// Initialize Passport
const passport = require('passport');
const session = require('express-session');

app.use(session({ 
    secret: process.env.SESSION_SECRET || 'laskar',
    resave: false, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

//port
const PORT = process.env.PORT || 4000;

//routes

//GET all students || GET
app.use('/api/students',require('./routes/studentRoutes'))
app.use('/api',require('./routes/authRoute'));
app.get('/test',(req,res)=>{
    res.status(200).send('Hello From Server')
})
//logout route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Error during logout" });
        }
        // Destroy the session completely
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Error destroying session" });
            }
            // Clear the session cookie
            res.clearCookie('connect.sid');
            res.status(200).send("Logged out successfully");
        });
    });
});


//----------Chat----------

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`User registered ${userId} -> ${socket.id}`);
    console.log("Current Online Users:", onlineUsers);
  });

  // Send a message to target user
  socket.on("message", ({ newMessage, targetId }) => {
    const receiverSocket = onlineUsers[targetId];

    if (receiverSocket) {
      io.to(receiverSocket).emit("received_message", newMessage);
      console.log(`Message delivered to ${targetId}`);
    } else {
      console.log("⚠ Receiver offline:", targetId);
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});