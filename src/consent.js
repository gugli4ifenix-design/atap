'use strict';

const POLICIES = {
  _default: {
    _any: { limit: null, require_approval: false }
  }
};

function _clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function _resolve(agent, action) {
  return (
    (POLICIES[agent] && POLICIES[agent][action]) ||
    (POLICIES[agent] && POLICIES[agent]['*']) ||
    (POLICIES['*'] && POLICIES['*'][action]) ||
    POLICIES._default._any
  );
}

function check(agent, action, params = {}) {
  const policy = _resolve(agent, action);

  if (policy.limit !== null && policy.limit !== undefined) {
    const amount = Number(params.amount);
    const limit = Number(policy.limit);

    if (!Number.isFinite(limit)) {
      return {
        allowed: false,
        reason: 'Policy misconfigured: invalid limit',
        requires_approval: true,
      };
    }

    if (Number.isFinite(amount) && amount > limit) {
      return {
        allowed: false,
        reason: `Amount ${amount} exceeds limit ${limit}`,
        requires_approval: true,
      };
    }
  }

  if (policy.require_approval === true && params.approved !== true) {
    return {
      allowed: false,
      reason: 'Explicit approval required',
      requires_approval: true,
    };
  }

  return {
    allowed: true,
    reason: 'Allowed by policy',
    requires_approval: false,
  };
}

function setPolicy(agent, action, policy = {}) {
  if (!agent || !action) {
    throw new Error('agent and action are required');
  }

  if (!POLICIES[agent]) {
    POLICIES[agent] = {};
  }

  const next = {};

  if (Object.prototype.hasOwnProperty.call(policy, 'limit')) {
    if (policy.limit !== null && !Number.isFinite(Number(policy.limit))) {
      throw new Error('limit must be a number or null');
    }
    next.limit = policy.limit === null ? null : Number(policy.limit);
  } else {
    next.limit = null;
  }

  if (Object.prototype.hasOwnProperty.call(policy, 'require_approval')) {
    next.require_approval = policy.require_approval === true;
  } else {
    next.require_approval = false;
  }

  POLICIES[agent][action] = next;
  return POLICIES[agent][action];
}

function _policies() {
  return _clone(POLICIES);
}

module.exports = {
  check,
  setPolicy,
  _resolve,
  _policies,
};
