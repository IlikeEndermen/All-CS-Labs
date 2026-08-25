<?php
require __DIR__ . '/config.php';

$error = '';

// Verify LDAP-style SSHA hashes: {SSHA}Base64(SHA1(password + salt) + salt)
function verify_ssha(string $password, string $stored): bool {
    if (strpos($stored, '{SSHA}') !== 0) {
        return false;
    }

    $b64 = substr($stored, 6); // strip "{SSHA}"
    $data = base64_decode($b64, true);
    if ($data === false || strlen($data) <= 20) {
        return false;
    }

    $digest = substr($data, 0, 20); // SHA1(password + salt)
    $salt   = substr($data, 20);    // remaining bytes are the salt
    $calc   = sha1($password . $salt, true);

    return hash_equals($digest, $calc);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if ($username !== '' && $password !== '') {
        $stmt = $pdo->prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Compare submitted password with stored SSHA hash
        if ($user && verify_ssha($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    } else {
        $error = 'Please enter both username and password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>John Challenge Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #020617; border: 1px solid #1f2937; border-radius: 8px; padding: 24px 28px; width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        h1 { margin-top: 0; font-size: 1.4rem; color: #f9fafb; }
        p { font-size: 0.9rem; color: #9ca3af; }
        label { display: block; margin-top: 12px; font-size: 0.85rem; color: #e5e7eb; }
        input[type="text"], input[type="password"] { width: 100%; padding: 8px 10px; margin-top: 4px; border-radius: 4px; border: 1px solid #4b5563; background: #020617; color: #e5e7eb; }
        input[type="submit"] { margin-top: 18px; width: 100%; padding: 10px; border: none; border-radius: 4px; background: #22c55e; color: #022c22; font-weight: 600; cursor: pointer; }
        input[type="submit"]:hover { background: #16a34a; }
        .error { margin-top: 10px; color: #f97316; font-size: 0.85rem; }
        .hint { margin-top: 16px; font-size: 0.8rem; color: #6b7280; }
    </style>
</head>
<body>
<div class="card">
    <h1>John the Ripper Lab</h1>
    <p>Login with one of the users whose password you have recovered from the leaked hashes. Admin users unlock the full solution.</p>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <form method="post">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" autocomplete="username" required>

        <label for="password">Password</label>
        <input type="password" id="password" name="password" autocomplete="current-password" required>

        <input type="submit" value="Login">
    </form>

    <div class="hint">
        Hint (for students): explore the database and leaked hash list, identify the hash type, and use an offline cracker to recover passwords before attempting to log in.
    </div>
</div>
</body>
</html>
