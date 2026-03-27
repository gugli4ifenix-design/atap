'use strict';

const RULES = new Map();
const HITS = new Map();

function configure(rules = []) {
  RULES.clear();

  for (const rule of rules) {
    if (!rule || !rule.agent || !rule.action || !rule.limit || !rule.windowMs) continue;
    RULES.set(`${rule.agent}:${rule.action}`, {
      limit: Number(rule.limit),
      windowMs: Number(rule.windowMs),
    });
  }

  return status();
}

function _key(agent, action, keyId = 'anonymous') {
  return `${agent}:${action}:${keyId}`;
}

function _rule(agent, action) {
  return (
    RULES.get(`${agent}:${action}`) ||
    RULES.get(`${agent}:*`) ||
    RULES.get(`*:${action}`) ||
    RULES.get(`*:*`) ||
    null
  );
}

function check(agent, action, keyId = 'anonymous') {
  const rule = _rule(agent, action);
  if (!rule) {
    return { allowed: true, reason: 'No rate limit rule', remaining: null };
  }

  const now = Date.now();
  const k = _key(agent, action, keyId);
  const bucket = HITS.get(k) || [];
  const fresh = bucket.filter(ts => now - ts < rule.windowMs);

  if (fresh.length >= rule.limit) {
    HITS.set(k, fresh);
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${rule.limit} per ${rule.windowMs}ms`,
      remaining: 0,
    };
  }

  fresh.push(now);
  HITS.set(k, fresh);

  return {
    allowed: true,
    reason: 'Within rate limit',
    remaining: rule.limit - fresh.length,
  };
}

function status() {
  return { rulesLoaded: RULES.size };
}

module.exports = {
  configure,
  check,
  status,
};
