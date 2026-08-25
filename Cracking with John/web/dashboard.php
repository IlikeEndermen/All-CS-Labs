<?php
require __DIR__ . '/config.php';

if (empty($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$username = $_SESSION['username'] ?? 'unknown';
$role = $_SESSION['role'] ?? 'user';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; background: #020617; color: #e5e7eb; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #0b1120; border: 1px solid #1f2937; border-radius: 8px; padding: 24px 28px; width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        h1 { margin-top: 0; font-size: 1.6rem; color: #f9fafb; }
        p { font-size: 0.95rem; color: #d1d5db; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; background: #111827; border: 1px solid #4b5563; margin-left: 6px; }
        .badge-admin { background: #22c55e; border-color: #16a34a; color: #022c22; }
        .flag { margin-top: 16px; padding: 10px 12px; border-radius: 4px; background: #022c22; border: 1px dashed #16a34a; color: #bbf7d0; font-family: monospace; font-size: 0.9rem; }
        a { color: #38bdf8; text-decoration: none; font-size: 0.85rem; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
<div class="card">
    <h1>Welcome, <?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>
        <span class="badge <?= $role === 'admin' ? 'badge-admin' : '' ?>"><?= htmlspecialchars($role, ENT_QUOTES, 'UTF-8') ?></span>
    </h1>

    <?php if ($role === 'admin'): ?>
        <p>You successfully logged in as an admin user. This demonstrates that you were able to identify the hash type, crack the password for an admin account, and use it on the site.</p>
        <div class="flag">FLAG{john_the_ripper_challenge_solved}</div>
    <?php else: ?>
        <p>You logged in as a normal user. Try to recover an <strong>admin</strong> password from the leaked hashes and log in again.</p>
    <?php endif; ?>

    <p style="margin-top: 18px;"><a href="logout.php">Log out</a></p>
</div>
</body>
</html>
