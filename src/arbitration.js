/**
 * ATAP — Arbitration Protocol
 * Conflict resolution between agents with competing instructions.
 *
 * When two agents receive conflicting instructions, the system
 * resolves the conflict explicitly — with a stated winner, loser,
 * and reason. Every resolution is recorded in the Audit Chain.
 *
 * Unresolvable conflicts (equal priority) are escalated to humans
 * with sufficient context for a decision in under 30 seconds.
 */

'use strict';

const audit = require('./audit');

// ─── Priority registry ────────────────────────────────────────────────────────
// Higher number = higher priority.
// Extend or override with setPriority().

const PRIORITIES = {};

/**
 * Set the priority of an agent.
 * Higher priority agents win conflicts.
 *
 * @param {string} agent
 * @param {number} priority
 */
function setPriority(agent, priority) {
  PRIORITIES[agent] = priority;
}

/**
 * Get the priority of an agent.
 * Returns 0 if not registered.
 *
 * @param {string} agent
 * @returns {number}
 */
function getPriority(agent) {
  return PRIORITIES[agent] ?? 0;
}

/**
 * Resolve a conflict between two agents.
 *
 * Algorithm:
 * 1. Compare priority scores
 * 2. Higher priority wins
 * 3. If equal → escalate to human
 * 4. Record result in Audit Chain
 *
 * The resolution reason is always explicit:
 * "Accepted: [agent]. Rejected: [agent]. Reason: [why]"
 *
 * @param {string} agentA
 * @param {string} agentB
 * @param {string} [context]  - The question or action in conflict
 * @returns {ArbitrationResult}
 */
function resolve(agentA, agentB, context = '') {
  const prioA = getPriority(agentA);
  const prioB = getPriority(agentB);

  if (prioA === prioB) {
    // Cannot resolve — needs human
    const result = {
      winner:   null,
      loser:    null,
      decision: 'Escalated to human — equal priority',
      reason:   `${agentA}(${prioA}) == ${agentB}(${prioB}), cannot auto-resolve`,
      escalate: true,
      context,
      ts:       new Date().toISOString(),
    };

    audit.log('arbitration', `conflict:${agentA}vs${agentB}`,
      `Escalated: ${agentA} vs ${agentB} have equal priority. Human decision required.`,
      { source: context }
    );

    return result;
  }

  const winner = prioA > prioB ? agentA : agentB;
  const loser  = prioA > prioB ? agentB : agentA;
  const winPrio = Math.max(prioA, prioB);
  const losePrio = Math.min(prioA, prioB);

  const result = {
    winner,
    loser,
    decision: `Accepted: [${winner}]. Rejected: [${loser}].`,
    reason:   `Priority: ${winner}(${winPrio}) > ${loser}(${losePrio})`,
    escalate: false,
    context,
    ts:       new Date().toISOString(),
  };

  // Record in Audit Chain
  audit.log('arbitration', `conflict:${agentA}vs${agentB}`,
    `Accepted: ${winner}. Rejected: ${loser}. ${result.reason}.`,
    { source: context }
  );

  return result;
}

/**
 * Escalate an unresolvable conflict to a human.
 *
 * Calls the configured escalation handler with full context.
 * The handler receives enough information for a decision in under 30 seconds.
 *
 * @param {string[]} agents   - Conflicting agents
 * @param {string}   question - The specific question in conflict
 * @param {string}   [context]
 * @returns {Promise<EscalationResult>}
 */
async function escalate(agents, question, context = '') {
  const agentList = Array.isArray(agents) ? agents.join(' vs ') : agents;

  await audit.log('arbitration', 'escalation',
    `Escalated to owner: ${agentList} — "${question}"`,
    { source: context }
  );

  if (_escalationHandler) {
    try {
      await _escalationHandler({ agents, question, context });
      return { escalated: true };
    } catch(e) {
      console.error('[ATAP/Arbitration] escalation handler error:', e.message);
      return { escalated: false, error: e.message };
    }
  }

  // Default: log to console
  console.warn(`[ATAP] ⚖️ ESCALATION REQUIRED\nAgents: ${agentList}\nQuestion: ${question}\nContext: ${context}`);
  return { escalated: true, channel: 'console' };
}

// ─── Escalation handler ───────────────────────────────────────────────────────

let _escalationHandler = null;

/**
 * Configure how escalations reach humans.
 *
 * @param {Function} handler - async (event) => void
 *   event: { agents: string[], question: string, context: string }
 *
 * @example
 * atap.arbitration.onEscalate(async (event) => {
 *   await sendTelegram(`⚖️ Conflict: ${event.agents.join(' vs ')}\n${event.question}`);
 * });
 */
function onEscalate(handler) {
  _escalationHandler = handler;
}

function _priorities() { return PRIORITIES; }

module.exports = { setPriority, getPriority, resolve, escalate, onEscalate, _priorities };
