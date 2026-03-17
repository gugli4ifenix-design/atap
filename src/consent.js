/**
 * ATAP — Consent Engine
 * Policy-based authorization before agent actions.
 *
 * Policies are defined by system owners, not by agents.
 * Agents cannot modify their own policies.
 */

'use strict';

// ─── Default policies ─────────────────────────────────────────────────────────
// Override or extend these with setPolicy() for your system.

const POLICIES = {
  _default: {
    _any: {
      limit:            null,
      require_approval: false,
      reason:           'Allowed by default'
    }
  }
};

/**
 * Check if an agent is authorized to perform an action.
 *
 * Evaluation order (most specific wins):
 * 1. agent:action  — exact match
 * 2. agent:*       — agent-level default
 * 3. *:action      — action-level default
 * 4. *:*           — system default → ALLOW
 *
 * @param {string} agent   - Agent identifier
 * @param {string} action  - Action being attempted
 * @param {object} params  - Optional parameters (e.g. { amount: 300, approved: true })
 * @returns {ConsentResult}
 */
function check(agent, action, params = {}) {
  const policy = _resolve(agent, action);

  // Numeric limit check
  if (policy.limit !== null && params.amount !== undefined && params.amount > policy.limit) {
    return {
      allowed:           false,
      requires_approval: true,
      reason:            `[${agent}→${action}] Exceeds limit ${policy.limit}. ${policy.reason}`
    };
  }

  // Explicit approval required
  if (policy.require_approval && !params.approved) {
    return {
      allowed:           false,
      requires_approval: true,
      reason:            `[${agent}→${action}] Requires owner approval. ${policy.reason}`
    };
  }

  return {
    allowed:           true,
    requires_approval: false,
    reason:            `[${agent}→${action}] Allowed. ${policy.reason}`
  };
}

/**
 * Set or update a policy for agent:action.
 *
 * @param {string} agent
 * @param {string} action
 * @param {object} policy - { limit, require_approval, reason }
 */
function setPolicy(agent, action, policy) {
  if (!POLICIES[agent]) POLICIES[agent] = {};
  POLICIES[agent][action] = {
    limit:            policy.limit            ?? null,
    require_approval: policy.require_approval ?? false,
    reason:           policy.reason           || '',
  };
}

/**
 * Get all policies configured for an agent.
 *
 * @param {string} agent
 * @returns {object}
 */
function getPolicies(agent) {
  return POLICIES[agent] || POLICIES._default;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function _resolve(agent, action) {
  return (
    POLICIES[agent]?.[action]      ||   // agent:action
    POLICIES[agent]?.['*']         ||   // agent:*
    POLICIES['*']?.[action]        ||   // *:action
    POLICIES._default._any              // system default
  );
}

function _policies() { return POLICIES; }

module.exports = { check, setPolicy, getPolicies, _policies };
