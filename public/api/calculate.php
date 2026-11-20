<?php
declare(strict_types=1);

define('IYC_API', true);
require_once __DIR__ . '/bootstrap.php';

iyc_send_security_headers();
iyc_handle_cors_and_method(['POST']);

$ipHash = iyc_hash_ip(iyc_client_ip());
$rl = iyc_check_rate_limit('calculate', $ipHash, 30, 600);
header('X-RateLimit-Limit: 30');
header("X-RateLimit-Remaining: {$rl['remaining']}");

if (!$rl['allowed']) {
    header("Retry-After: {$rl['retryAfter']}");
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Demasiados cálculos consecutivos. Espera un momento.']);
    exit;
}

$input = iyc_read_json_body(16384);

$areaM2 = isset($input['areaM2']) ? (float)$input['areaM2'] : 0.0;
$coats = isset($input['coats']) ? (int)$input['coats'] : 2;
$surfaceType = iyc_sanitize_input($input['surfaceType'] ?? 'liso');

if ($areaM2 < 1 || $areaM2 > 50000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El área debe estar entre 1 y 50,000 m².']);
    exit;
}

if ($coats < 1 || $coats > 4) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Las manos de aplicación deben estar entre 1 y 4.']);
    exit;
}

$profiles = [
    'liso' => [
        'coverage' => 35,
        'system' => 'Látex Arquitectónico Lavable / Satinado',
        'primer' => false,
        'notes' => 'Muro liso interior previamente sellado. Incluye margen de desperdicio del 10%.',
    ],
    'repello' => [
        'coverage' => 24,
        'system' => 'Sellador Acrílico Alcalino + Látex Alto Cubrimiento',
        'primer' => true,
        'notes' => 'Superficie porosa o repello nuevo; requiere sellador de adherencia.',
    ],
    'tablayeso' => [
        'coverage' => 30,
        'system' => 'Primer Imprimante Yeso/Drywall + Acabado Mate o Satinado',
        'primer' => true,
        'notes' => 'Sella juntas y masilla antes de aplicar acabado uniforme con sistema Airless.',
    ],
    'exterior' => [
        'coverage' => 26,
        'system' => 'Elastomérico UV Alta Resistencia / Fachadas',
        'primer' => true,
        'notes' => 'Protección climática UV e impermeable para muros exteriores.',
    ],
    'losa_impermeabilizacion' => [
        'coverage' => 12,
        'system' => 'Membrana Elastofibratada de Poliéster + Poliuretano UV',
        'primer' => true,
        'notes' => 'Rendimiento de sistema de alto espesor para sellado antifiltraciones en losa.',
    ],
    'epoxico' => [
        'coverage' => 18,
        'system' => 'Primer Epóxico 100% Sólidos + Resina Autonivelante',
        'primer' => true,
        'notes' => 'Recubrimiento industrial / comercial de alta resistencia química y abrasión.',
    ],
];

if (!isset($profiles[$surfaceType])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Tipo de superficie inválido.']);
    exit;
}

$p = $profiles[$surfaceType];
$effectiveArea = round($areaM2 * $coats * 1.1, 2);
$totalGallons = max(1, (int)ceil($effectiveArea / $p['coverage']));
$buckets5Gal = intdiv($totalGallons, 5);
$remainingGallons = $totalGallons % 5;
$primerGallons = $p['primer'] ? max(1, (int)ceil(($areaM2 * 1.05) / 38)) : 0;

http_response_code(200);
echo json_encode([
    'ok' => true,
    'estimate' => [
        'areaM2' => round($areaM2, 2),
        'coats' => $coats,
        'surfaceType' => $surfaceType,
        'recommendedSystem' => $p['system'],
        'totalGallons' => $totalGallons,
        'buckets5Gal' => $buckets5Gal,
        'remainingGallons' => $remainingGallons,
        'primerGallons' => $primerGallons,
        'presentationSummary' => "{$buckets5Gal} cubeta(s) de 5 gal + {$remainingGallons} galón(es)",
        'technicalNote' => $p['notes'],
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
