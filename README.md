# ATAP — Agent Trust and Accountability Protocol

[![npm version](https://img.shields.io/npm/v/atap.svg)](https://www.npmjs.com/package/atap)
[![npm downloads](https://img.shields.io/npm/dm/atap.svg)](https://www.npmjs.com/package/atap)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![GitHub stars](https://img.shields.io/github/stars/gugli4ifenix-design/atap?style=social)](https://github.com/gugli4ifenix-design/atap)

> **The open standard for internal accountability in multi-agent AI systems.**

---

## The Problem

Everyone is building passports. Nobody is building employment contracts.

The AI industry is investing heavily in **external** agent identity — verifying who an agent is for payments, transactions, and regulators (W3C DID, Mastercard Verifiable Intent, Microsoft Entra Agent ID, NIST AI Agent Standards).

But there is a gap no standard addresses:

> *What is this agent authorized to do inside my system?*
> *Why did it make this decision?*
> *Who is responsible when it goes wrong?*

This is the **accountability gap**. And it's why organizations cannot give AI agents real authority — humans are forced to act as quality controllers of their own systems.

---

## The Solution

ATAP defines three components that together solve the internal accountability problem:

### ① Consent Engine
Policy-based authorization. Agents check permissions before acting. Policies are written in human language, set once by system owners.

```javascript
const result = await atap.guard('finance', 'send_payment', { amount: 750 });
if (!result.allowed) return `Blocked: ${result.reason}`;
// → "Blocked: [finance→send_payment] Exceeds limit $500. Payments above $500 require owner approval."
```

### ② Audit Chain
Human-readable decision trail. Every significant agent action is recorded with a reason in plain language — not technical logs, but explanations.

```javascript
await atap.audit.log('hr', 'reject_candidate',
  'Revenue declined per Intelligence agent report',
  { source: 'intelligence/last_trends' }
);
// → "14:32 [hr → reject_candidate]: Revenue declined per Intelligence agent report (source: intelligence/last_trends)"
```

### ③ Arbitration Protocol
Conflict resolution. When agents receive competing instructions, the system resolves conflicts explicitly — with a stated winner, loser, and reason. Unresolvable conflicts escalate to humans with full context.

```javascript
const result = atap.arbitration.resolve('devops', 'coordinator',
  'Who controls agent restarts?'
);
// → { winner: 'devops', reason: 'Priority: devops(8) > coordinator(7)' }
```


### ④ Trust Decay *(v0.2)*
Numerical trust score (0-1000) for each agent. Grows with success, decays with failure. Agents earn autonomy through behavior, not configuration.

### ⑤ Shadow Mode *(v0.2)*
New rules observe before they enforce. 7-day shadow period → if triggered 5+ times: enforce. If zero triggers: kill. No false-positive policy bloat.

### ⑥ Cross-Model Verification *(v0.2)*
Cross-check between data stores. Detects orphan rules, knowledge gaps, and contradictions before they corrupt decisions.

### ⑦ Saga Orchestration *(v0.2)*
Multi-step operations tracked with rollback capability. If step 3 of 5 fails, steps 1-2 are compensated. Borrowed from distributed systems, applied to agents.

### ⑧ Hypervisor Delta *(v0.2)*
Compare what agents promised vs what they delivered. Gap percentage feeds back into Trust Decay — consistent misses lower trust scores automatically.

---

### v0.2: Inspired by Microsoft Agent Governance Toolkit

After analyzing Microsoft's open-source [Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) (7 packages, 2.3K+ stars, OWASP 10/10 coverage), we found significant convergence with ATAP's approach. Five new primitives were added, drawing from both AGT's patterns and our own production experience with 84 autonomous agents.

**Key difference**: AGT applies OS kernel patterns. ATAP applies biological evolution patterns. Both arrive at similar solutions from different foundations.

---

## Why This Matters

**Without ATAP**, agents have authority but no accountability. Humans distrust them and keep their hand on the stop button.

**With ATAP**, agents operate transparently. Humans can see what was decided, why, and by whom. They can delegate real authority.

The result: agents become actual digital employees, not supervised tools.

---

## Quick Start

```bash
npm install atap
```

```javascript
const atap = require('atap');

// 1. Define policies (once, by system owner)
atap.consent.setPolicy('finance', 'send_payment', {
  limit: 500,
  require_approval: true,
  reason: 'Payments above $500 require owner approval'
});

// 2. Check before acting
const ok = await atap.guard('finance', 'send_payment', { amount: 300 });
console.log(ok.allowed); // → true

// 3. Record decisions
await atap.audit.log('finance', 'send_payment',
  'Paid Anthropic API invoice for March',
  { source: 'invoice #1234', result: 'success' }
);

// 4. Read the audit trail
const report = await atap.audit.report('finance');
console.log(report);
// → Audit Chain [finance] — last 1 decisions:
// → • 14:32:01 [send_payment]: Paid Anthropic API invoice for March (source: invoice #1234)
```

---

## Production Status

ATAP is not theoretical. The reference implementation (`trust-layer.js`) has been running in production inside **JARVIS OS** — a 14-agent autonomous business management system — since March 2026.

The specification emerged from real pain: agents acting unpredictably, humans unable to delegate authority, decisions made without explanation.

---

## Specification

The full specification is in [SPEC.md](./SPEC.md).

ATAP defines:
- Formal interfaces for all three components (TypeScript)
- Policy evaluation rules and hierarchy
- Storage requirements for the Audit Chain
- Arbitration algorithm
- Security considerations
- Relationship to existing standards

---

## Relationship to Existing Standards

| Standard | Focus | Relationship to ATAP |
|---|---|---|
| W3C DID | External agent identity | Complementary — ATAP is internal |
| NIST AI Agent Standards Initiative | Interoperability, security | ATAP fills the accountability gap |
| Mastercard Verifiable Intent | Payment authorization | ATAP generalizes beyond payments |
| Microsoft Entra Agent ID | Identity lifecycle | Complementary — different layers |

ATAP does not compete with these standards. It fills the gap they leave open.

---

## Repository Structure

```
atap/
├── README.md          This file
├── SPEC.md            Full protocol specification
├── CHANGELOG.md       Version history
├── CONTRIBUTING.md    How to contribute
├── LICENSE            CC BY 4.0
├── package.json       npm package
├── index.js           Main entry point
├── src/
│   ├── consent.js     Consent Engine
│   ├── audit.js       Audit Chain
│   └── arbitration.js Arbitration Protocol
└── examples/
    ├── basic.js       Basic usage
    └── with-kimi.js   Integration with Kimi 2.5 / OpenClaw
```

---

## Contributing

This specification is open for public comment.

We are particularly interested in:
- Implementations in other languages (Python, Go, Rust)
- Real-world use cases and edge cases
- Feedback on the arbitration algorithm
- Integration patterns with existing agent frameworks

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## Roadmap

| Version | Focus |
|---|---|
| **v0.1** (current) | Core specification, Node.js reference implementation |
| **v0.2** | Community feedback incorporated, Python implementation |
| **v0.3** | Rollback specification, policy persistence |
| **v1.0** | Stable, production-ready standard |

---

## License

This specification and reference implementation are released under
**[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)**.

You are free to use, share, and build upon this work in any context —
including commercial — provided you give appropriate credit.

---

## Author

**Kirill Fenix** — JARVIS OS Project  
Published: March 17, 2026

*"Everyone is building passports. We are building employment contracts."*

---

## Integrations

ATAP is framework-agnostic. Works with any multi-agent stack:

```javascript
// LangChain
const { AgentExecutor } = require('langchain/agents');
const atap = require('atap');

// Wrap any agent action with accountability
const result = await atap.guard('langchain-agent', 'web_search', { query });
if (!result.allowed) throw new Error(result.reason);
```

```javascript
// CrewAI / any Python framework — REST mode
// POST https://your-server/api/atap/guard
// { agent: "researcher", action: "scrape_url", params: { url } }
```

## Why ATAP vs rolling your own

| | ATAP | Custom logging |
|---|---|---|
| Policy enforcement | ✅ | ❌ |
| Human-readable audit | ✅ | ❌ |
| Conflict arbitration | ✅ | ❌ |
| Zero dependencies | ✅ | ✅ |
| Open standard | ✅ | ❌ |

## Used in production

ATAP is the trust layer inside [JARVIS OS](https://github.com/gugli4ifenix-design/jarvis-os-ton) — a 14-agent autonomous platform running 24/7 on a single VPS.

## Star History

If ATAP solves a problem you've been wrestling with, a ⭐ helps others find it.


---

## Products Built on ATAP

### 🛡 Governance Shield
**Real-time DeFi governance monitoring — the first product powered by ATAP.**

DeFi protocols hold billions in user deposits, but depositors have no way to know when administrators change critical parameters. Governance Shield monitors governance actions in real-time and alerts depositors before their money is affected.

- **Telegram**: [@GovShieldAlerts](https://t.me/GovShieldAlerts)
- **Monitors**: Aave V3 PoolConfigurator, ACL Manager (12 event types)
- **Risk levels**: 🔴 CRITICAL (role changes, reserve drops) · 🟠 HIGH (collateral params) · 🟡 MEDIUM (caps, fees)
- **ATAP integration**: Consent Engine validates governance actions, Audit Chain records all changes

> *Silence = safety. A message = governance is acting on your money.*

### 🤖 JARVIS Liquidation Bot
Autonomous DeFi liquidation system deployed on Ethereum Mainnet and Arbitrum. Uses ATAP Consent Engine for trust levels: 🟢 autonomous (monitoring) · 🟡 auto+rollback (execution) · 🔴 human approval (withdrawals).

---

## Academic Validation

ATAP's four design properties are independently validated by recent research:

> **"Code as Scaffold for LLM-Based Agents"** (arXiv:2605.18747, May 2025)
>
> This 100+ page survey argues that future agent systems must possess four properties:
> **executability**, **inspectability**, **statefulness**, and **controllability**.
>
> ATAP implements all four:
> | Property | ATAP Component |
> |---|---|
> | Executability | Consent Engine (policy execution) |
> | Inspectability | Audit Chain (human-readable trails) |
> | Statefulness | Policy persistence + decision history |
> | Controllability | Arbitration Protocol + trust levels |

---

## Recognition

- **TON Foundation Grant** — funded development of ATAP specification
- **NIST AI Agent Standards** — public comment submitted
- **LangChain** — [Kevros Governance Tools PR #35338](https://github.com/langchain-ai/langchain/issues/35338)
- **Production deployment** — JARVIS OS (84 agents, 4 servers, 24/7 since March 2026)
