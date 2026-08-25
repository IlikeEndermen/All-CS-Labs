// Login page - fetches credentials from session API
// Note: This is intentionally insecure for the CTF challenge

let FLAG = "";
let VALID_USERNAME = "";
let VALID_PASSWORD = "";

const form = document.getElementById("login-form");
const messageEl = document.getElementById("message");
const flagEl = document.getElementById("flag");

function showError(msg) {
    messageEl.textContent = msg;
    messageEl.style.display = "block";
    flagEl.style.display = "none";
}

function showFlag() {
    messageEl.textContent = "";
    messageEl.style.display = "none";
    flagEl.style.display = "block";
    flagEl.textContent = "Access granted. Flag: " + FLAG;
}

// Fetch login data from session API
(async function() {
    const response = await fetch('/api/login-data');
    const data = await response.json();
    FLAG = data.flag;
    VALID_USERNAME = data.handle;
    VALID_PASSWORD = data.password;
})();

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showError("Both fields are required.");
        return;
    }

    const looksLikeAdmin = username.toLowerCase().startsWith(VALID_USERNAME.toLowerCase());

    if (looksLikeAdmin && password === VALID_PASSWORD) {
        showFlag();
    } else {
        showError("Invalid username or password.");
    }
});
