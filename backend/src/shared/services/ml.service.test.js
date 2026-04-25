import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRiskByFrp } from './frp-classification.js';

test('classifyRiskByFrp retorna baixo para FRP menor que 50', () => {
  assert.equal(classifyRiskByFrp(44.09), 'baixo');
});

test('classifyRiskByFrp retorna moderado para FRP entre 50 e 500', () => {
  assert.equal(classifyRiskByFrp(57.5), 'moderado');
});

test('classifyRiskByFrp retorna alto para FRP acima de 500', () => {
  assert.equal(classifyRiskByFrp(700), 'alto');
});

test('classifyRiskByFrp retorna indefinido para FRP inválido', () => {
  assert.equal(classifyRiskByFrp(Number.NaN), 'indefinido');
});
