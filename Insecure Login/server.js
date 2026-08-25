const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;
const FLAG_PREFIX = process.env.FLAG || 'MaaSec{default_flag}';
const IDENTITY = process.env.IDENTITY || 'test';

// Store session data in memory
const sessions = new Map();

const COOKIE_NAME = 'session_id';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

app.use(cookieParser());
app.use(express.json());

// Username pool for random selection
const usernames = ['admin', 'sysadmin', 'root', 'webmaster', 'operator', 'devops', 'superuser', 'administrator'];

// Password components for generation
const animals = ['Cat', 'Dog', 'Bird', 'Fish', 'Lion', 'Tiger', 'Bear', 'Wolf'];
const adjectives = ['Secret', 'Super', 'Mega', 'Ultra', 'Hyper', 'Magic', 'Cyber', 'Master'];
const numbers = ['123', '456', '789', '007', '999', '2024', '2025', '2026'];
const symbols = ['!', '@', '#', '!@', '!!', '#!', '@!', '!#'];

// Generate unique credentials based on session ID
function generateCredentials(sessionId) {
    const hash = crypto.createHash('sha256').update(sessionId).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);

    const selectRandom = (arr, offset = 0) => arr[(seed + offset) % arr.length];

    const username = selectRandom(usernames, 0);
    const password = `${selectRandom(adjectives, 1)}${selectRandom(animals, 2)}${selectRandom(numbers, 3)}${selectRandom(symbols, 4)}`;

    return { username, password };
}

// Generate unique flag based on session ID
// Format: MaaSec{<16_hex_chars>_flag}
// Matches regex: MaaSec{[a-f0-9]{16}_flag}
function generateFlag(sessionId) {
    const hash = crypto.createHash('sha256').update(sessionId).digest('hex');
    const uniqueHex = hash.substring(0, 16); // First 16 hex characters

    // Format: MaaSec{<16_hex_chars>_flag}
    return `MaaSec{${uniqueHex}_flag}`;
}

// Get or create session
function getOrCreateSession(sessionId, res) {
    if (!sessionId || !sessions.has(sessionId)) {
        // Create new session with unique ID
        sessionId = crypto.randomBytes(32).toString('hex');

        const credentials = generateCredentials(sessionId);
        const flag = generateFlag(sessionId);

        sessions.set(sessionId, {
            id: sessionId,
            username: credentials.username,
            password: credentials.password,
            flag: flag,
            createdAt: Date.now()
        });

        // Set cookie
        res.cookie(COOKIE_NAME, sessionId, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            sameSite: 'lax'
        });

        console.log(`[+] New session: ${sessionId}`);
        console.log(`    Username: ${credentials.username}`);
        console.log(`    Password: ${credentials.password}`);
        console.log(`    Flag: ${flag}`);
    }

    return sessions.get(sessionId);
}

// Serve index.html
app.get('/', (req, res) => {
    const sessionId = req.cookies[COOKIE_NAME];
    const session = getOrCreateSession(sessionId, res);

    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dynamic login.js with session-specific credentials (NO FLAG!)
app.get('/login.js', (req, res) => {
    const sessionId = req.cookies[COOKIE_NAME];
    const session = getOrCreateSession(sessionId, res);

    // Generate JavaScript with hardcoded credentials for this session
    // Note: FLAG is NOT included here - it must be fetched from the server after login
    const loginScript = `const VALID_USERNAME = "${session.username}";
const VALID_PASSWORD = "${session.password}";

const form = document.getElementById("login-form");
const messageEl = document.getElementById("message");
const flagEl = document.getElementById("flag");

function showError(msg) {
    messageEl.textContent = msg;
    messageEl.style.display = "block";
    flagEl.style.display = "none";
}

async function showFlag(flag) {
    messageEl.textContent = "";
    messageEl.style.display = "none";
    flagEl.style.display = "block";
    flagEl.textContent = "Access granted. Flag: " + flag;
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showError("Both fields are required.");
        return;
    }

    const looksLikeAdmin = username.toLowerCase().startsWith(VALID_USERNAME.toLowerCase());

    if (looksLikeAdmin && password === VALID_PASSWORD) {
        // Credentials are correct! Now fetch the flag from the server
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                showFlag(data.flag);
            } else {
                showError(data.message || "Invalid username or password.");
            }
        } catch (error) {
            showError("Failed to connect to server.");
        }
    } else {
        showError("Invalid username or password.");
    }
});
`;

    res.type('application/javascript');
    res.send(loginScript);
});

// API endpoint to validate credentials and return flag
app.post('/api/login', (req, res) => {
    const sessionId = req.cookies[COOKIE_NAME];

    if (!sessionId || !sessions.has(sessionId)) {
        return res.json({
            success: false,
            message: 'Session expired. Please refresh the page.'
        });
    }

    const session = sessions.get(sessionId);
    const { username, password } = req.body;

    // Validate credentials match the session's generated credentials
    const usernameMatch = username && username.toLowerCase().startsWith(session.username.toLowerCase());
    const passwordMatch = password === session.password;

    if (usernameMatch && passwordMatch) {
        console.log(`[*] Successful login for session ${sessionId}`);
        res.json({
            success: true,
            flag: session.flag
        });
    } else {
        res.json({
            success: false,
            message: 'Invalid username or password.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        sessions: sessions.size,
        identity: IDENTITY
    });
});

// Cleanup old sessions periodically
setInterval(() => {
    const now = Date.now();

    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt > COOKIE_MAX_AGE) {
            sessions.delete(sessionId);
            console.log(`[*] Cleaned up expired session: ${sessionId}`);
        }
    }
}, 60 * 60 * 1000); // Every hour

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[*] CTF Challenge Server started`);
    console.log(`[*] Port: ${PORT}`);
    console.log(`[*] Identity: ${IDENTITY}`);
    console.log(`[*] Flag template: ${FLAG_PREFIX}`);
    console.log(`[*] Ready to accept connections!`);
});
