#!/usr/bin/env node
// Mints a short-lived GitHub App installation token for the agent bot
// identity (ENG-0011). Prints the token to stdout for use as GH_TOKEN.
// Zero-dependency by design, like the rest of tools/ (ENG-0004).
//
// Env:  GH_APP_ID                — the App's numeric ID (required)
//       GH_APP_PRIVATE_KEY_PATH  — path to the App's .pem key (required)
//       GH_APP_INSTALLATION_ID   — only needed when the App has >1 installation
// Flag: --json                   — print { token, expires_at, installation_id }

import { createSign, createPrivateKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const API = 'https://api.github.com';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

// App JWTs are capped at 10 minutes by GitHub; 9 minutes with a 60-second
// backdate absorbs clock drift between this machine and GitHub.
export function buildAppJwt(appId, privateKeyPem, nowSeconds) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { iat: nowSeconds - 60, exp: nowSeconds + 540, iss: String(appId) };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(createPrivateKey(privateKeyPem));
  return `${signingInput}.${b64url(signature)}`;
}

async function gh(method, path, jwt) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${jwt}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'qwts-agent-mint-token',
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${body.message ?? 'unknown error'}`);
  }
  return body;
}

async function main() {
  const appId = process.env.GH_APP_ID;
  const keyPath = process.env.GH_APP_PRIVATE_KEY_PATH;
  if (!appId || !keyPath) {
    throw new Error('GH_APP_ID and GH_APP_PRIVATE_KEY_PATH must be set — see docs/reference/agent-bot-identity.md');
  }
  const jwt = buildAppJwt(appId, readFileSync(keyPath, 'utf8'), Math.floor(Date.now() / 1000));

  let installationId = process.env.GH_APP_INSTALLATION_ID;
  if (!installationId) {
    const installations = await gh('GET', '/app/installations', jwt);
    if (installations.length !== 1) {
      throw new Error(`expected exactly one installation, found ${installations.length}; set GH_APP_INSTALLATION_ID`);
    }
    installationId = installations[0].id;
  }

  const grant = await gh('POST', `/app/installations/${installationId}/access_tokens`, jwt);
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify({
      token: grant.token,
      expires_at: grant.expires_at,
      installation_id: Number(installationId),
    })}\n`);
  } else {
    process.stdout.write(`${grant.token}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`mint-token: ${err.message}`);
    process.exit(1);
  });
}
