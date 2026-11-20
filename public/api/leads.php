<?php
declare(strict_types=1);

define('IYC_API', true);
require_once __DIR__ . '/bootstrap.php';

iyc_send_security_headers();
iyc_handle_cors_and_method(['POST']);

$clientIp = iyc_client_ip();
$ipHash = iyc_hash_ip($clientIp);

// Rate Limit atómico: 3 solicitudes cada 10 minutos
$rl = iyc_check_rate_limit('leads', $ipHash, 3, 600);
header('X-RateLimit-Limit: 3');
header("X-RateLimit-Remaining: {$rl['remaining']}");

if (!$rl['allowed']) {
    header("Retry-After: {$rl['retryAfter']}");
    http_response_code(429);
    echo json_encode([
        'ok' => false,
        'error' => "Has alcanzado el límite de solicitudes. Por favor espera {$rl['retryAfter']} segundos o contáctanos por WhatsApp.",
    ]);
    exit;
}

$input = iyc_read_json_body(65536);

// 1. Verificación de Honeypot (Trampa de Bot)
$honeypot = trim((string)($input['website_hp'] ?? ''));
if ($honeypot !== '') {
    echo json_encode([
        'ok' => true,
        'leadId' => 'IYC-2026-HP01',
        'priority' => 'STANDARD',
        'estimatedResponse' => '< 24 horas hábiles',
        'whatsappRedirectUrl' => 'https://wa.me/50266617592',
    ]);
    exit;
}

// 2. Sanitización y Validación
$nombre = iyc_sanitize_input($input['nombre'] ?? '');
$telefonoRaw = iyc_sanitize_input($input['telefono'] ?? '');
$emailRaw = iyc_sanitize_input($input['email'] ?? '');
$servicioRaw = iyc_sanitize_input($input['servicio'] ?? '');
$ubicacionRaw = iyc_sanitize_input($input['ubicacion'] ?? '');
$spaceType = mb_substr(iyc_sanitize_input($input['spaceType'] ?? ''), 0, 80);
$estimatedArea = mb_substr(iyc_sanitize_input($input['estimatedArea'] ?? ''), 0, 80);
$desiredTimeline = mb_substr(iyc_sanitize_input($input['desiredTimeline'] ?? ''), 0, 80);
$source = mb_substr(iyc_sanitize_input($input['source'] ?? 'website_quote_wizard'), 0, 60) ?: 'website_quote_wizard';
$mensajeRaw = iyc_sanitize_input($input['mensaje'] ?? '');
$m2Raw = $input['metrosCuadrados'] ?? null;

if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 80) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El nombre debe tener entre 2 y 80 caracteres.']);
    exit;
}

$cleanPhone = preg_replace('/[\s\-\(\)\.]/', '', $telefonoRaw);
if (!preg_match('/^(?:\+?502)?([2-9]\d{7})$/', (string)$cleanPhone, $phoneMatches)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Teléfono inválido. Debe ser un número de Guatemala (8 dígitos iniciando con 2-9).']);
    exit;
}
$eightDigits = $phoneMatches[1];
$formattedPhone = '+502 ' . substr($eightDigits, 0, 4) . '-' . substr($eightDigits, 4);

$email = null;
if ($emailRaw !== '') {
    if (mb_strlen($emailRaw) > 254 || !filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Dirección de correo electrónico inválida.']);
        exit;
    }
    $email = $emailRaw;
}

$serviciosValidos = [
    'Pintura Airless',
    'Impermeabilización de Losas',
    'Resinas Epóxicas',
    'Carpintería y Remodelación',
    'Mantenimiento Comercial',
    'Otro',
];
$srvLower = mb_strtolower($servicioRaw);
if (str_contains($srvLower, 'impermeab') || str_contains($srvLower, 'losa') || str_contains($srvLower, 'techo') || str_contains($srvLower, 'filtrac')) {
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

$ubLower = mb_strtolower($ubicacionRaw);
if (str_contains($ubLower, 'carretera') || str_contains($ubLower, 'salvador') || str_contains($ubLower, 'fraijanes') || str_contains($ubLower, 'santa catarina')) {
    $ubicacion = 'Carretera a El Salvador';
} elseif (str_contains($ubLower, 'mixco') || str_contains($ubLower, 'villa nueva') || str_contains($ubLower, 'cristobal')) {
    $ubicacion = 'Mixco / Villa Nueva';
} elseif (str_contains($ubLower, 'ciudad') || str_contains($ubLower, 'guatemala') || str_contains($ubLower, 'capital') || str_contains($ubLower, 'zona')) {
    $ubicacion = 'Ciudad de Guatemala';
} else {
    $ubicacion = 'Otra zona';
}

$metrosCuadrados = null;
if ($m2Raw !== null && $m2Raw !== '') {
    if (is_int($m2Raw) || is_float($m2Raw)) {
        $num = (float)$m2Raw;
        if ($num >= 0 && $num <= 1000000) {
            $metrosCuadrados = round($num, 2);
        }
    } elseif (preg_match('/(\d+(?:\.\d+)?)/', (string)$m2Raw, $m2Match)) {
        $num = (float)$m2Match[1];
        if ($num >= 0 && $num <= 1000000) {
            $metrosCuadrados = round($num, 2);
        }
    }
}

$mensaje = mb_substr($mensajeRaw, 0, 500);
$leadId = 'IYC-2026-' . strtoupper(bin2hex(random_bytes(2)));

$priority = 'STANDARD';
if (($metrosCuadrados !== null && $metrosCuadrados >= 100) ||
    $servicio === 'Impermeabilización de Losas' ||
    $servicio === 'Mantenimiento Comercial' ||
    $servicio === 'Resinas Epóxicas') {
    $priority = 'HIGH';
}

$dateObj = new DateTime('now', new DateTimeZone('America/Guatemala'));
$timestampGT = $dateObj->format('d/m/Y, h:i:s A');
$isoDate = gmdate('c');

$businessPhone = preg_replace('/[^0-9]/', '', iyc_env('WHATSAPP_TARGET_NUMBER', '50266617592'));
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
$waLines[] = '';
$waLines[] = '_Solicito asesoría técnica y cotización formal con garantía por escrito._';
$whatsappRedirectUrl = "https://wa.me/{$businessPhone}?text=" . rawurlencode(implode("\n", $waLines));

// 3. Persistencia relacional en SQLite/MySQL (fuera de public_html) + JSONL Backup
$db = iyc_get_db();
if ($db['pdo'] instanceof PDO) {
    try {
        $stmt = $db['pdo']->prepare('
            INSERT INTO leads (
                lead_id, name, phone, email, service, space_type, estimated_area,
                desired_timeline, location, metros_cuadrados, message, priority,
                status, source, ip_hash, user_agent, whatsapp_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $leadId,
            $nombre,
            $formattedPhone,
            $email,
            $servicio,
            $spaceType !== '' ? $spaceType : null,
            $estimatedArea !== '' ? $estimatedArea : null,
            $desiredTimeline !== '' ? $desiredTimeline : null,
            $ubicacion,
            $metrosCuadrados,
            $mensaje,
            $priority,
            'new',
            $source,
            $ipHash,
            mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'), 0, 250),
            $whatsappRedirectUrl,
            $isoDate,
            $isoDate,
        ]);

        $auditStmt = $db['pdo']->prepare('
            INSERT INTO audit_events (event_type, actor, target_id, detail, created_at)
            VALUES (?, ?, ?, ?, ?)
        ');
        $auditStmt->execute(['LEAD_CREATED', $ipHash, $leadId, "{$servicio} ({$ubicacion})", $isoDate]);
    } catch (Throwable $e) {
        error_log('[IYC Leads DB Insert Error] ' . $e->getMessage());
    }
}

$leadRecord = [
    'leadId' => $leadId,
    'priority' => $priority,
    'timestamp' => $isoDate,
    'timestampGT' => $timestampGT,
    'ipHash' => $ipHash,
    'data' => [
        'nombre' => $nombre,
        'telefono' => $formattedPhone,
        'email' => $email,
        'servicio' => $servicio,
        'spaceType' => $spaceType !== '' ? $spaceType : null,
        'estimatedArea' => $estimatedArea !== '' ? $estimatedArea : null,
        'desiredTimeline' => $desiredTimeline !== '' ? $desiredTimeline : null,
        'ubicacion' => $ubicacion,
        'metrosCuadrados' => $metrosCuadrados,
        'mensaje' => $mensaje,
    ],
    'whatsappRedirectUrl' => $whatsappRedirectUrl,
];

$leadsJsonl = iyc_data_dir() . '/leads.jsonl';
@file_put_contents($leadsJsonl, json_encode($leadRecord, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// 4. Envío SMTP seguro con escape HTML estricto y limpieza CRLF
function iyc_send_notification(array $lead): void {
    $smtpHost = iyc_env('HOSTINGER_SMTP_HOST', 'smtp.hostinger.com');
    $smtpPort = (int)iyc_env('HOSTINGER_SMTP_PORT', '465');
    $smtpUser = iyc_strip_crlf(iyc_env('HOSTINGER_SMTP_USER'));
    $smtpPass = iyc_env('HOSTINGER_SMTP_PASS');
    $fromName = iyc_strip_crlf(iyc_env('SMTP_FROM_NAME', 'Ideas & Colores Cotizaciones'));
    $defaultAdminEmail = 'gerencia' . '@' . 'ideasycoloresgt.com';
    $toEmail = iyc_strip_crlf(iyc_env('SMTP_NOTIFICATION_EMAIL', $defaultAdminEmail));

    if ($smtpUser === '' || $smtpPass === '') {
        return;
    }

    $data = $lead['data'];
    $safeLeadId = iyc_escape_html((string)$lead['leadId']);
    $safeTimestamp = iyc_escape_html((string)$lead['timestampGT']);
    $safeIpHash = iyc_escape_html((string)$lead['ipHash']);
    $safeName = iyc_escape_html((string)$data['nombre']);
    $safePhone = iyc_escape_html((string)$data['telefono']);
    $safeTelHref = iyc_escape_html(preg_replace('/[^0-9+]/', '', (string)$data['telefono']) ?? '');
    $safeEmail = $data['email'] ? iyc_escape_html((string)$data['email']) : '';
    $safeService = iyc_escape_html((string)$data['servicio']);
    $safeUbicacion = iyc_escape_html((string)$data['ubicacion']);
    $safeMensaje = iyc_escape_html((string)$data['mensaje']);
    $safeM2 = $data['metrosCuadrados'] !== null ? iyc_escape_html((string)$data['metrosCuadrados'] . ' m²') : 'Por definir en visita';

    $isHigh = $lead['priority'] === 'HIGH';
    $priorityLabel = $isHigh ? 'ALTA PRIORIDAD' : 'ESTÁNDAR';
    $priorityColor = $isHigh ? '#DC2626' : '#2563EB';
    $priorityBg = $isHigh ? '#FEF2F2' : '#EFF6FF';
    $priorityBorder = $isHigh ? '#F87171' : '#93C5FD';

    $cleanTargetPhone = preg_replace('/[^0-9]/', '', (string)$data['telefono']);
    $waReplyMsg = rawurlencode("Hola {$data['nombre']}, te saluda la Gerencia Técnica de Ideas & Colores respecto a tu cotización [{$lead['leadId']}] para {$data['servicio']}. Con gusto coordinamos la visita técnica.");
    $waReplyLink = iyc_escape_html("https://wa.me/{$cleanTargetPhone}?text={$waReplyMsg}");

    $emailHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nueva Cotización [{$safeLeadId}]</title></head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#F1F5F9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#FFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
        <tr>
          <td style="background:#0F172A;padding:24px 32px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:9999px;background:#1E293B;color:#38BDF8;font-size:11px;font-weight:700;text-transform:uppercase;">IDEAS &amp; COLORES MULTI-SERVICIOS</span>
            <h1 style="color:#FFF;font-size:20px;font-weight:800;margin:12px 0 4px 0;">Nueva Cotización Registrada</h1>
            <p style="color:#94A3B8;font-size:13px;margin:0;">Código: <strong style="color:#F8FAFC;font-family:monospace;">[{$safeLeadId}]</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 10px 32px;">
            <div style="background:{$priorityBg};border:1px solid {$priorityBorder};border-radius:10px;padding:12px 16px;">
              <span style="color:{$priorityColor};font-size:13px;font-weight:800;">{$priorityLabel}</span>
              <span style="float:right;color:#64748B;font-size:12px;">{$safeTimestamp}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 24px 32px;">
            <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;width:38%;">Cliente:</td><td style="font-weight:700;">{$safeName}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Teléfono:</td><td><a href="tel:{$safeTelHref}" style="color:#0284C7;font-weight:700;text-decoration:none;">{$safePhone}</a></td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Correo:</td><td>{$safeEmail}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Servicio:</td><td style="font-weight:700;">{$safeService}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Ubicación:</td><td style="font-weight:600;">{$safeUbicacion}</td></tr>
              <tr style="border-bottom:1px solid #F1F5F9;"><td style="color:#64748B;">Área Estimada:</td><td>{$safeM2}</td></tr>
              <tr><td style="color:#64748B;vertical-align:top;">Mensaje:</td><td style="line-height:1.5;">{$safeMensaje}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px 32px;text-align:center;">
            <a href="{$waReplyLink}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px 24px;background:#10B981;border-radius:12px;color:#FFF;font-size:14px;font-weight:700;text-decoration:none;">Responder al Cliente vía WhatsApp (1 Clic)</a>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;font-size:11px;color:#64748B;text-align:center;">
            Hash IP: {$safeIpHash} • Hostinger Titan Mailbox Security • Ideas &amp; Colores GT
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    $rawSubject = iyc_strip_crlf("Nueva Cotización [{$lead['leadId']}] - {$data['servicio']} ({$data['ubicacion']})");
    $replyTo = $data['email'] ? iyc_strip_crlf((string)$data['email']) : '';

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ],
    ]);

    $socket = @stream_socket_client("ssl://{$smtpHost}:{$smtpPort}", $errno, $errstr, 5, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        return;
    }

    fgets($socket, 515);
    fputs($socket, 'EHLO ' . iyc_strip_crlf($_SERVER['SERVER_NAME'] ?? 'ideasycoloresgt.site') . "\r\n");
    while ($line = fgets($socket, 515)) {
        if (substr($line, 3, 1) === ' ') break;
    }

    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($smtpUser) . "\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($smtpPass) . "\r\n");
    $authResp = (string)fgets($socket, 515);
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

    $subjectEncoded = '=?UTF-8?B?' . base64_encode($rawSubject) . '?=';
    $msg = "From: {$fromName} <{$smtpUser}>\r\n";
    $msg .= "To: <{$toEmail}>\r\n";
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $msg .= "Reply-To: <{$replyTo}>\r\n";
    }
    $msg .= "Subject: {$subjectEncoded}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $msg .= $emailHtml . "\r\n.\r\n";

    fputs($socket, $msg);
    fgets($socket, 515);
    fputs($socket, "QUIT\r\n");
    fclose($socket);
}

try {
    iyc_send_notification($leadRecord);
} catch (Throwable $e) {
    error_log('[IYC SMTP Exception] ' . $e->getMessage());
}

// 5. Webhook CRM opcional protegido contra SSRF
$crmWebhook = iyc_env('WEBHOOK_CRM_URL');
if ($crmWebhook !== '' && iyc_is_safe_webhook_url($crmWebhook)) {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($leadRecord, JSON_UNESCAPED_UNICODE),
            'timeout' => 3,
            'ignore_errors' => true,
        ],
    ]);
    @file_get_contents($crmWebhook, false, $ctx);
}

http_response_code(200);
echo json_encode([
    'ok' => true,
    'leadId' => $leadId,
    'priority' => $priority,
    'estimatedResponse' => '< 24 horas hábiles',
    'whatsappRedirectUrl' => $whatsappRedirectUrl,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
