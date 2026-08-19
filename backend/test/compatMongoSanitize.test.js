import test from 'node:test';
import assert from 'node:assert/strict';
import compatibleMongoSanitize from '../utils/compatMongoSanitize.js';

test('compatible middleware sanitizes request data without assigning to getter-only query', () => {
  const req = {
    body: { '$where': 1, ok: true },
    params: { 'user.name': 'admin', ok: true },
    headers: { 'x-test': '1' },
  };

  Object.defineProperty(req, 'query', {
    configurable: true,
    get() {
      return { '$where': 1, ok: true };
    },
  });

  const res = {};

  compatibleMongoSanitize()(req, res, () => {
    assert.deepStrictEqual(req.body, { ok: true });
    assert.deepStrictEqual(req.params, { ok: true });
    assert.deepStrictEqual(req.headers, { 'x-test': '1' });
    assert.deepStrictEqual(req.query, { ok: true });
  });
});
