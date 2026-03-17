/**
 * ATAP — Audit Chain
 * Human-readable decision trail for agent actions.
 *
 * Every significant agent action should be recorded here —
 * not as technical logs, but as explanations understandable
 * by a non-technical system owner.
 *
 * Storage is pluggable. Default: in-memory (no persistence).
 * For production, provide a storage adapter via configure().
 */

'use strict';

// ─── In-memory storage (default) ─────────────────────────────────────────────

const _store = [];   // append-only in memory

let _adapter = null; // optional external storage adapter

/**
 * Configure a storage adapter for persistence.
 *
 * The adapter must implement:
 *   async append(record: DecisionRecord): Promise<void>
 *   async query(agent?: string, limit?: number): Promise<DecisionRecord[]>
 *
 * @param {object} adapter
 */
function configure(adapter) {
  _adapter = adapter;
}

/**
 * Record an agent decision.
 *
 * The `reason` MUST be written in plain language.
 *
 * ❌ Bad:  "action=0x3f, result=200, agent_id=ag_7f3a"
 * ✅ Good: "Rejected candidate because Intelligence agent reported revenue decline"
 *
 * @param {string} agent   - Which agent made the decision
 * @param {string} action  - What it did
 * @param {string} reason  - Why, in human language
 * @param {object} meta    - Optional: { source, files, result }
 * @returns {Promise<DecisionRecord>}
 */
async function log(agent, action, reason, meta = {}) {
  const record = {
    ts:     new Date().toISOString(),
    agent,
    action,
    reason,
    source: meta.source || null,
    files:  meta.files  || [],
    result: meta.result || null,
  };

  // Append-only
  _store.push(record);

  // External adapter
  if (_adapter) {
    try { await _adapter.append(record); } catch(e) {
      console.error('[ATAP/Audit] adapter error:', e.message);
    }
  }

  return record;
}

/**
 * Retrieve decision history.
 *
 * @param {string} [agent]  - Filter by agent (omit for all agents)
 * @param {number} [limit]  - Maximum records to return (default: 20)
 * @returns {Promise<DecisionRecord[]>}
 */
async function history(agent, limit = 20) {
  if (_adapter) {
    try { return await _adapter.query(agent, limit); } catch(e) {
      console.error('[ATAP/Audit] adapter query error:', e.message);
    }
  }

  const records = agent
    ? _store.filter(r => r.agent === agent)
    : _store.slice();

  return records.reverse().slice(0, limit);
}

/**
 * Generate a human-readable report.
 *
 * @param {string} [agent]  - Agent to report on (omit for system-wide)
 * @param {number} [limit]  - Records to include (default: 10)
 * @returns {Promise<string>}
 */
async function report(agent, limit = 10) {
  const records = await history(agent, limit);

  if (!records.length) {
    return agent
      ? `[${agent}] No decisions recorded yet.`
      : 'Audit Chain is empty.';
  }

  const header = agent
    ? `Audit Chain [${agent}] — last ${records.length} decisions:`
    : `Audit Chain [system] — last ${records.length} decisions:`;

  const lines = records.map(r => {
    const time = new Date(r.ts).toLocaleTimeString('en-US', { hour12: false });
    let line = `• ${time} [${r.action}]: ${r.reason}`;
    if (r.source)       line += ` (source: ${r.source})`;
    if (r.files?.length) line += ` [files: ${r.files.join(', ')}]`;
    return line;
  });

  return `${header}\n${lines.join('\n')}`;
}

function _backend() {
  return _adapter ? 'external adapter' : 'in-memory';
}

module.exports = { configure, log, history, report, _backend };
