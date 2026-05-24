import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

console.log('--- STARTING VIRTUAL COLLABORATION TESTING SIMULATOR ---');

async function runTest() {
    try {
        console.log('[Setup] Registering Virtual Editor A...');
        // User A Profile
        const userA_Data = { name: 'Virtual Editor A', email: `editorA_${Date.now()}@test.com`, password: 'password123' };
        let resA = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userA_Data)
        });
        if (!resA.ok && resA.status !== 400) throw new Error('Failed to register User A');
        
        // Login A
        resA = await fetch(`${SERVER_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userA_Data.email, password: userA_Data.password })
        });
        const cookieA = resA.headers.get('set-cookie');
        const tokenA = cookieA.split(';')[0].split('=')[1];
        const userA = (await resA.json()).user;

        console.log('[Setup] Registering Virtual Editor B...');
        // User B Profile
        const userB_Data = { name: 'Virtual Editor B', email: `editorB_${Date.now()}@test.com`, password: 'password123' };
        let resB = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userB_Data)
        });
        if (!resB.ok && resB.status !== 400) throw new Error('Failed to register User B');
        
        // Login B
        resB = await fetch(`${SERVER_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userB_Data.email, password: userB_Data.password })
        });
        const cookieB = resB.headers.get('set-cookie');
        const tokenB = cookieB.split(';')[0].split('=')[1];
        const userB = (await resB.json()).user;

        console.log('[Setup] User A is creating a new Document...');
        const docRes = await fetch(`${SERVER_URL}/api/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `token=${tokenA}` },
            body: JSON.stringify({ title: 'Virtual Test Document' })
        });
        const docData = await docRes.json();
        const documentId = docData._id;

        console.log(`[Setup] Document Created. ID: ${documentId}`);

        console.log('[Setup] User A inviting User B as a collaborator...');
        await fetch(`${SERVER_URL}/api/documents/${documentId}/collaborators`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `token=${tokenA}` },
            body: JSON.stringify({ email: userB.email })
        });

        // Initialize WebSocket Client A
        const clientA = io(SERVER_URL, {
            transports: ['websocket'],
            autoConnect: true,
            extraHeaders: {
                cookie: `token=${tokenA}`
            }
        });

        // Initialize WebSocket Client B
        const clientB = io(SERVER_URL, {
            transports: ['websocket'],
            autoConnect: true,
            extraHeaders: {
                cookie: `token=${tokenB}`
            }
        });

        let testPassed = false;

        // CLIENT A LOGIC
        clientA.on('connect', () => {
            console.log('[Editor A] Connected to WebSocket Server.');
            
            // Handshake: Join Document Room
            clientA.emit('join-document', { documentId: documentId, user: userA });
        });

        clientA.on('active-users-list', (users) => {
            console.log(`[Editor A] Received active room list. Total users active: ${users.length}`);
        });

        // CLIENT B LOGIC
        clientB.on('connect', () => {
            console.log('[Editor B] Connected to WebSocket Server.');
            
            // Handshake: Join Document Room
            clientB.emit('join-document', { documentId: documentId, user: userB });

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

        clientA.on('error', (err) => console.log('[Editor A] Error:', err));
        clientB.on('error', (err) => console.log('[Editor B] Error:', err));
        clientA.on('unauthorized', (msg) => console.log('[Editor A] Unauthorized:', msg));
        clientB.on('unauthorized', (msg) => console.log('[Editor B] Unauthorized:', msg));

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

    } catch (err) {
        console.error('Test Setup Failed:', err);
        process.exit(1);
    }
}

runTest();
