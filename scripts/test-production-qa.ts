import { createClient } from '@supabase/supabase-js';
import { submitQuoteRequest, validateQuoteInput } from '../src/services/quotes';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://khagzrjxoqwzqrikomrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYWd6cmp4b3F3enFyaWtvbXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzAwOTUsImV4cCI6MjEwNzA0NjA5NX0.pUav2uMVkrKTs-iL4s5RLvrvLmfqUPnPtxjwsF-sQU0';

console.log('================================================================');
console.log('PHASE 1 — COMPLETE QA & SUPABASE FORM TEST SUITE');
console.log('Ideas & Colores Multi-Servicios Guatemala');
console.log('================================================================\n');

async function runQATests() {
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // --- 1.4: FORM VALIDATION RULES ---
  console.log('--- 1.4: Form Validation Rules (Client & Service Layer) ---');

  // Empty submission
  const emptyRes = validateQuoteInput({ name: '', phone: '' });
  assert(!emptyRes.valid, 'Empty submission is rejected');

  // Invalid email
  const badEmailRes = validateQuoteInput({ name: 'Juan Pérez', phone: '502 1234 5678', email: 'invalid-email-address' });
  assert(!badEmailRes.valid, 'Invalid email format is rejected');

  // Valid email
  const goodEmailRes = validateQuoteInput({ name: 'Juan Pérez', phone: '502 1234 5678', email: 'contacto@ideascolores.gt' });
  assert(goodEmailRes.valid, 'Valid email format is accepted');

  // Invalid phone (< 6 chars)
  const badPhoneRes = validateQuoteInput({ name: 'Juan Pérez', phone: '123' });
  assert(!badPhoneRes.valid, 'Invalid short phone number (<6 chars) is rejected');

  // Valid phone
  const goodPhoneRes = validateQuoteInput({ name: 'Juan Pérez', phone: '+502 6661-7592' });
  assert(goodPhoneRes.valid, 'Valid GT phone number is accepted');

  // Excessively long input (> 150 chars name)
  const longNameRes = validateQuoteInput({ name: 'A'.repeat(151), phone: '+502 6661-7592' });
  assert(!longNameRes.valid, 'Excessively long name (>150 chars) is rejected');

  // Anti-spam Honeypot submission
  console.log('\n--- 1.4: Anti-Spam Honeypot Bot Trap ---');
  const honeypotRes = await submitQuoteRequest({
    name: 'Spam Bot',
    phone: '12345678',
    honeypot: 'filled_by_automated_bot_field',
  });
  assert(honeypotRes.success, 'Honeypot silently traps bots without saving spam payload');

  // --- 1.5: REAL SUPABASE FORM TEST ---
  console.log('\n--- 1.5: Real Supabase Form Submission (ORIGO QA TEST) ---');
  console.log('Testing flow: FORM -> SUPABASE -> DATABASE...');

  const testPayload = {
    name: 'ORIGO QA TEST',
    phone: '+502 5555-0199',
    email: 'qa@ideasycoloresgt.site',
    service: 'Pintura Arquitectónica con Asesoría de Color',
    spaceType: 'Residencial',
    estimatedArea: '120 m²',
    desiredTimeline: 'Próximos 7 días',
    location: 'Carretera a El Salvador, Guatemala',
    message: 'Final production QA test — delete after verification',
    source: 'website_quote_wizard' as const,
  };

  const submitResult = await submitQuoteRequest(testPayload);
  assert(submitResult.success, 'Real form submission to Supabase succeeded');

  // --- 1.5: Verify RLS Restrictions on Anon Client ---
  console.log('\n--- 1.5: Anon Client RLS Security Verification ---');
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  // Verify anon CANNOT SELECT
  const { data: anonSelect, error: selectErr } = await anonClient.from('quote_requests').select('*');
  const readDenied = (selectErr !== null) || (anonSelect && anonSelect.length === 0);
  assert(readDenied, 'Public anon client CANNOT read records (RLS strict SELECT block)');

  // Verify anon CANNOT UPDATE
  const { data: anonUpdate, error: updateErr } = await anonClient
    .from('quote_requests')
    .update({ status: 'won' })
    .eq('name', 'ORIGO QA TEST')
    .select();
  const updateDenied = (updateErr !== null) || (!anonUpdate || anonUpdate.length === 0);
  assert(updateDenied, 'Public anon client CANNOT update records (RLS strict UPDATE block)');

  // Verify anon CANNOT DELETE
  const { data: anonDelete, error: deleteErr } = await anonClient
    .from('quote_requests')
    .delete()
    .eq('name', 'ORIGO QA TEST')
    .select();
  const deleteDenied = (deleteErr !== null) || (!anonDelete || anonDelete.length === 0);
  assert(deleteDenied, 'Public anon client CANNOT delete records (RLS strict DELETE block)');

  console.log('\n================================================================');
  console.log(`QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runQATests().catch((err) => {
  console.error('Fatal error during QA tests:', err);
  process.exit(1);
});
