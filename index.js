/**
 * ATAP — Agent Trust and Accountability Protocol
 * Reference Implementation v0.1.0
 *
 * Storage-agnostic by default.
 * Uses in-memory storage out of the box.
 * Pass a storage adapter for persistence (Supabase, PostgreSQL, Redis, files).
 *
 * @license CC-BY-4.0
 * @author Kirill Fenix / JARVIS OS Project
 */

'use strict';

const consent      = require('./src/consent');
const audit        = require('./src/audit');
const arbitration  = require('./src/arbitration');

/**
 * Guard — unified check before any agent action.
 * Combines Consent Engine check + Audit Chain log in one call.
 *
 * @param {string} agent   - Agent identifier
 * @param {string} action  - Action being attempted
 * @param {object} params  - Action parameters (e.g. { amount: 300 })
 * @returns {Promise<ConsentResult>}
 *
 * @example
 * const ok = await atap.guard('finance', 'send_payment', { amount: 300 });
 * if (!ok.allowed) return `Blocked: ${ok.reason}`;
 */
async function guard(agent, action, params = {}) {
  const result = consent.check(agent, action, params);
  await audit.log(
    agent,
    action,
    result.allowed
      ? `Allowed: ${result.reason}`
      : `Blocked: ${result.reason}`,
    { result: result.allowed ? 'allowed' : 'blocked' }
  );
  return result;
}

/**
 * Status — summary of the Trust Layer state.
 *
 * @returns {Promise<object>}
 */
async function status() {
  return {
    version:     '0.1.0',
    consent:     { policies: Object.keys(consent._policies()).filter(k => k !== '_default').length + ' agents configured' },
    audit:       { backend: audit._backend() },
    arbitration: { agents: Object.keys(arbitration._priorities()).length + ' agents registered' },
  };
}

module.exports = {
  consent,
  audit,
  arbitration,
  guard,
  status,
};
