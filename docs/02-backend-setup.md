# Part 2: Backend Setup & Server Initialization

In this guide, you will construct a modular, production-ready backend in Express using ES6 modules. We will configure an environment file, build an elegant Mongoose database connector, and bind our Socket.io server to the Node HTTP listener.

---

## 1. Backend Configuration Files

Let's configure our metadata files first to use modern ES6 import statements rather than classic `require` functions.

### Backend Package Configuration (`package.json`)
Verify or replace your `backend/package.json` with the following configuration:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Collaborative Editor Backend API Service",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.2",
    "socket.io": "^4.8.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

### Environment Settings (`.env`)
Create a `.env` file directly under the `backend/` directory to store your secure configuration tokens:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collaborative_editor
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_ultra_secure_super_long_secret_key_1337
NODE_ENV=development
```

---

## 2. Database Connection Module

We want to handle our database connectivity in an isolated helper block with clean logs so that our server starts up reliably.

### Creating Database Connector (`config/db.js`)
Create `backend/config/db.js` and paste the following Mongoose script:

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true, // Auto-build indexes in development
        });
        
        console.log(`[Database] MongoDB Connected Successfully to: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database Error] Mongoose Connection Failure: ${error.message}`);
        // Exit process with failure code
        process.exit(1);
    }
};

export default connectDB;
```

---

## 3. Main Server Bootstrap Engine

Now, let's build the primary entry point `server.js` at the root of `backend/`. This file will create the HTTP server, inject essential middleware (CORS, Express JSON parsing, Cookie parsing), connect to the database, and attach Socket.io.

### Creating Main Application (`server.js`)
Create or replace `backend/server.js` with this production-grade template:

```javascript
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

// Parse allowed origins from CLIENT_URL (comma-separated for multiple clients)
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

const corsOriginHelper = (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin);
    const isLocal = /^http:\/\/localhost(:\d+)?$/.test(origin);
    if (isAllowed || isLocal) {
        callback(null, true);
    } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
};

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
    origin: corsOriginHelper,
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
        origin: corsOriginHelper,
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
```

---

## 4. Launching the Backend Service

To spin up the service in hot-reload development mode:

1. Open your terminal at the `backend/` directory.
2. Run the developer startup script:
   ```bash
   npm run dev
   ```
3. Look at your server console. You should see outputs like:
   ```text
   [Server] Editor backend service running in development mode on port 5000
   [Database] MongoDB Connected Successfully to: 127.0.0.1
   ```

Your backend service is now fully initialized and listening for incoming REST API and WebSocket events! In the next step, we will bootstrap our beautiful frontend UI container.
