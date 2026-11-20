<?php
declare(strict_types=1);

if (!defined('IYC_API')) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Forbidden']);
    exit;
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

/**
 * Shared hardened core for Ideas & Colores Multi-Servicios PHP 8.2+ API.
 */
function iyc_root_path(): string {
    return dirname(__DIR__, 2);
}

function iyc_data_dir(): string {
    $dir = iyc_root_path() . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

function iyc_load_env(): array {
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }
    $env = [];
    $filePath = iyc_root_path() . '/.env';
    if (file_exists($filePath) && is_readable($filePath)) {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                continue;
            }
            $parts = explode('=', $trimmed, 2);
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
    }
    $cached = $env;
    return $env;
}

function iyc_env(string $key, string $default = ''): string {
    iyc_load_env();
    $val = $_ENV[$key] ?? getenv($key);
    return is_string($val) && $val !== '' ? $val : $default;
}

function iyc_send_security_headers(string $cacheControl = 'no-store, no-cache, must-revalidate'): void {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header("Cache-Control: {$cacheControl}");
    header('X-Robots-Tag: noindex, nofollow');
}

function iyc_is_origin_allowed(string $origin): bool {
    if ($origin === '') {
        return true;
    }
    $allowed = [
        'https://ideasycoloresgt.site',
        'https://www.ideasycoloresgt.site',
    ];
    $custom = iyc_env('ALLOWED_ORIGINS');
    if ($custom !== '') {
        foreach (explode(',', $custom) as $ao) {
            $t = trim($ao);
            if ($t !== '') {
                $allowed[] = $t;
            }
        }
    }
    if (in_array($origin, $allowed, true)) {
        return true;
    }
    $host = parse_url($origin, PHP_URL_HOST);
    return $host === 'localhost' || $host === '127.0.0.1';
}

function iyc_handle_cors_and_method(array $allowedMethods, string $allowHeaders = 'Content-Type, Accept'): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigin = iyc_is_origin_allowed($origin);

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        if ($origin !== '' && $allowedOrigin) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: ' . implode(', ', $allowedMethods) . ', OPTIONS');
            header("Access-Control-Allow-Headers: {$allowHeaders}");
            header('Access-Control-Max-Age: 86400');
            http_response_code(204);
            exit;
        }
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Origin not allowed']);
        exit;
    }

    if ($origin !== '') {
        if (!$allowedOrigin) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Acceso no autorizado: Origen no permitido por política CORS.']);
            exit;
        }
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $allowedMethods, true)) {
        http_response_code(405);
        header('Allow: ' . implode(', ', $allowedMethods));
        echo json_encode(['ok' => false, 'error' => 'Método HTTP no permitido.']);
        exit;
    }
}

function iyc_client_ip(): string {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return trim($_SERVER['HTTP_X_REAL_IP']);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

function iyc_hash_ip(string $ip): string {
    $salt = iyc_env('IP_HASH_SALT', 'iyc-gt-2026-audit-salt');
    return substr(hash_hmac('sha256', $ip, $salt), 0, 16);
}

function iyc_get_db(): array {
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $dbHost = iyc_env('DB_HOST');
    $dbName = iyc_env('DB_NAME');
    $dbUser = iyc_env('DB_USER');
    $dbPass = iyc_env('DB_PASSWORD');
    $dbPort = iyc_env('DB_PORT', '3306');

    if ($dbHost !== '' && $dbName !== '' && $dbUser !== '' && extension_loaded('pdo_mysql')) {
        try {
            $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            iyc_migrate_mysql($pdo);
            $cached = ['pdo' => $pdo, 'driver' => 'mysql'];
            return $cached;
        } catch (Throwable $e) {
            error_log('[IYC DB MySQL Error] ' . $e->getMessage());
        }
    }

    if (extension_loaded('pdo_sqlite')) {
        try {
            $dataDir = iyc_data_dir();
            $sqlitePath = $dataDir . '/ideas_y_colores.sqlite';
            $pdo = new PDO("sqlite:{$sqlitePath}", null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec('PRAGMA journal_mode = WAL');
            $pdo->exec('PRAGMA busy_timeout = 5000');
            iyc_migrate_sqlite($pdo);
            $cached = ['pdo' => $pdo, 'driver' => 'sqlite'];
            return $cached;
        } catch (Throwable $e) {
            error_log('[IYC DB SQLite Error] ' . $e->getMessage());
        }
    }

    $cached = ['pdo' => null, 'driver' => 'jsonl'];
    return $cached;
}

function iyc_migrate_sqlite(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            service TEXT NOT NULL,
            space_type TEXT,
            estimated_area TEXT,
            desired_timeline TEXT,
            location TEXT NOT NULL,
            metros_cuadrados REAL,
            message TEXT,
            priority TEXT NOT NULL DEFAULT 'STANDARD',
            status TEXT NOT NULL DEFAULT 'new',
            source TEXT NOT NULL DEFAULT 'website_quote_wizard',
            budget_estimate REAL,
            internal_notes TEXT,
            ip_hash TEXT NOT NULL,
            user_agent TEXT,
            whatsapp_url TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

        CREATE TABLE IF NOT EXISTS lead_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id TEXT NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

        CREATE TABLE IF NOT EXISTS rate_limits (
            bucket_key TEXT PRIMARY KEY,
            timestamps TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            actor TEXT NOT NULL,
            target_id TEXT,
            detail TEXT,
            created_at TEXT NOT NULL
        );
    ");
}

function iyc_migrate_mysql(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            lead_id VARCHAR(32) NOT NULL UNIQUE,
            name VARCHAR(120) NOT NULL,
            phone VARCHAR(32) NOT NULL,
            email VARCHAR(254) NULL,
            service VARCHAR(100) NOT NULL,
            space_type VARCHAR(80) NULL,
            estimated_area VARCHAR(80) NULL,
            desired_timeline VARCHAR(80) NULL,
            location VARCHAR(120) NOT NULL,
            metros_cuadrados DECIMAL(10,2) NULL,
            message TEXT NULL,
            priority VARCHAR(16) NOT NULL DEFAULT 'STANDARD',
            status VARCHAR(24) NOT NULL DEFAULT 'new',
            source VARCHAR(64) NOT NULL DEFAULT 'website_quote_wizard',
            budget_estimate DECIMAL(12,2) NULL,
            internal_notes TEXT NULL,
            ip_hash VARCHAR(64) NOT NULL,
            user_agent VARCHAR(255) NULL,
            whatsapp_url TEXT NULL,
            created_at VARCHAR(40) NOT NULL,
            updated_at VARCHAR(40) NOT NULL,
            INDEX idx_leads_status (status),
            INDEX idx_leads_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS lead_notes (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            lead_id VARCHAR(32) NOT NULL,
            author VARCHAR(120) NOT NULL,
            content TEXT NOT NULL,
            created_at VARCHAR(40) NOT NULL,
            INDEX idx_lead_notes_lead_id (lead_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            bucket_key VARCHAR(128) PRIMARY KEY,
            timestamps TEXT NOT NULL,
            updated_at BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS audit_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_type VARCHAR(48) NOT NULL,
            actor VARCHAR(120) NOT NULL,
            target_id VARCHAR(64) NULL,
            detail TEXT NULL,
            created_at VARCHAR(40) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
}

function iyc_check_rate_limit(string $bucket, string $ipHash, int $maxRequests, int $windowSeconds): array {
    $now = time();
    $bucketKey = "{$bucket}:{$ipHash}";
    $db = iyc_get_db();
    $pdo = $db['pdo'];

    if ($pdo instanceof PDO) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('SELECT timestamps FROM rate_limits WHERE bucket_key = ?');
            $stmt->execute([$bucketKey]);
            $row = $stmt->fetch();
            $raw = $row ? json_decode((string)$row['timestamps'], true) : [];
            $recent = array_values(array_filter(is_array($raw) ? $raw : [], fn($ts) => ($now - (int)$ts) < $windowSeconds));

            if (count($recent) >= $maxRequests) {
                $oldest = (int)$recent[0];
                $retryAfter = max(1, ($oldest + $windowSeconds) - $now);
                $pdo->commit();
                return ['allowed' => false, 'remaining' => 0, 'retryAfter' => $retryAfter];
            }

            $recent[] = $now;
            if ($db['driver'] === 'mysql') {
                $up = $pdo->prepare('INSERT INTO rate_limits (bucket_key, timestamps, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE timestamps = VALUES(timestamps), updated_at = VALUES(updated_at)');
            } else {
                $up = $pdo->prepare('INSERT OR REPLACE INTO rate_limits (bucket_key, timestamps, updated_at) VALUES (?, ?, ?)');
            }
            $up->execute([$bucketKey, json_encode($recent), $now]);

            if (random_int(1, 50) === 1) {
                $cutoff = $now - $windowSeconds;
                $del = $pdo->prepare('DELETE FROM rate_limits WHERE updated_at < ?');
                $del->execute([$cutoff]);
            }

            $pdo->commit();
            return ['allowed' => true, 'remaining' => max(0, $maxRequests - count($recent)), 'retryAfter' => 0];
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('[IYC RateLimit DB Error] ' . $e->getMessage());
        }
    }

    // Fallback atómico con flock
    $rlPath = iyc_data_dir() . '/rate_limit.json';
    $fp = @fopen($rlPath, 'c+');
    if (!$fp) {
        return ['allowed' => true, 'remaining' => 1, 'retryAfter' => 0];
    }
    flock($fp, LOCK_EX);
    $rawContent = stream_get_contents($fp);
    $data = $rawContent ? (json_decode($rawContent, true) ?: []) : [];
    $recent = array_values(array_filter($data[$bucketKey] ?? [], fn($ts) => ($now - (int)$ts) < $windowSeconds));

    if (count($recent) >= $maxRequests) {
        $oldest = (int)$recent[0];
        $retryAfter = max(1, ($oldest + $windowSeconds) - $now);
        flock($fp, LOCK_UN);
        fclose($fp);
        return ['allowed' => false, 'remaining' => 0, 'retryAfter' => $retryAfter];
    }

    $recent[] = $now;
    $data[$bucketKey] = $recent;
    if (count($data) > 500) {
        foreach ($data as $k => $list) {
            $valid = array_values(array_filter((array)$list, fn($ts) => ($now - (int)$ts) < $windowSeconds));
            if (count($valid) === 0) {
                unset($data[$k]);
            } else {
                $data[$k] = $valid;
            }
        }
    }

    rewind($fp);
    ftruncate($fp, 0);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return ['allowed' => true, 'remaining' => max(0, $maxRequests - count($recent)), 'retryAfter' => 0];
}

function iyc_sanitize_input(mixed $val): string {
    if (!is_string($val)) {
        return '';
    }
    $val = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i', '', $val) ?? $val;
    $val = preg_replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i', '', $val) ?? $val;
    $val = preg_replace('/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i', '', $val) ?? $val;
    $val = strip_tags($val);
    $val = preg_replace('/javascript:/i', '', $val) ?? $val;
    $val = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $val) ?? $val;
    return trim($val);
}

function iyc_escape_html(string $val): string {
    return htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function iyc_strip_crlf(string $val): string {
    return trim(str_replace(["\r", "\n", "\0"], ' ', $val));
}

function iyc_is_safe_webhook_url(string $url): bool {
    if ($url === '') {
        return false;
    }
    $parts = parse_url($url);
    if (!is_array($parts)) {
        return false;
    }
    $scheme = strtolower($parts['scheme'] ?? '');
    $host = strtolower($parts['host'] ?? '');
    if ($scheme !== 'https' || $host === '') {
        return false;
    }
    if (in_array($host, ['localhost', '127.0.0.1', '::1', '0.0.0.0'], true) ||
        str_ends_with($host, '.local') || str_ends_with($host, '.internal')) {
        return false;
    }
    $ip = filter_var($host, FILTER_VALIDATE_IP) ? $host : gethostbyname($host);
    if (filter_var($ip, FILTER_VALIDATE_IP)) {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }
    }
    return true;
}

function iyc_read_json_body(int $maxBytes = 65536): array {
    $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
    if ($contentType !== '' && !str_contains($contentType, 'application/json')) {
        http_response_code(415);
        echo json_encode(['ok' => false, 'error' => 'Tipo de contenido no soportado. Use application/json.']);
        exit;
    }
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) === 0) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Cuerpo de solicitud vacío.']);
        exit;
    }
    if (strlen($raw) > $maxBytes) {
        http_response_code(413);
        echo json_encode(['ok' => false, 'error' => 'Cuerpo de solicitud demasiado grande.']);
        exit;
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Formato JSON inválido.']);
        exit;
    }
    return $decoded;
}

function iyc_token_secret(): string {
    $envSecret = iyc_env('ADMIN_TOKEN_SECRET');
    if (strlen($envSecret) >= 32) {
        return $envSecret;
    }
    $secretFile = iyc_data_dir() . '/.api_secret';
    if (file_exists($secretFile) && is_readable($secretFile)) {
        $existing = trim((string)file_get_contents($secretFile));
        if (strlen($existing) >= 32) {
            return $existing;
        }
    }
    $generated = bin2hex(random_bytes(32));
    @file_put_contents($secretFile, $generated, LOCK_EX);
    @chmod($secretFile, 0600);
    return $generated;
}

function iyc_base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function iyc_base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function iyc_sign_admin_token(string $subject, int $ttlSeconds = 28800): string {
    $payload = iyc_base64url_encode(json_encode([
        'sub' => $subject,
        'exp' => time() + $ttlSeconds,
    ]));
    $sig = iyc_base64url_encode(hash_hmac('sha256', $payload, iyc_token_secret(), true));
    return "{$payload}.{$sig}";
}

function iyc_verify_admin_token(string $token): ?array {
    if ($token === '' || !str_contains($token, '.')) {
        return null;
    }
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) {
        return null;
    }
    [$payloadB64, $sigB64] = $parts;
    $expected = iyc_base64url_encode(hash_hmac('sha256', $payloadB64, iyc_token_secret(), true));
    if (!hash_equals($expected, $sigB64)) {
        return null;
    }
    $decoded = json_decode(iyc_base64url_decode($payloadB64), true);
    if (!is_array($decoded) || !isset($decoded['exp']) || (int)$decoded['exp'] < time()) {
        return null;
    }
    return $decoded;
}
