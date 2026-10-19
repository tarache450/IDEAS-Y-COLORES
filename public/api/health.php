<?php
declare(strict_types=1);

/**
 * Ideas & Colores Multi-Servicios - API Health Check (Orca T2-WATCHDOG)
 * Compatible con Hostinger LiteSpeed / Apache
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$rootPath = dirname(__DIR__, 2);

// Carga simple de .env si existe
function loadEnvSimple(string $filePath): array {
    $env = [];
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return $env;
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            $env[$key] = $val;
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $val;
            }
        }
    }
    return $env;
}

$loadedEnv = loadEnvSimple($rootPath . '/.env');

$smtpUser = $_ENV['HOSTINGER_SMTP_USER'] ?? getenv('HOSTINGER_SMTP_USER') ?: '';
$smtpPass = $_ENV['HOSTINGER_SMTP_PASS'] ?? getenv('HOSTINGER_SMTP_PASS') ?: '';

$envLoaded = count($loadedEnv) > 0 || !empty(getenv('HOSTINGER_SMTP_USER'));
$smtpConfigured = !empty($smtpUser) && !empty($smtpPass);

// Verificación de escritura en data/
$dataDir = $rootPath . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0750, true);
}

$storageWritable = false;
$testFile = $dataDir . '/.health_test_' . bin2hex(random_bytes(4));
if (@file_put_contents($testFile, 'ok') !== false) {
    @unlink($testFile);
    $storageWritable = true;
}

$isHealthy = $storageWritable;
$status = $isHealthy ? 'HEALTHY' : 'DEGRADED';

http_response_code($isHealthy ? 200 : 503);

$isoDate = (new DateTime('now', new DateTimeZone('UTC')))->format('c');

echo json_encode([
    'status' => $status,
    'service' => 'ideas-y-colores-backend',
    'timestamp' => $isoDate,
    'checks' => [
        'envLoaded' => $envLoaded,
        'storageWritable' => $storageWritable,
        'smtpConfigured' => $smtpConfigured,
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
