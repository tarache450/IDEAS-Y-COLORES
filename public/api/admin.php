<?php
declare(strict_types=1);

define('IYC_API', true);
require_once __DIR__ . '/bootstrap.php';

iyc_send_security_headers();
iyc_handle_cors_and_method(['GET', 'POST', 'PATCH', 'DELETE'], 'Content-Type, Authorization, Accept');

$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/api/admin', PHP_URL_PATH) ?: '/api/admin';
$action = trim(str_replace(['/api/admin', '/api/admin.php'], '', $uriPath), '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ipHash = iyc_hash_ip(iyc_client_ip());

// POST /api/admin/login (Fail-Closed si no existe ADMIN_PASSWORD o ADMIN_PASSWORD_HASH en .env)
if ($action === 'login' && $method === 'POST') {
    $rl = iyc_check_rate_limit('admin_login', $ipHash, 5, 900);
    if (!$rl['allowed']) {
        header("Retry-After: {$rl['retryAfter']}");
        http_response_code(429);
        echo json_encode(['ok' => false, 'error' => 'Demasiados intentos de acceso. Espera unos minutos.']);
        exit;
    }

    $configuredHash = iyc_env('ADMIN_PASSWORD_HASH');
    $configuredPlain = iyc_env('ADMIN_PASSWORD');
    if ($configuredHash === '' && strlen($configuredPlain) < 10) {
        http_response_code(503);
        echo json_encode(['ok' => false, 'error' => 'Autenticación backend no configurada en el servidor.']);
        exit;
    }

    $body = iyc_read_json_body(16384);
    $password = is_string($body['password'] ?? null) ? $body['password'] : '';
    $valid = false;
    if ($configuredHash !== '') {
        $valid = password_verify($password, $configuredHash);
    } elseif ($configuredPlain !== '') {
        $valid = hash_equals(hash('sha256', $configuredPlain), hash('sha256', $password));
    }

    if ($password === '' || !$valid) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Credenciales inválidas.']);
        exit;
    }

    $token = iyc_sign_admin_token('admin', 28800);
    http_response_code(200);
    echo json_encode(['ok' => true, 'token' => $token, 'expiresIn' => 28800]);
    exit;
}

// Exigir Bearer Token válido para todas las rutas administrativas restantes
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
$bearerToken = str_starts_with($authHeader, 'Bearer ') ? trim(substr($authHeader, 7)) : '';
if (iyc_verify_admin_token($bearerToken) === null) {
    header('WWW-Authenticate: Bearer realm="IdeasYColoresAdmin"');
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autorizado. Se requiere token Bearer válido.']);
    exit;
}

$db = iyc_get_db();
$pdo = $db['pdo'];
if (!($pdo instanceof PDO)) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Base de datos relacional no disponible.']);
    exit;
}

$validStatuses = ['new', 'contacted', 'in_progress', 'quoted', 'won', 'lost'];

if ($action === 'stats' && $method === 'GET') {
    $rows = $pdo->query('SELECT status, budget_estimate, created_at FROM leads')->fetchAll();
    $cutoff = time() - (30 * 86400);
    $stats = [
        'total_leads' => 0,
        'new_leads' => 0,
        'contacted_leads' => 0,
        'in_progress_leads' => 0,
        'quoted_leads' => 0,
        'won_leads' => 0,
        'lost_leads' => 0,
        'leads_last_30_days' => 0,
        'total_won_revenue' => 0.0,
    ];
    foreach ($rows as $r) {
        $stats['total_leads'] += 1;
        $st = $r['status'];
        if ($st === 'new') $stats['new_leads'] += 1;
        elseif ($st === 'contacted') $stats['contacted_leads'] += 1;
        elseif ($st === 'in_progress') $stats['in_progress_leads'] += 1;
        elseif ($st === 'quoted') $stats['quoted_leads'] += 1;
        elseif ($st === 'won') {
            $stats['won_leads'] += 1;
            $stats['total_won_revenue'] += (float)($r['budget_estimate'] ?? 0);
        } elseif ($st === 'lost') $stats['lost_leads'] += 1;

        if (strtotime((string)$r['created_at']) >= $cutoff) {
            $stats['leads_last_30_days'] += 1;
        }
    }
    http_response_code(200);
    echo json_encode(['ok' => true, 'stats' => $stats]);
    exit;
}

if (($action === 'leads' || $action === '') && $method === 'GET') {
    $statusFilter = (string)($_GET['status'] ?? '');
    $search = mb_substr(iyc_sanitize_input($_GET['search'] ?? ''), 0, 80);
    $clauses = [];
    $params = [];

    if ($statusFilter !== '' && in_array($statusFilter, $validStatuses, true)) {
        $clauses[] = 'status = ?';
        $params[] = $statusFilter;
    }
    if ($search !== '') {
        $clauses[] = '(name LIKE ? OR phone LIKE ? OR service LIKE ? OR location LIKE ? OR lead_id LIKE ?)';
        $term = "%{$search}%";
        array_push($params, $term, $term, $term, $term, $term);
    }
    $where = count($clauses) > 0 ? 'WHERE ' . implode(' AND ', $clauses) : '';
    $stmt = $pdo->prepare("SELECT lead_id, name, phone, email, service, space_type, estimated_area, desired_timeline, location, metros_cuadrados, message, priority, status, budget_estimate, internal_notes, created_at, updated_at FROM leads {$where} ORDER BY created_at DESC LIMIT 250");
    $stmt->execute($params);
    http_response_code(200);
    echo json_encode(['ok' => true, 'leads' => $stmt->fetchAll()]);
    exit;
}

if ($action === 'leads' && $method === 'PATCH') {
    $body = iyc_read_json_body(32768);
    $leadId = iyc_sanitize_input($body['leadId'] ?? '');
    $status = (string)($body['status'] ?? '');
    $notes = isset($body['internalNotes']) ? mb_substr(iyc_sanitize_input($body['internalNotes']), 0, 1000) : null;

    if ($leadId === '' || !in_array($status, $validStatuses, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'leadId y status válido son requeridos.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE leads SET status = ?, internal_notes = COALESCE(?, internal_notes), updated_at = ? WHERE lead_id = ?');
    $stmt->execute([$status, $notes, gmdate('c'), $leadId]);
    $updated = $stmt->rowCount();
    http_response_code($updated > 0 ? 200 : 404);
    echo json_encode(['ok' => $updated > 0, 'updated' => $updated]);
    exit;
}

if ($action === 'leads' && $method === 'DELETE') {
    $leadId = iyc_sanitize_input($_GET['leadId'] ?? '');
    if ($leadId === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'leadId es requerido.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM leads WHERE lead_id = ?');
    $stmt->execute([$leadId]);
    $deleted = $stmt->rowCount();
    http_response_code($deleted > 0 ? 200 : 404);
    echo json_encode(['ok' => $deleted > 0, 'deleted' => $deleted]);
    exit;
}

http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'Ruta de administración no encontrada.']);
