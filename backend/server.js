import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load environmental variables
dotenv.config();

// Establish MongoDB Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent with REST requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// REST Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Configure Socket.IO Server
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000, // Timeout for client heartbeats
    connectionStateRecovery: {
        // Automatically recover state on connection drops
        maxDisconnectionDuration: 2 * 60 * 1000 // 2 minutes
    }
});

// Temporary Socket Listener (We will modularize this in Part 8)
io.on('connection', (socket) => {
    console.log(`[Socket] A client connected. Socket ID: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected. Socket ID: ${socket.id}`);
    });
});

// Run HTTP listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[Server] Editor backend service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
