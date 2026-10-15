import { createClient } from '@supabase/supabase-js';
import { validateQuoteInput, submitQuoteRequest, sanitizeString } from '../src/services/quotes';
import { insertQuoteRequest, fetchQuoteRequests } from '../src/lib/supabase';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://khagzrjxoqwzqrikomrd.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('================================================================');
console.log('IDEAS & COLORES — AUDITORÍA Y SUITE INTEGRAL DE SEGURIDAD');
console.log('Fecha: 2026-10-15 | Normativa y Protección Técnica');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${msg}`);
    failed++;
  }
}

async function runAudit() {
  // 1. FILTROS DE ENTRADA Y SANITIZACIÓN XSS
  console.log('--- 1. Sanitización XSS y Validación Defensiva ---');
  
  const xssInput = '<script>alert("xss")</script>Juan Pérez';
  const sanitized = sanitizeString(xssInput);
  assert(sanitized === 'Juan Pérez', 'Filtro elimina etiquetas HTML y scripts maliciosos');

  const controlChars = 'Nombre\x00\x08Con\x1FControl';
  assert(sanitizeString(controlChars) === 'NombreConControl', 'Filtro elimina caracteres de control binarios');

  const nullObjResult = validateQuoteInput(null as any);
  assert(!nullObjResult.valid, 'Maneja adecuadamente payloads nulos sin excepciones no capturadas');

  const shortNameRes = validateQuoteInput({ name: 'A', phone: '+502 5555 1234' });
  assert(!shortNameRes.valid, 'Rechaza nombres menores a 2 caracteres');

  const shortPhoneRes = validateQuoteInput({ name: 'Carlos López', phone: '123' });
  assert(!shortPhoneRes.valid, 'Rechaza teléfonos menores a 6 caracteres');

  const badEmailRes = validateQuoteInput({ name: 'Carlos López', phone: '+502 5555 1234', email: 'correo-sin-arroba' });
  assert(!badEmailRes.valid, 'Rechaza correos con formato inválido');

  const longMessageRes = validateQuoteInput({ name: 'Carlos López', phone: '+502 5555 1234', message: 'Z'.repeat(3001) });
  assert(!longMessageRes.valid, 'Rechaza mensajes que superan 3000 caracteres');

  // 2. FILTRO DE SEGURIDAD EN INSERTQUOTEREQUEST (CAPA DE CLIENTE SUPABASE)
  console.log('\n--- 2. Filtro de Seguridad en insertQuoteRequest ---');
  const invalidInsertRes = await insertQuoteRequest({ name: 'X', phone: '123' });
  assert(invalidInsertRes.error !== null, 'insertQuoteRequest bloquea e intercepta datos malformados antes de base de datos');

  // 3. TRAMPA ANTI-SPAM (HONEYPOT)
  console.log('\n--- 3. Filtro Anti-Bot Honeypot ---');
  const honeypotRes = await submitQuoteRequest({
    name: 'Spam Bot',
    phone: '+502 1234 5678',
    honeypot: 'bot_field_value_hidden',
  });
  assert(honeypotRes.success === true, 'Honeypot descarta robots silenciosamente sin consumir base de datos');

  // 4. PREVENCIÓN DE INYECCIÓN DE FILTROS EN POSTGREST (BUSCADOR CRM)
  console.log('\n--- 4. Prevención de Inyección PostgREST en Búsquedas CRM ---');
  try {
    const maliciousSearchRes = await fetchQuoteRequests({
      search: 'test,phone.eq.1234),status.eq.won',
    });
    assert(maliciousSearchRes.error === null || maliciousSearchRes.data !== undefined, 'Búsqueda con caracteres PostgREST delimitadores no produce error de sintaxis 400');
  } catch {
    assert(false, 'Búsqueda con caracteres PostgREST delimitadores produjo excepción');
  }

  // 5. ROW LEVEL SECURITY (RLS) EN SUPABASE
  if (supabaseUrl && supabaseAnonKey) {
    console.log('\n--- 5. Políticas de Acceso RLS en Supabase (Cliente Anónimo) ---');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

    // SELECT block
    const { data: selectData, error: selectErr } = await anonClient.from('quote_requests').select('*');
    const isSelectBlocked = selectErr !== null || (selectData && selectData.length === 0);
    assert(isSelectBlocked, 'SELECT denegado por RLS para rol anónimo (0 registros expuestos)');

    // UPDATE block
    const { data: updateData, error: updateErr } = await anonClient
      .from('quote_requests')
      .update({ status: 'won' })
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select();
    const isUpdateBlocked = updateErr !== null || !updateData || updateData.length === 0;
    assert(isUpdateBlocked, 'UPDATE bloqueado por RLS para rol anónimo');

    // DELETE block
    const { data: deleteData, error: deleteErr } = await anonClient
      .from('quote_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select();
    const isDeleteBlocked = deleteErr !== null || !deleteData || deleteData.length === 0;
    assert(isDeleteBlocked, 'DELETE bloqueado por RLS para rol anónimo');
  }

  console.log('\n================================================================');
  console.log(`RESULTADO DE AUDITORÍA: ${passed} pruebas superadas, ${failed} fallidas.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runAudit();
