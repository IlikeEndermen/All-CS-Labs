<?php
// Basic configuration for the john-challenge lab site.

// In containers (Docker/CTFd) these are driven by environment variables.
// For local, non-Docker use, the defaults still work against a local MySQL.
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'john_challenge';
$dbUser = getenv('DB_USER') ?: 'website_user'; // create this user in MySQL with SELECT on john_challenge.*
$dbPass = getenv('DB_PASS') ?: 'change_me';    // change this before using in a real lab

$dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    // For the challenge we keep the error generic so players don't see details.
    http_response_code(500);
    echo 'Database connection failed.';
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
