import { deflate } from 'pako';

function toBase64Url(bytes: Uint8Array): string {
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  // btoa expects binary string
  const b64 = btoa(str).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return b64;
}

export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveKey(passphrase: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
}

export interface EncryptedPayloadMeta {
  v: number;
  alg: 'A256GCM';
  kdf: 'PBKDF2';
  iter: number;
  salt: string; // base64url
  iv: string; // base64url
  ct: string; // base64url ciphertext of deflated JSON
}

export async function encryptCompressedJsonToPayload(obj: any, passphrase: string): Promise<string> {
  const json = JSON.stringify(obj);
  const enc = new TextEncoder();
  const compressed = deflate(enc.encode(json));

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 100000;
  const key = await deriveKey(passphrase, salt, iterations);

  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, compressed);
  const ct = new Uint8Array(ciphertextBuf);

  const payload: EncryptedPayloadMeta = {
    v: 1,
    alg: 'A256GCM',
    kdf: 'PBKDF2',
    iter: iterations,
    salt: toBase64Url(salt),
    iv: toBase64Url(iv),
    ct: toBase64Url(ct),
  };

  return JSON.stringify(payload);
}
