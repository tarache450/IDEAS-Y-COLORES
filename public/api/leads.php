<?php
declare(strict_types=1);

/**
 * Ideas & Colores Multi-Servicios - API Gateway de Cotizaciones (PHP 8.2+ Hardened)
 * Compatible con Hostinger Shared Hosting (LiteSpeed / Apache)
 */

// Desactivar visualización de errores directos en la salida para evitar filtraciones
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// 1. Carga de variables de entorno desde .env si existe en la raíz del proyecto
function loadEnvFile(string $filePath): array {
    $env = [];
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return $env;
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
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

$rootPath = dirname(__DIR__, 2);
loadEnvFile($rootPath . '/.env');

function getEnvVar(string $key, string $default = ''): string {
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

// 2. Control Estricto de CORS y Origen (Origin Lock)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://ideasycoloresgt.site',
    'https://www.ideasycoloresgt.site',
];

$customAllowed = getEnvVar('ALLOWED_ORIGINS');
if ($customAllowed !== '') {
    foreach (explode(',', $customAllowed) as $ao) {
        $trimmed = trim($ao);
        if ($trimmed !== '') {
            $allowedOrigins[] = $trimmed;
        }
    }
}

$isLocalhost = false;
if ($origin !== '') {
    $parsedHost = parse_url($origin, PHP_URL_HOST);
    if ($parsedHost === 'localhost' || $parsedHost === '127.0.0.1') {
        $isLocalhost = true;
    }
}

$isOriginAllowed = in_array($origin, $allowedOrigins, true) || $isLocalhost;

// Si es preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($origin !== '' && $isOriginAllowed) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        header('Access-Control-Max-Age: 86400');
        http_response_code(204);
        exit;
    }
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Origin not allowed']);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido. Solo se acepta POST.']);
    exit;
}

// Validación de Origen
if ($origin !== '') {
    if (!$isOriginAllowed) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Acceso no autorizado: Origen no permitido por política CORS de Ideas & Colores.']);
        exit;
    }
    header("Access-Control-Allow-Origin: {$origin}");
}

// 3. Extracción de IP y Rate Limiter (Máx 3 envíos por cada 10 min)
function getClientIp(): string {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return trim($_SERVER['HTTP_X_REAL_IP']);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$clientIp = getClientIp();
$dataDir = $rootPath . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0750, true);
}

$rateLimitFile = $dataDir . '/rate_limit.json';
$rateWindow = 600; // 10 minutos
$maxRequests = 3;
$now = time();

$rateData = [];
if (file_exists($rateLimitFile)) {
    $content = @file_get_contents($rateLimitFile);
    if ($content) {
        $rateData = json_decode($content, true) ?: [];
    }
}

$timestamps = $rateData[$clientIp] ?? [];
$validTimestamps = array_filter($timestamps, fn($ts) => ($now - $ts) < $rateWindow);

if (count($validTimestamps) >= $maxRequests) {
    $oldest = reset($validTimestamps);
    $retryAfter = max(1, ($oldest + $rateWindow) - $now);
    header("Retry-After: {$retryAfter}");
    http_response_code(429);
    echo json_encode([
        'ok' => false,
        'error' => "Has alcanzado el límite de solicitudes. Por favor espera {$retryAfter} segundos o contáctanos por WhatsApp."
    ]);
    exit;
}

$validTimestamps[] = $now;
$rateData[$clientIp] = array_values($validTimestamps);
@file_put_contents($rateLimitFile, json_encode($rateData, JSON_PRETTY_PRINT), LOCK_EX);

// 4. Lectura de Payload
$rawInput = file_get_contents('php://input', false, null, 0, 65536);
if ($rawInput === false || strlen($rawInput) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Cuerpo de solicitud vacío.']);
    exit;
}

$input = json_decode($rawInput, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Formato JSON inválido.']);
    exit;
}

// 5. Verificación de Honeypot (Trampa de Bot)
$honeypot = trim((string)($input['website_hp'] ?? ''));
if ($honeypot !== '') {
    // Respuesta silenciosa 200 OK para confundir al bot sin registrar datos
    echo json_encode([
        'ok' => true,
        'leadId' => 'IYC-2026-HP01',
        'whatsappRedirectUrl' => 'https://wa.me/50266617592',
    ]);
    exit;
}

// 6. Sanitización y Validación de Campos
function sanitizeInput(mixed $val): string {
    if (!is_string($val)) return '';
    $val = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i', '', $val);
    $val = preg_replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i', '', $val);
    $val = strip_tags($val);
    $val = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $val);
    return trim($val);
}

$nombre = sanitizeInput($input['nombre'] ?? '');
$telefonoRaw = sanitizeInput($input['telefono'] ?? '');
$emailRaw = sanitizeInput($input['email'] ?? '');
$servicioRaw = sanitizeInput($input['servicio'] ?? '');
$ubicacionRaw = sanitizeInput($input['ubicacion'] ?? '');
$mensajeRaw = sanitizeInput($input['mensaje'] ?? '');
$m2Raw = $input['metrosCuadrados'] ?? null;

// Validación Nombre
if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 80) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El nombre debe tener entre 2 y 80 caracteres.']);
    exit;
}

// Validación Teléfono Guatemala (+502 opcional + 8 dígitos empezando con 2-9)
$cleanPhone = preg_replace('/[\s\-\(\)\.]/', '', $telefonoRaw);
if (!preg_match('/^(?:\+?502)?([2-9]\d{7})$/', $cleanPhone, $phoneMatches)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Teléfono inválido. Debe ser un número de Guatemala (8 dígitos iniciando con 2-9).']);
    exit;
}
$eightDigits = $phoneMatches[1];
$formattedPhone = '+502 ' . substr($eightDigits, 0, 4) . '-' . substr($eightDigits, 4);
$clientPhoneDigits = '502' . $eightDigits;

// Validación Email
$email = null;
if ($emailRaw !== '') {
    if (!filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Dirección de correo electrónico inválida.']);
        exit;
    }
    $email = $emailRaw;
}

// Normalización de Servicio
$serviciosValidos = [
    'Pintura Airless',
    'Impermeabilización de Losas',
    'Resinas Epóxicas',
    'Carpintería y Remodelación',
    'Mantenimiento Comercial',
    'Otro',
];

$srvLower = mb_strtolower($servicioRaw);
if (str_contains($srvLower, 'impermeab') || str_contains($srvLower, 'losa') || str_contains($srvLower, 'techo')) {
    $servicio = 'Impermeabilización de Losas';
} elseif (str_contains($srvLower, 'resina') || str_contains($srvLower, 'epóx') || str_contains($srvLower, 'epox')) {
    $servicio = 'Resinas Epóxicas';
} elseif (str_contains($srvLower, 'airless') || str_contains($srvLower, 'pintura') || str_contains($srvLower, 'recubrimiento')) {
    $servicio = 'Pintura Airless';
} elseif (str_contains($srvLower, 'carpinter') || str_contains($srvLower, 'madera') || str_contains($srvLower, 'remodelac') || str_contains($srvLower, 'pergola')) {
    $servicio = 'Carpintería y Remodelación';
} elseif (str_contains($srvLower, 'comercial') || str_contains($srvLower, 'mantenimiento') || str_contains($srvLower, 'industrial') || str_contains($srvLower, 'plomer')) {
    $servicio = 'Mantenimiento Comercial';
} else {
    $servicio = in_array($servicioRaw, $serviciosValidos, true) ? $servicioRaw : 'Otro';
}

// Normalización de Ubicación
$ubLower = mb_strtolower($ubicacionRaw);
if (str_contains($ubLower, 'carretera') || str_contains($ubLower, 'salvador') || str_contains($ubLower, 'fraijanes')) {
    $ubicacion = 'Carretera a El Salvador';
} elseif (str_contains($ubLower, 'mixco') || str_contains($ubLower, 'villa nueva') || str_contains($ubLower, 'cristobal')) {
    $ubicacion = 'Mixco / Villa Nueva';
} elseif (str_contains($ubLower, 'ciudad') || str_contains($ubLower, 'guatemala') || str_contains($ubLower, 'capital') || str_contains($ubLower, 'zona')) {
    $ubicacion = 'Ciudad de Guatemala';
} else {
    $ubicacion = 'Otra zona';
}

// Metros cuadrados
$metrosCuadrados = null;
if ($m2Raw !== null && $m2Raw !== '') {
    $num = (float)preg_replace('/[^0-9.]/', '', (string)$m2Raw);
    if ($num >= 0) {
        $metrosCuadrados = round($num, 2);
    }
}

// Mensaje escapado
$mensaje = htmlspecialchars(mb_substr($mensajeRaw, 0, 500), ENT_QUOTES, 'UTF-8');

// 7. Generación de ID Único IYC-2026-[RANDOM_4_HEX]
$leadId = 'IYC-2026-' . strtoupper(bin2hex(random_bytes(2)));

// Clasificación de Prioridad
$priority = 'STANDARD';
if (($metrosCuadrados !== null && $metrosCuadrados >= 100) ||
    $servicio === 'Impermeabilización de Losas' ||
    $servicio === 'Mantenimiento Comercial' ||
    $servicio === 'Resinas Epóxicas') {
    $priority = 'HIGH';
}

// Fecha en Hora de Guatemala (America/Guatemala)
$dateObj = new DateTime('now', new DateTimeZone('America/Guatemala'));
$timestampGT = $dateObj->format('d/m/Y, h:i:s A');
$isoDate = (new DateTime('now', new DateTimeZone('UTC')))->format('c');

// 8. Construcción de URL de Redirección WhatsApp
$businessPhone = getEnvVar('WHATSAPP_TARGET_NUMBER', '50266617592');
$waLines = [
    "*COTIZACIÓN WEB [{$leadId}]*",
    "*Cliente:* {$nombre}",
    "*Teléfono:* {$formattedPhone}",
];
if ($email) {
    $waLines[] = "*Email:* {$email}";
}
$waLines[] = "*Servicio:* {$servicio}";
$waLines[] = "*Ubicación:* {$ubicacion}";
if ($metrosCuadrados !== null) {
    $waLines[] = "*Área Estimada:* {$metrosCuadrados} m²";
}
if ($mensaje !== '') {
    $waLines[] = "*Detalle:* {$mensaje}";
}
$waLines[] = "";
$waLines[] = "_Solicito asesoría técnica y cotización formal con garantía por escrito._";

$whatsappText = implode("\n", $waLines);
$whatsappRedirectUrl = "https://wa.me/{$businessPhone}?text=" . rawurlencode($whatsappText);

// 9. Persistencia de Lead en JSONL
$leadRecord = [
    'leadId' => $leadId,
    'priority' => $priority,
    'timestamp' => $isoDate,
    'timestampGT' => $timestampGT,
    'ip' => $clientIp,
    'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'data' => [
        'nombre' => $nombre,
        'telefono' => $formattedPhone,
        'email' => $email,
        'servicio' => $servicio,
        'ubicacion' => $ubicacion,
        'metrosCuadrados' => $metrosCuadrados,
        'mensaje' => $mensaje,
    ],
    'whatsappRedirectUrl' => $whatsappRedirectUrl,
];

$leadsJsonl = $dataDir . '/leads.jsonl';
@file_put_contents($leadsJsonl, json_encode($leadRecord, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// 10. Envío de Notificación SMTP a Hostinger Titan
function sendHostingerNotification(array $lead, string $rootPath): void {
    $smtpHost = getEnvVar('HOSTINGER_SMTP_HOST', 'smtp.hostinger.com');
    $smtpPort = (int)getEnvVar('HOSTINGER_SMTP_PORT', '465');
    $smtpUser = getEnvVar('HOSTINGER_SMTP_USER', '');
    $smtpPass = getEnvVar('HOSTINGER_SMTP_PASS', '');
    $fromName = getEnvVar('SMTP_FROM_NAME', 'Ideas & Colores Cotizaciones');
    $toEmail = getEnvVar('SMTP_NOTIFICATION_EMAIL', 'gerencia@ideasycoloresgt.com');

    if ($smtpUser === '' || $smtpPass === '') {
        return; // Credenciales no configuradas todavía
    }

    $leadId = $lead['leadId'];
    $data = $lead['data'];
    $priority = $lead['priority'];
    $priorityLabel = $priority === 'HIGH' ? '🔥 ALTA PRIORIDAD' : '✅ ESTÁNDAR';
    $priorityColor = $priority === 'HIGH' ? '#DC2626' : '#2563EB';
    $priorityBg = $priority === 'HIGH' ? '#FEF2F2' : '#EFF6FF';
    $priorityBorder = $priority === 'HIGH' ? '#F87171' : '#93C5FD';

    $cleanTargetPhone = preg_replace('/[^0-9]/', '', $data['telefono']);
    $waReplyMsg = rawurlencode("Hola {$data['nombre']}, te saluda la Gerencia Técnica de Ideas & Colores respecto a tu cotización [{$leadId}] para {$data['servicio']}. Con gusto coordinamos la visita técnica.");
    $waReplyLink = "https://wa.me/{$cleanTargetPhone}?text={$waReplyMsg}";

    $emailHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nueva Cotización [{$leadId}]</title></head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#F1F5F9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#FFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
        <tr>
          <td style="background:#0F172A;padding:24px 32px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:9999px;background:#1E293B;color:#38BDF8;font-size:11px;font-weight:700;text-transform:uppercase;">IDEAS & COLORES MULTI-SERVICIOS</span>
            <h1 style="color:#FFF;font-size:20px;font-weight:800;margin:12px 0 4px 0;">🎨 Nueva Cotización Registrada</h1>
            <p style="color:#94A3B8;font-size:13px;margin:0;">Código: <strong style="color:#F8FAFC;font-family:monospace;">[{$leadId}]</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 10px 32px;">
            <div style="background:{$priorityBg};border:1px solid {$priorityBorder};border-radius:10px;padding:12px 16px;">
              <span style="color:{$priorityColor};font-size:13px;font-weight:800;">{$priorityLabel}</span>
              <span style="float:right;color:#64748B;font-size:12px;">{$lead['timestampGT']}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 24px 32px;">
            <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;width:38%;">Cliente:</td><td style="font-weight:700;">{$data['nombre']}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Teléfono:</td><td><a href="tel:{$data['telefono']}" style="color:#0284C7;font-weight:700;text-decoration:none;">{$data['telefono']}</a></td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Correo:</td><td>{$data['email']}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Servicio:</td><td style="font-weight:700;">{$data['servicio']}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Ubicación:</td><td style="font-weight:600;">{$data['ubicacion']}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Área Estimada:</td><td>{$data['metrosCuadrados']} m²</td></tr>
              <tr><td style="color:#64748B;vertical-align:top;">Mensaje:</td><td style="line-height:1.5;">{$data['mensaje']}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px 32px;text-align:center;">
            <a href="{$waReplyLink}" target="_blank" style="display:block;padding:14px 24px;background:#10B981;border-radius:12px;color:#FFF;font-size:14px;font-weight:700;text-decoration:none;">📲 Responder al Cliente vía WhatsApp (1 Clic)</a>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;font-size:11px;color:#64748B;text-align:center;">
            IP: {$lead['ip']} • Hostinger Titan Mailbox Security • Ideas & Colores GT
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    // Socket SMTP con SSL/TLS en puerto 465
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ]
    ]);

    $socket = @stream_socket_client("ssl://{$smtpHost}:{$smtpPort}", $errno, $errstr, 5, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        // Fallback a mail() de PHP si el socket directo falla
        $headers = [
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "From: {$fromName} <{$smtpUser}>",
            "Reply-To: " . ($data['email'] ?: $smtpUser),
            "X-Mailer: PHP/" . phpversion(),
        ];
        @mail($toEmail, "🎨 Nueva Cotización [{$leadId}] - {$data['servicio']} ({$data['ubicacion']})", $emailHtml, implode("\r\n", $headers));
        return;
    }

    fgets($socket, 515);
    fputs($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'ideasycoloresgt.site') . "\r\n");
    while ($line = fgets($socket, 515)) {
        if (substr($line, 3, 1) === ' ') break;
    }

    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($smtpUser) . "\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($smtpPass) . "\r\n");
    $authResp = fgets($socket, 515);
    if (!str_starts_with($authResp, '235')) {
        fclose($socket);
        return;
    }

    fputs($socket, "MAIL FROM:<{$smtpUser}>\r\n");
    fgets($socket, 515);
    fputs($socket, "RCPT TO:<{$toEmail}>\r\n");
    fgets($socket, 515);
    fputs($socket, "DATA\r\n");
    fgets($socket, 515);

    $subject = "=?UTF-8?B?" . base64_encode("🎨 Nueva Cotización [{$leadId}] - {$data['servicio']} ({$data['ubicacion']})") . "?=";
    $msg = "From: {$fromName} <{$smtpUser}>\r\n";
    $msg .= "To: <{$toEmail}>\r\n";
    if ($data['email']) {
        $msg .= "Reply-To: <{$data['email']}>\r\n";
    }
    $msg .= "Subject: {$subject}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $msg .= $emailHtml . "\r\n.\r\n";

    fputs($socket, $msg);
    fgets($socket, 515);
    fputs($socket, "QUIT\r\n");
    fclose($socket);
}

// Ejecutar envío de notificación por correo (ignora fallos sin romper la respuesta del lead)
try {
    sendHostingerNotification($leadRecord, $rootPath);
} catch (Throwable $e) {
    // Registro silencioso en log del sistema
    error_log("[SMTP Exception] {$e->getMessage()}");
}

// 11. Respuesta Exitosa JSON
http_response_code(200);
echo json_encode([
    'ok' => true,
    'leadId' => $leadId,
    'whatsappRedirectUrl' => $whatsappRedirectUrl,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
