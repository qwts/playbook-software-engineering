import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';

import { buildAppJwt } from '../mint-token.mjs';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

const NOW = 1_753_228_800; // fixed instant so claims are deterministic

function decodeClaims(jwt) {
  return jwt
    .split('.')
    .slice(0, 2)
    .map((segment) => JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')));
}

test('JWT carries the RS256 header and the GitHub App claims', () => {
  const jwt = buildAppJwt('12345', pem, NOW);
  const [header, payload] = decodeClaims(jwt);
  assert.deepEqual(header, { alg: 'RS256', typ: 'JWT' });
  assert.equal(payload.iss, '12345');
  assert.equal(payload.iat, NOW - 60);
  assert.equal(payload.exp, NOW + 540);
});

test('JWT lifetime stays inside GitHub\'s 10-minute cap', () => {
  const jwt = buildAppJwt('12345', pem, NOW);
  const [, payload] = decodeClaims(jwt);
  assert.ok(payload.exp - payload.iat <= 600);
});

test('signature verifies against the key pair', () => {
  const jwt = buildAppJwt('12345', pem, NOW);
  const [headerSeg, payloadSeg, signatureSeg] = jwt.split('.');
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${headerSeg}.${payloadSeg}`);
  assert.ok(verifier.verify(publicKey, Buffer.from(signatureSeg, 'base64url')));
});

test('numeric app ids are coerced to the string iss GitHub expects', () => {
  const jwt = buildAppJwt(12345, pem, NOW);
  const [, payload] = decodeClaims(jwt);
  assert.equal(payload.iss, '12345');
});
