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

// Load environmental variables from .env file into process.env
dotenv.config();

// Establish MongoDB Connection using the configuration module
connectDB();

/**
 * Initialize Express application instance.
 * Serves as the core HTTP request handler and middleware router.
 */
const app = express();

/**
 * Create HTTP server instance binding the Express app.
 * Required for integrating Socket.IO since it needs a raw HTTP server to attach to.
 */
const server = http.createServer(app);

// Parse allowed origins from environment variable CLIENT_URL (comma-separated for multiple clients)
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

const corsOriginHelper = (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or is a local address
    const isAllowed = allowedOrigins.includes(origin);
    const isLocal = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    
    if (isAllowed || isLocal) {
        callback(null, true);
    } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
};

/**
 * Configure Cross-Origin Resource Sharing (CORS) options.
 * Restricts which domains can interact with this API.
 * 
 * @type {cors.CorsOptions}
 */
const corsOptions = {
    origin: corsOriginHelper,
    credentials: true, // Essential: Allows cookies/session tokens to be sent with REST requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow standard CRUD methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Whitelist headers for JSON payloads and auth tokens
};

// Apply CORS middleware globally to all routes
app.use(cors(corsOptions));

// Built-in middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// Middleware to parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser());

/**
 * Rate Limiter Configuration for Authentication endpoints.
 * Limits the number of requests to prevent brute force and DDoS attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Timeframe: 15 minutes window
    max: 100, // Maximum threshold: Limit each IP address to 100 requests per window
    message: {
        message: 'Too many requests originating from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in standard `RateLimit-*` headers
    legacyHeaders: false // Disable old legacy `X-RateLimit-*` headers
});

// Apply rate limiting exclusively to login and registration endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Mount Modular API routers for specific domain logic
app.use('/api/auth', authRoutes); // Handles registration, login, logout, validation
app.use('/api/documents', docRoutes); // Handles document CRUD and sharing

/**
 * REST Health Check Endpoint.
 * Useful for Docker/Kubernetes/Render to check if the Node service is responsive.
 * 
 * @route GET /health
 * @returns {Object} 200 - Server status, timestamp, and uptime in seconds.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

/**
 * Configure Socket.IO Real-time Server.
 * Attached to the raw HTTP server instance.
 */
const io = new Server(server, {
    cors: {
        origin: corsOriginHelper,
        methods: ['GET', 'POST'],
        credentials: true // Crucial for authenticating WebSocket connections via HTTP-only cookies
    },
    pingTimeout: 60000, // Timeout duration for client heartbeats (60 seconds)
    connectionStateRecovery: {
        // Automatically recover state (e.g., missed events) on brief connection drops
        maxDisconnectionDuration: 2 * 60 * 1000 // Buffer duration: 2 minutes
    }
});

// Bind modular socket handlers passing the global `io` instance to manage document collaboration
socketHandler(io);

/**
 * Start HTTP listener.
 * Binds the server to the specified PORT and begins accepting connections.
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[Server] Editor backend service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
