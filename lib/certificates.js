/**
 * Cryptographic Certificate Engine
 *
 * Standalone module for generating and verifying hackathon certificates.
 * Uses HMAC-SHA256 for hashing and signing. Zero external dependencies.
 * Can be extracted as a separate microservice.
 */

import crypto from 'crypto';

/**
 * Creates a canonical JSON string from certificate data.
 * Keys are sorted to ensure deterministic output.
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function canonicalize(data) {
  const sorted = Object.keys(data).sort().reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, /** @type {Record<string, unknown>} */ ({}));
  return JSON.stringify(sorted);
}

/**
 * Generates a 32-char hex hash from certificate data.
 * @param {Record<string, unknown>} data - Certificate fields (name, team, type, etc.)
 * @param {string} secret - Server-side CERTIFICATE_SECRET
 * @returns {string} 32-character hex hash
 */
export function createCertificateHash(data, secret) {
  const canonical = canonicalize(data);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(canonical);
  return hmac.digest('hex').slice(0, 32);
}

/**
 * Creates a full-length HMAC signature over data + hash.
 * @param {Record<string, unknown>} data - Certificate fields
 * @param {string} hash - The certificate hash
 * @param {string} secret - Server-side CERTIFICATE_SECRET
 * @returns {string} 64-character hex signature
 */
export function signCertificate(data, hash, secret) {
  const canonical = canonicalize(data);
  const payload = `${canonical}:${hash}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verifies a certificate's hash and signature.
 * @param {Record<string, unknown>} data - Certificate fields
 * @param {string} hash - The presented hash
 * @param {string} signature - The presented signature
 * @param {string} secret - Server-side CERTIFICATE_SECRET
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyCertificate(data, hash, signature, secret) {
  const expectedHash = createCertificateHash(data, secret);
  if (!crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'))) {
    return { valid: false, reason: 'Hash mismatch' };
  }

  const expectedSig = signCertificate(data, hash, secret);
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
    return { valid: false, reason: 'Signature mismatch' };
  }

  return { valid: true };
}

/**
 * Extracts the signable fields from a certificate row.
 * Only these fields contribute to the hash/signature.
 * @param {Record<string, unknown>} cert - Full certificate DB row
 * @returns {Record<string, unknown>}
 */
export function extractSignableFields(cert) {
  return {
    participant_name: cert.participant_name,
    team_name: cert.team_name,
    project_name: cert.project_name || '',
    university: cert.university || '',
    certificate_type: cert.certificate_type,
    event_name: cert.event_name,
    event_dates: cert.event_dates,
  };
}

/**
 * Generates a random secret suitable for CERTIFICATE_SECRET.
 * @returns {string} 64-character hex string
 */
export function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}
