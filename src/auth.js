'use strict';

/**
 * ATAP — Auth Module
 * API key verification + role resolution.
 *
 * Two modes:
 *   1. DISABLED (default) — all requests pass, authDisabled: true
 *   2. ENABLED  — API key must be in the keystore
 *
 * Keys are configured via configure() — never hardcoded.
 */

const KEYS = new Map();  // apiKey → { keyId, role, note }
let   AUTH_ENABLED = false;

/**
 * Configure the auth module.
 *
 * @param {object} opts
 * @param {boolean}  opts.enabled   - Enable key verification (default: false)
 * @param {Array}    opts.keys      - [{ key, keyId, role, note }]
 */
function configure({ enabled = false, keys = [] } = {}) {
  AUTH_ENABLED = enabled === true;
  KEYS.clear();

  for (const entry of keys) {
    if (!entry || !entry.key || !entry.keyId) continue;
    KEYS.set(entry.key, {
      keyId: entry.keyId,
      role:  entry.role  || 'agent',
      note:  entry.note  || '',
    });
  }

  return status();
}

/**
 * Verify an API key.
 *
 * @param {string|undefined} apiKey
 * @returns {{ ok: boolean, reason: string, keyId?: string, role?: string, authDisabled?: boolean }}
 */
function verify(apiKey) {
  if (!AUTH_ENABLED) {
    return { ok: true, reason: 'Auth disabled', authDisabled: true };
  }

  if (!apiKey) {
    return { ok: false, reason: 'Missing API key' };
  }

  const entry = KEYS.get(apiKey);
  if (!entry) {
    return { ok: false, reason: 'Invalid API key' };
  }

  return {
    ok:    true,
    reason: 'Key valid',
    keyId: entry.keyId,
    role:  entry.role,
  };
}

/**
 * Status summary — safe to expose publicly.
 */
function status() {
  return {
    enabled:   AUTH_ENABLED,
    keysLoaded: KEYS.size,
  };
}

module.exports = { configure, verify, status };
