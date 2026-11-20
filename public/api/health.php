<?php
declare(strict_types=1);

define('IYC_API', true);
require_once __DIR__ . '/bootstrap.php';

iyc_send_security_headers();
iyc_handle_cors_and_method(['GET', 'HEAD']);

$env = iyc_load_env();
$smtpUser = iyc_env('HOSTINGER_SMTP_USER');
$smtpPass = iyc_env('HOSTINGER_SMTP_PASS');
$adminConfigured = iyc_env('ADMIN_PASSWORD_HASH') !== '' || iyc_env('ADMIN_PASSWORD') !== '';

$envLoaded = count($env) > 0 || $smtpUser !== '';
$smtpConfigured = $smtpUser !== '' && $smtpPass !== '';

$dataDir = iyc_data_dir();
$storageWritable = false;
$testFile = $dataDir . '/.health_' . bin2hex(random_bytes(4));
if (@file_put_contents($testFile, 'ok') !== false) {
    @unlink($testFile);
    $storageWritable = true;
}

$db = iyc_get_db();
$databaseReady = $db['pdo'] instanceof PDO;
$leadsStored = 0;

if ($db['pdo'] instanceof PDO) {
    try {
        $stmt = $db['pdo']->query('SELECT COUNT(*) AS total FROM leads');
        $row = $stmt ? $stmt->fetch() : null;
        $leadsStored = (int)($row['total'] ?? 0);
    } catch (Throwable) {
        $leadsStored = 0;
    }
}

$isHealthy = $storageWritable && $databaseReady;
$status = $isHealthy ? 'HEALTHY' : ($storageWritable ? 'DEGRADED' : 'UNHEALTHY');

http_response_code($storageWritable ? 200 : 503);

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
    exit;
}

echo json_encode([
    'status' => $status,
    'service' => 'ideas-y-colores-backend',
    'timestamp' => gmdate('c'),
    'checks' => [
        'envLoaded' => $envLoaded,
        'storageWritable' => $storageWritable,
        'databaseReady' => $databaseReady,
        'dbDriver' => $db['driver'],
        'leadsStored' => $leadsStored,
        'rateLimiterActive' => true,
        'smtpConfigured' => $smtpConfigured,
        'adminAuthConfigured' => $adminConfigured,
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
