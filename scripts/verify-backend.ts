import { leadPayloadSchema, normalizeGuatemalaPhone, checkIpRateLimit } from '../src/server/validators/leadSchema';
import { generateLeadId, classifyLeadPriority, buildWhatsAppRedirectUrl, persistLead } from '../src/server/services/leadStorage';
import fs from 'fs';

async function run() {
  console.log('--- TEST 1: Phone Normalization ---');
  const p1 = normalizeGuatemalaPhone('+502 6661 7592');
  console.log('P1 (+502 6661 7592): valid =', p1.valid, '| formatted =', p1.normalized, '| digits =', p1.digits);
  if (!p1.valid) throw new Error('Failed phone normalization');

  console.log('--- TEST 2: Zod Schema Validation & Sanitization ---');
  const parsed = leadPayloadSchema.safeParse({
    nombre: '<script>alert(1)</script>Carlos Perez',
    telefono: '502 2345 6789',
    email: 'carlos@example.com',
    servicio: 'Impermeabilización de terrazas',
    ubicacion: 'Carretera a El Salvador km 14',
    metrosCuadrados: '150.5 m2',
    mensaje: '<b>Cotización urgente</b> para losa exterior',
    website_hp: '',
  });
  console.log('Schema valid:', parsed.success);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error('Schema parse failed');
  }
  console.log('Sanitized Data:', JSON.stringify(parsed.data, null, 2));

  console.log('--- TEST 3: Lead ID & Priority ---');
  const leadId = generateLeadId();
  const idFormatValid = /^IYC-2026-[0-9A-F]{4}$/.test(leadId);
  console.log('Lead ID:', leadId, '| Matches regex:', idFormatValid);
  if (!idFormatValid) throw new Error('Invalid leadId format');

  const priority = classifyLeadPriority(parsed.data);
  console.log('Priority (should be HIGH):', priority);
  if (priority !== 'HIGH') throw new Error('Priority classification failed');

  console.log('--- TEST 4: WhatsApp URL ---');
  const waUrl = buildWhatsAppRedirectUrl(leadId, parsed.data);
  console.log('WhatsApp URL preview:', waUrl.slice(0, 70) + '...');
  if (!waUrl.startsWith('https://wa.me/50266617592')) throw new Error('Invalid WhatsApp target');

  console.log('--- TEST 5: Rate Limiter ---');
  const ip = '192.168.1.100';
  console.log('Req 1:', checkIpRateLimit(ip).allowed);
  console.log('Req 2:', checkIpRateLimit(ip).allowed);
  console.log('Req 3:', checkIpRateLimit(ip).allowed);
  const req4 = checkIpRateLimit(ip);
  console.log('Req 4 (should be false):', req4.allowed, '| retryAfterSeconds:', req4.retryAfterSeconds);
  if (req4.allowed) throw new Error('Rate limiter failed');

  console.log('--- TEST 6: Lead Persistence ---');
  const record = await persistLead(parsed.data, '127.0.0.1', 'VerificationScript');
  console.log('Persisted record leadId:', record.leadId);
  const exists = fs.existsSync('data/leads.jsonl');
  console.log('data/leads.jsonl exists:', exists);
  if (!exists) throw new Error('Leads storage file not found');

  console.log('\n========================================');
  console.log('SUCCESS: ALL BACKEND TESTS PASSED 100%');
  console.log('========================================');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
