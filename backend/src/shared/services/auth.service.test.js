import test from 'node:test';
import assert from 'node:assert/strict';
import { createPasswordDigest, verifyPassword } from './auth.service.js';

test('login de bombeiros: verifyPassword valida senha correta', () => {
  const senha = 'Bombeiro@123';
  const { salt, hash } = createPasswordDigest(senha);

  assert.equal(verifyPassword(senha, salt, hash), true);
});

test('login de bombeiros: verifyPassword rejeita senha incorreta', () => {
  const senha = 'Bombeiro@123';
  const { salt, hash } = createPasswordDigest(senha);

  assert.equal(verifyPassword('SenhaErrada@123', salt, hash), false);
});
