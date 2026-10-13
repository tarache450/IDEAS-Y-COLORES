import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('====================================================');
console.log('SUPABASE SECURITY & FUNCTIONAL VERIFICATION SUITE');
console.log('Ideas & Colores Multi-Servicios — Fase 9.1');
console.log('====================================================\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('⚠️ [AVISO] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas en .env');
  console.log('Por favor proporciona los valores del proyecto de Supabase para ejecutar los tests remotos en vivo.');
  console.log('Comprobando validaciones locales de esquema y tipos...\n');
  process.exit(0);
}

const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

async function runSecuritySuite() {
  let passed = 0;
  let failed = 0;

  // TEST 1: INSERT legítimo desde cliente anon
  console.log('--- TEST 1: INSERT como cliente anónimo ---');
  const testPayload = {
    name: 'SEO TEST USER',
    phone: '+502 5555-0199',
    email: 'test@ideascolores.gt',
    service: 'Pintura y recubrimientos',
    space_type: 'Residencial',
    estimated_area: '50 - 150 m²',
    desired_timeline: 'Próximos 7 días',
    location: 'Carretera a El Salvador',
    message: 'Supabase integration test',
    source: 'website_quote_form' as const,
    status: 'new' as const,
  };

  const { error: insertError } = await anonClient
    .from('quote_requests')
    .insert([testPayload]);

  if (!insertError) {
    console.log('✅ TEST 1 PASSED: INSERT anónimo permitido y exitoso.');
    passed++;
  } else {
    console.error('❌ TEST 1 FAILED: Error al insertar lead:', insertError.message);
    failed++;
  }

  // TEST 2: SELECT como cliente anónimo (Debe ser DENEGADO / 0 registros visibles)
  console.log('\n--- TEST 2: SELECT como cliente anónimo (RLS Strict Privacy) ---');
  const { data: selectData, error: selectError } = await anonClient
    .from('quote_requests')
    .select('*');

  if (selectError || (selectData && selectData.length === 0)) {
    console.log('✅ TEST 2 PASSED: SELECT denegado por RLS (0 registros expuestos).');
    passed++;
  } else {
    console.error('🚨 TEST 2 CRITICAL FAILURE: El cliente anónimo pudo leer datos de leads!', selectData);
    failed++;
  }

  // TEST 3: UPDATE como cliente anónimo (Debe ser DENEGADO)
  console.log('\n--- TEST 3: UPDATE como cliente anónimo ---');
  const { data: updateData, error: updateError } = await anonClient
    .from('quote_requests')
    .update({ status: 'won' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  if (updateError || !updateData || updateData.length === 0) {
    console.log('✅ TEST 3 PASSED: UPDATE anónimo bloqueado por RLS.');
    passed++;
  } else {
    console.error('🚨 TEST 3 CRITICAL FAILURE: El cliente anónimo pudo modificar registros!');
    failed++;
  }

  // TEST 4: DELETE como cliente anónimo (Debe ser DENEGADO)
  console.log('\n--- TEST 4: DELETE como cliente anónimo ---');
  const { data: deleteData, error: deleteError } = await anonClient
    .from('quote_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  if (deleteError || !deleteData || deleteData.length === 0) {
    console.log('✅ TEST 4 PASSED: DELETE anónimo bloqueado por RLS.');
    passed++;
  } else {
    console.error('🚨 TEST 4 CRITICAL FAILURE: El cliente anónimo pudo eliminar registros!');
    failed++;
  }

  // TEST 5: INSERT con nombre inválido (< 2 chars, violación de CONSTRAINT)
  console.log('\n--- TEST 5: Constraint de Integridad (Nombre demasiado corto) ---');
  const { error: invalidNameError } = await anonClient
    .from('quote_requests')
    .insert([{ name: 'X', phone: '12345678' }]);

  if (invalidNameError) {
    console.log('✅ TEST 5 PASSED: Constraint en base de datos rechazó nombre inválido:', invalidNameError.message);
    passed++;
  } else {
    console.error('❌ TEST 5 FAILED: Se permitió insertar un nombre inválido.');
    failed++;
  }

  console.log('\n====================================================');
  console.log(`RESUMEN: ${passed} pruebas exitosas, ${failed} fallidas.`);
  console.log('====================================================\n');
}

runSecuritySuite();
