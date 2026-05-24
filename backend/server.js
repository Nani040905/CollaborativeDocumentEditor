import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import docRoutes from './routes/docRoutes.js';
import socketHandler from './sockets/socketHandler.js';

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

// Limit authentication endpoints specifically to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP address to 100 requests per window
    message: {
        message: 'Too many requests originating from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false // Disable old legacy headers
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);

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

// Bind modular socket handlers
socketHandler(io);

// Run HTTP listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[Server] Editor backend service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
