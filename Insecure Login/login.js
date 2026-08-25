const VALID_USERNAME = "admin";
const VALID_PASSWORD = "SuperSecretPassword123!";

const FLAG = "${FLAG}";

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

