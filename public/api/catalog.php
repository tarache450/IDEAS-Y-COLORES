<?php
declare(strict_types=1);

define('IYC_API', true);
require_once __DIR__ . '/bootstrap.php';

iyc_send_security_headers('public, max-age=300');
iyc_handle_cors_and_method(['GET', 'HEAD']);

$payload = [
    'ok' => true,
    'brand' => 'Ideas & Colores Multi-Servicios Guatemala',
    'domain' => 'https://ideasycoloresgt.site',
    'location' => 'Carretera a El Salvador Km 21.5, Fraijanes, Guatemala',
    'coverageZones' => [
        'Carretera a El Salvador',
        'Fraijanes y Santa Catarina Pinula',
        'Ciudad de Guatemala (Zonas 10, 14, 15, 16 y Zona 1)',
        'Mixco y San Cristóbal',
        'Villa Nueva y Amatitlán',
    ],
    'phone' => '+502 6661-7592',
    'whatsapp' => 'https://wa.me/50266617592',
    'divisions' => [
        ['id' => 'pintura', 'number' => '01', 'title' => 'Pintura y Recubrimientos Airless', 'warranty' => true],
        ['id' => 'impresion', 'number' => '02', 'title' => 'Impresión Digital y Rotulación', 'warranty' => true],
        ['id' => 'carpinteria', 'number' => '03', 'title' => 'Carpintería a Medida y Pérgolas', 'warranty' => true],
        ['id' => 'plomeria', 'number' => '04', 'title' => 'Plomería Técnica e Hidrosanitaria', 'warranty' => true],
        ['id' => 'resinas', 'number' => '05', 'title' => 'Resinas Epóxicas 3D e Industriales', 'warranty' => true],
        ['id' => 'instalaciones', 'number' => '06', 'title' => 'Instalaciones y Mantenimiento Locativo', 'warranty' => true],
    ],
    'endpoints' => [
        'health' => '/api/health',
        'catalog' => '/api/catalog',
        'calculate' => '/api/calculate',
        'leads' => '/api/leads',
        'admin' => '/api/admin',
    ],
];

$json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$etag = '"' . substr(hash('sha256', (string)$json), 0, 16) . '"';
header("ETag: {$etag}");

if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
    http_response_code(304);
    exit;
}

http_response_code(200);
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
    echo $json;
}
