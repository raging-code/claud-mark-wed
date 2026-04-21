<?php
header('Content-Type: application/json');

// Database file path (auto-created)
$dbFile = __DIR__ . '/rsvp.db';
$pdo = null;

try {
    // Create or connect to SQLite database
    $pdo = new PDO("sqlite:$dbFile");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS rsvp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        attending TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Get POST data
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $attending = trim($_POST['attending'] ?? '');
    
    // Validate
    if (empty($name) || empty($email) || empty($attending)) {
        throw new Exception('Name, email, and attendance are required.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address.');
    }
    if (!in_array($attending, ['yes', 'no'])) {
        throw new Exception('Invalid attendance option.');
    }
    
    // Insert
    $stmt = $pdo->prepare("INSERT INTO rsvp (name, email, phone, message, attending) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $message, $attending]);
    
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>