import { validateQuoteInput, submitQuoteRequest } from '../src/services/quotes';

console.log('--- TEST DE VALIDACIÓN Y REGLAS DE NEGOCIO ---');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASSED: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${msg}`);
    failed++;
  }
}

// 1. Valid input
const valid = validateQuoteInput({
  name: 'Carlos Mendoza',
  phone: '502 1234 5678',
  email: 'carlos@empresa.com',
  message: 'Necesito pintar una casa de 2 niveles',
});
assert(valid.valid === true, 'Acepta datos válidos completos');

// 2. Short name
const shortName = validateQuoteInput({
  name: 'A',
  phone: '502 1234 5678',
});
assert(shortName.valid === false, 'Rechaza nombre menor a 2 caracteres');

// 3. Short phone
const shortPhone = validateQuoteInput({
  name: 'Carlos Mendoza',
  phone: '123',
});
assert(shortPhone.valid === false, 'Rechaza teléfono menor a 6 caracteres');

// 4. Bad email format
const badEmail = validateQuoteInput({
  name: 'Carlos Mendoza',
  phone: '502 1234 5678',
  email: 'not-an-email',
});
assert(badEmail.valid === false, 'Rechaza correo con formato inválido');

// 5. Message too long (> 3000 chars)
const longMessage = validateQuoteInput({
  name: 'Carlos Mendoza',
  phone: '502 1234 5678',
  message: 'A'.repeat(3001),
});
assert(longMessage.valid === false, 'Rechaza mensajes excesivamente largos (> 3000 chars)');

// 6. Honeypot check
async function testHoneypot() {
  const result = await submitQuoteRequest({
    name: 'Spam Bot',
    phone: '12345678',
    honeypot: 'i-am-a-bot',
  });
  assert(result.success === true, 'Honeypot atrapa bot silenciosamente');
}

testHoneypot().then(() => {
  console.log(`\nValidación completada: ${passed} pasados, ${failed} fallidos.\n`);
  if (failed > 0) process.exit(1);
});
