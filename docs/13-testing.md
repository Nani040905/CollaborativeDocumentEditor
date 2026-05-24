# Part 13: Testing REST APIs & WebSockets

In this guide, you will learn how to verify your REST APIs and WebSockets. You will structure JSON payloads for API testing and write a standalone Node.js client simulator script that boots up multiple virtual editors to verify room syncing.

---

## 1. REST API Payload Checklist

To verify your HTTP REST APIs using Postman or Bruno, use the following endpoint payloads and headers.

### A. Register User Account
* **Endpoint**: `POST http://localhost:5000/api/auth/register`
* **Headers**: `Content-Type: application/json`
* **JSON Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

### B. Login User Account
* **Endpoint**: `POST http://localhost:5000/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **JSON Body**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

### C. Create Document (Requires Token Cookie)
* **Endpoint**: `POST http://localhost:5000/api/documents`
* **Headers**: `Content-Type: application/json`
* **Cookie**: `token=YOUR_JWT_STRING_HERE`
* **Response**: Returns the newly generated document object containing an `_id` string.

---

## 2. Standalone Real-Time WebSocket Testing Script

Instead of manually launching two separate browser sessions every time you tweak your WebSocket configurations, you can run a **virtual synchronization simulator script** directly in your terminal.

This script uses `socket.io-client` to boot up two virtual clients (Editor A and Editor B) connected to your local server port, joins them to the same document room, and verifies that Editor B successfully receives delta updates dispatched by Editor A.

### Creating the Simulator Script (`test-sockets.js`)
Create a temporary scratch script at `backend/test-sockets.js` and paste this code:

```javascript
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const MOCK_DOCUMENT_ID = '6543210fedcba9876543210f'; // 24-char hex MongoDB string

console.log('--- STARTING VIRTUAL COLLABORATION TESTING SIMULATOR ---');

// Client A User Profile
const userA = { id: 'user_a_123', name: 'Virtual Editor A', email: 'editorA@test.com' };
// Client B User Profile
const userB = { id: 'user_b_456', name: 'Virtual Editor B', email: 'editorB@test.com' };

// Initialize WebSocket Client A
const clientA = io(SERVER_URL, {
    transports: ['websocket'],
    autoConnect: true
});

// Initialize WebSocket Client B
const clientB = io(SERVER_URL, {
    transports: ['websocket'],
    autoConnect: true
});

let testPassed = false;

// CLIENT A LOGIC
clientA.on('connect', () => {
    console.log('[Editor A] Connected to WebSocket Server.');
    
    // Handshake: Join Document Room
    clientA.emit('join-document', { documentId: MOCK_DOCUMENT_ID, user: userA });
});

clientA.on('active-users-list', (users) => {
    console.log(`[Editor A] Received active room list. Total users active: ${users.length}`);
});

// CLIENT B LOGIC
clientB.on('connect', () => {
    console.log('[Editor B] Connected to WebSocket Server.');
    
    // Handshake: Join Document Room
    clientB.emit('join-document', { documentId: MOCK_DOCUMENT_ID, user: userB });

    // Client B waits 1 second to make sure both joined, then triggers a test send
    setTimeout(() => {
        console.log('\n[Editor A] Dispatched custom typing Delta operation...');
        
        const mockDelta = {
            ops: [
                { retain: 0 },
                { insert: 'Simulating Collaborative Typing Works!' }
            ]
        };

        clientA.emit('send-changes', mockDelta);
    }, 1200);
});

// CLIENT B WATCHES FOR INCOMING SYNC
clientB.on('receive-changes', (delta) => {
    console.log('[Editor B] Received typing update Delta from server!');
    console.log('Delta Received:', JSON.stringify(delta, null, 2));

    if (delta.ops[1].insert === 'Simulating Collaborative Typing Works!') {
        console.log('\n=======================================');
        console.log(' SUCCESS: Real-Time Sync Validation Passed!');
        console.log('=======================================');
        testPassed = true;
    }

    // Shut down virtual instances cleanly
    shutdown();
});

function shutdown() {
    clientA.disconnect();
    clientB.disconnect();
    console.log('\nVirtual testing instances terminated.');
    process.exit(testPassed ? 0 : 1);
}

// Timeout backup shutdown if server does not respond
setTimeout(() => {
    if (!testPassed) {
        console.log('\n=======================================');
        console.log(' FAILURE: Test Timeout. Websockets syncing failed.');
        console.log('=======================================');
        shutdown();
    }
}, 5000);
```

### Running the Simulator
1. Ensure your local backend server is running (`npm run dev`).
2. Run this test script inside your backend directory:
   ```bash
   node test-sockets.js
   ```
3. If everything is configured correctly, your console will print:
   ```text
   [Editor A] Connected to WebSocket Server.
   [Editor B] Connected to WebSocket Server.
   
   [Editor A] Dispatched custom typing Delta operation...
   [Editor B] Received typing update Delta from server!
   
   =======================================
    SUCCESS: Real-Time Sync Validation Passed!
   =======================================
   ```

Your backend routing pipelines are now verified. In the next guide, we will look at how to deploy our project to the cloud for production environments.
