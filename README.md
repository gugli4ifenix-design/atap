# ATAP — Agent Trust and Accountability Protocol

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)]()
[![Status](https://img.shields.io/badge/status-draft-orange.svg)]()

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
