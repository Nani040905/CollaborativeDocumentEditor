# Part 1: Project Setup & System Architecture

Welcome to the ultimate step-by-step guide to building a production-grade, real-time **Collaborative Document Editor** using the MERN stack (MongoDB, Express, React, Node.js) and WebSockets (Socket.io). 

This guide is designed for developers who want to understand both the high-level architectural decisions and the low-level code implementation details. Every chapter is complete with production-ready, copy-pasteable code, configurations, and deep-dive explanations.

---

## 1. System Architecture Design

A real-time collaborative editor requires a distinct architectural layout compared to standard REST applications. WebSockets are utilized to bypass HTTP overhead and establish persistent two-way communication channels between clients and the server.

### System Diagram

```mermaid
graph TD
    subgraph Client [Client Side (React / Vite)]
        A[React UI Components] <-->|Zustand States| B[Zustand Stores]
        A <-->|Rich Text Inputs| C[Quill.js Editor Engine]
        B <-->|REST Calls / Cookies| D[Axios API Client]
        C <-->|Operations / Deltas| E[Socket.io Client]
    end

    subgraph Server [Backend Side (Node.js / Express)]
        F[Express Application] <-->|REST Route Handlers| G[Authentication & CRUD Controller]
        H[Socket.io Server] <-->|Rooms Management| I[Socket Event Broker]
    end

    subgraph Database [Storage Layer]
        G <-->|Mongoose ODM| J[(MongoDB Database)]
        I <-->|Autosave Worker| J
    end

    D <-->|HTTP REST / Cookies| F
    E <-->|Persistant WebSockets| H
```

### Architectural Decisions

1. **REST APIs (Express)**: Used for non-realtime, request-response cycles. This includes user register/login, document creation, document listing, fetching metadata, and deleting files.
2. **WebSocket (Socket.io)**: Used for high-frequency, bidirectional communication. Typing updates, cursor coordinate movements, and list of active users are synchronized instantly through dedicated channels.
3. **MongoDB**: Offers a schema-less structure that is ideal for storing rich-text documents (which typically store dynamic structured formats like Quill Deltas or JSON trees).
4. **Zustand**: A lightweight, fast, and scalable state-management library that avoids React context re-render performance bottlenecks, especially when handling fast-paced real-time socket actions.
5. **Quill.js**: An extensible rich-text editor engine. It represents document content as **Deltas** (a clean, standardized JSON format that lists inserts, deletes, and formatting attributes), which are perfect for granular real-time transmission and synchronization.

---

## 2. Complete Folder Structure

To keep both our services (Frontend and Backend) clean, isolated, and easy to deploy, we adopt a **Monorepo** structure. The frontend and backend live in sibling directories.

Create the following folder hierarchy in your workspace:

```text
CollaborativeDocumentEditor/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection helper
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT validation middleware
│   ├── models/
│   │   ├── User.js               # Mongoose User Model
│   │   └── Document.js           # Mongoose Document Model
│   ├── controllers/
│   │   ├── authController.js     # Auth endpoint logic
│   │   └── docController.js      # CRUD Document controllers
│   ├── routes/
│   │   ├── authRoutes.js         # Express Auth Routes
│   │   └── docRoutes.js          # Express Document REST Routes
│   ├── sockets/
│   │   └── socketHandler.js      # Real-time WebSocket connection router
│   ├── .env                      # Environment configurations (Backend)
│   ├── package.json              # Backend dependencies
│   └── server.js                 # HTTP Server & Socket initialization
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/        # File browser UI components
│   │   │   ├── Editor/           # Quill instance & presence UI
│   │   │   ├── Auth/             # Login / Register Forms
│   │   │   └── Common/           # Spinners, Modals, Headers
│   │   ├── hooks/
│   │   │   └── useSocket.js      # Custom Socket connection hook
│   │   ├── store/
│   │   │   ├── useAuthStore.js   # Zustand Auth state manager
│   │   │   └── useDocStore.js    # Zustand Document CRUD state manager
│   │   ├── App.jsx               # Navigation & routing structure
│   │   ├── index.css             # Main styling system (Tailwind imports & variables)
│   │   └── main.jsx              # React EntryPoint
│   ├── index.html
│   ├── vite.config.js            # Frontend configurations (Includes Tailwind v4 plugin)
│   └── package.json              # Frontend dependencies
│
└── docs/                         # Developer manuals and tutorials
```

---

## 3. Initial Project Bootstrapping

Follow these quick commands to set up the workspace shell:

### Step A: Initialize Backend Folder
1. Create a `backend` directory.
2. Inside the backend, create your `package.json` file. Run:
   ```bash
   cd backend
   npm init -y
   ```
3. Install standard production dependencies:
   ```bash
   npm install express mongoose socket.io cors dotenv cookie-parser jsonwebtoken bcryptjs
   ```
4. Install local development helpers:
   ```bash
   npm install --save-dev nodemon
   ```

### Step B: Initialize Frontend Folder
1. Move back to root, and generate a standard React + Vite template:
   ```bash
   cd ..
   npm create vite@latest frontend -- --template react
   ```
2. Navigate into the frontend folder and install basic dependencies:
   ```bash
   cd frontend
   npm install
   npm install socket.io-client zustand react-router lucide-react quill axios
   ```
3. Install and configure **TailwindCSS v4** (using the new native Vite integration):
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```
   Add the Tailwind v4 plugin into your `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
     ],
   })
   ```

You are now fully set up with a modern, high-performance architecture framework! In the next module, we will jump into building out the backend REST server.
