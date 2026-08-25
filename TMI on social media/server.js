const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// Secret key for flag generation
const FLAG_SECRET = process.env.FLAG_SECRET || 'MaaSec_CTF_Secret_2024';

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Session middleware - each visitor gets a unique session
app.use(session({
    secret: 'challenge-session-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Data pools for profile generation (matching your existing data)
const profiles = [
    { name: "Ava Rivers", handle: "coffee_coder" },
    { name: "Noah Sparks", handle: "night_shift_dev" },
    { name: "Mia Patel", handle: "bughunter_mia" },
    { name: "Leo Kim", handle: "leet_latte" },
    { name: "Sofia Cruz", handle: "secops_sofia" },
    { name: "Eli Stone", handle: "stacktrace_eli" },
    { name: "Harper Chen", handle: "harper_0day" },
    { name: "Jordan Blake", handle: "coffee_overflow" }
];

const cities = ["Portland", "Seattle", "Austin", "Toronto", "Berlin", "London"];
const cats = ["Mochi", "Luna", "Pixel", "Java", "Shadow", "Nimbus", "Pip"];
const gradYears = ["2010", "2011", "2012", "2013", "2014", "2015", "2016"];
const puncts = ["!", "?", "!!", "!!!", "?!"];

// Seeded random for deterministic generation per session
function seededRandom(seed, index) {
    const hash = crypto.createHash('sha256').update(seed + String(index)).digest('hex');
    return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}

function pickFromArray(arr, seed, index) {
    const rand = seededRandom(seed, index);
    return arr[Math.floor(rand * arr.length)];
}

// Generate unique flag in MaaSec{hex16}_flag format
function generateFlag(sessionId) {
    const hash = crypto.createHash('md5')
        .update(FLAG_SECRET + sessionId)
        .digest('hex')
        .substring(0, 16);
    return `MaaSec{${hash}_flag}`;
}

// Generate profile for session
function generateProfile(sessionId) {
    const profile = pickFromArray(profiles, sessionId, 1);
    const city = pickFromArray(cities, sessionId, 2);
    const cat = pickFromArray(cats, sessionId, 3);
    const grad = pickFromArray(gradYears, sessionId, 4);
    const punct = pickFromArray(puncts, sessionId, 5);

    return {
        name: profile.name,
        handle: profile.handle,
        city: city,
        cat: cat,
        grad: grad,
        punct: punct,
        password: city + cat + grad + punct
    };
}

// Middleware to initialize profile on first visit
app.use((req, res, next) => {
    if (!req.session.profile) {
        req.session.profile = generateProfile(req.session.id);
        req.session.flag = generateFlag(req.session.id);
    }
    next();
});

// API endpoint to get profile data (for profile.js)
app.get('/api/profile', (req, res) => {
    const p = req.session.profile;
    res.json({
        name: p.name,
        handle: p.handle,
        city: p.city,
        cat: p.cat,
        grad: p.grad,
        punct: p.punct
    });
});

// API endpoint to get login data (for login.js)
app.get('/api/login-data', (req, res) => {
    const p = req.session.profile;
    res.json({
        handle: p.handle,
        password: p.password,
        flag: req.session.flag
    });
});

// API endpoint to verify credentials
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const p = req.session.profile;

    const validUsername = username && username.toLowerCase().startsWith(p.handle.toLowerCase());
    const validPassword = password === p.password;

    if (validUsername && validPassword) {
        res.json({ success: true, flag: req.session.flag });
    } else {
        res.json({ success: false, message: "Invalid username or password." });
    }
});

// Reset session endpoint
app.get('/reset', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Challenge server running on http://localhost:${PORT}`);
    console.log('Each visitor receives a unique session with their own profile and flag');
});
