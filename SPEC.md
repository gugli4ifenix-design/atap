# ATAP — Agent Trust and Accountability Protocol
## Specification v0.1 (Draft)

> Published: 2026-03-17
> Author: Kirill Fenix / JARVIS OS Project
> Status: Draft for Public Comment
> License: Creative Commons Attribution 4.0 International (CC BY 4.0)

---

## Abstract

ATAP (Agent Trust and Accountability Protocol) defines a standard interface
for internal trust, accountability, and governance within multi-agent AI systems.

While existing standards address *external* agent identity (who is this agent?),
ATAP addresses the *internal* accountability problem:
**what is this agent authorized to do, why did it act, and who is responsible?**

This specification defines three core components:
1. **Consent Engine** — policy-based authorization before agent actions
2. **Audit Chain** — human-readable decision trail after agent actions
3. **Arbitration Protocol** — conflict resolution between agents

---

## 1. Motivation

### 1.1 The Identity Gap

Current industry efforts (W3C DID, NIST AI Agent Standards, Mastercard Verifiable Intent,
Microsoft Entra Agent ID) focus on external agent verification:
verifying agent identity for payments, transactions, and regulatory compliance.

This is the *passport problem* — proving who an agent is to the outside world.

### 1.2 The Accountability Gap

No standard exists for the *employment contract problem* — defining what an agent
is permitted to do within a system, recording why it made decisions, and resolving
conflicts between agents operating in the same environment.

### 1.3 The Human Oversight Problem

Without internal accountability infrastructure, humans cannot delegate real authority
to AI agents. They are forced to act as quality controllers of their own systems,
defeating the purpose of autonomous agents.

> "The absence of internal accountability is the primary reason organizations
> cannot give AI agents real authority." — JARVIS OS Project, 2026

---

## 2. Scope

ATAP applies to:
- Multi-agent systems where two or more AI agents operate autonomously
- Systems where agents take actions with real-world consequences (payments, file operations, API calls, communications)
- Any framework where human oversight of agent decisions is required

ATAP does NOT cover:
- External identity verification (see W3C DID, OpenID)
- Agent-to-agent payment protocols (see x402, Mastercard Agent Pay)
- Model alignment or safety (see Constitutional AI, RLHF)

---

## 3. Core Concepts

### 3.1 Agent
An autonomous software entity powered by an LLM or rule-based system,
capable of taking actions on behalf of a human or organization.

### 3.2 Policy
A human-readable rule defining what an agent is authorized to do.
Policies are defined by system owners, not by agents.

```
Policy format:
{
  agent:   string,          // which agent this applies to
  action:  string,          // what action is governed
  limit:   number | null,   // optional numeric threshold
  require_approval: boolean,// whether human approval is needed
  reason:  string           // human-readable explanation
}
```

### 3.3 Decision Record
A structured log entry created after every significant agent action.

```
Decision Record format:
{
  ts:     ISO8601,    // timestamp
  agent:  string,     // which agent acted
  action: string,     // what it did
  reason: string,     // why (in human language)
  source: string,     // what data informed the decision
  files:  string[],   // resources affected
  result: string      // outcome
}
```

### 3.4 Arbitration Result
The outcome of a conflict resolution between two or more agents.

```
Arbitration Result format:
{
  winner:   string,   // agent whose decision is accepted
  loser:    string,   // agent whose decision is rejected
  decision: string,   // human-readable outcome
  reason:   string,   // why this agent won
  escalate: boolean   // whether human review is required
}
```

---

## 4. Component Specifications

### 4.1 Consent Engine

The Consent Engine enforces policies before agent actions are executed.

#### 4.1.1 Interface

```typescript
interface ConsentEngine {
  // Check if agent is authorized to perform action
  check(agent: string, action: string, params?: object): ConsentResult;

  // Set or update a policy
  setPolicy(agent: string, action: string, policy: Policy): void;

  // Get all policies for an agent
  getPolicies(agent: string): Policy[];
}

interface ConsentResult {
  allowed:           boolean;
  requires_approval: boolean;
  reason:            string;
}
```

#### 4.1.2 Evaluation Rules

1. If no policy exists for agent+action → **ALLOW** (permissive default)
2. If policy has `require_approval: true` and no approval present → **DENY**
3. If policy has numeric `limit` and `params.amount > limit` → **DENY**
4. Otherwise → **ALLOW**

#### 4.1.3 Policy Hierarchy

Policies are evaluated in this order (most specific wins):
1. `agent:action` (exact match)
2. `agent:*` (agent-level default)
3. `*:action` (action-level default)
4. `*:*` (system default)

---

### 4.2 Audit Chain

The Audit Chain records every significant agent decision in human-readable form.

#### 4.2.1 Interface

```typescript
interface AuditChain {
  // Record a decision
  log(agent: string, action: string, reason: string, meta?: AuditMeta): Promise<string>;

  // Retrieve decision history for an agent
  history(agent: string, limit?: number): Promise<DecisionRecord[]>;

  // Generate human-readable report
  report(agent?: string, limit?: number): Promise<string>;
}

interface AuditMeta {
  source?: string;    // data source that informed decision
  files?:  string[];  // resources affected
  result?: string;    // outcome
}
```

#### 4.2.2 Storage Requirements

- Decision records MUST be stored in append-only storage
- Records MUST NOT be modifiable after creation
- Records MUST include a timestamp and agent identifier
- Storage backend is implementation-defined (database, blockchain, file)

#### 4.2.3 Human-Readable Requirement

The `reason` field MUST be written in natural language understandable
by a non-technical system owner. Technical identifiers alone are insufficient.

❌ Bad:  `"action=0x3f, result=200, agent_id=ag_7f3a"`
✅ Good: `"Rejected candidate because Intelligence agent reported revenue decline"`

---

### 4.3 Arbitration Protocol

The Arbitration Protocol resolves conflicts between agents with competing instructions.

#### 4.3.1 Interface

```typescript
interface ArbitrationProtocol {
  // Resolve conflict between two agents
  resolve(agentA: string, agentB: string, context?: string): ArbitrationResult;

  // Escalate unresolvable conflict to human
  escalate(agents: string[], question: string, context?: string): Promise<EscalationResult>;

  // Get priority of an agent
  getPriority(agent: string): number;
}
```

#### 4.3.2 Resolution Algorithm

1. Compare priority scores of conflicting agents
2. Higher priority agent wins
3. If equal priority → escalate to human
4. All resolutions MUST be recorded in the Audit Chain
5. Resolution reason MUST be explicit: "Accepted: [agent]. Rejected: [agent]. Reason: [why]"

#### 4.3.3 Escalation Requirements

When escalating to humans, the system MUST provide:
- Names of conflicting agents
- The specific question or action in conflict
- Relevant context (recent decisions, data sources)
- Sufficient information for a decision in under 30 seconds

---

## 5. Guard Interface (Unified API)

Implementations SHOULD provide a unified `guard()` function combining
Consent Engine check and Audit Chain logging in a single call.

```typescript
async function guard(
  agent: string,
  action: string,
  params?: object
): Promise<ConsentResult>
```

**Behavior:**
1. Check consent policy for `agent:action`
2. Log the check result to Audit Chain
3. Return `ConsentResult`

**Usage pattern:**
```javascript
const result = await guard('finance', 'send_payment', { amount: 750 });
if (!result.allowed) {
  return `Action blocked: ${result.reason}`;
}
// proceed with action
await audit.log('finance', 'send_payment', 'Paid Anthropic API invoice', {
  source: 'invoice #1234',
  result: 'success'
});
```

---

## 6. Implementation Notes

### 6.1 Reference Implementation

A reference implementation in Node.js is available at:
`https://github.com/jarvisOS/trust-layer` *(coming soon)*

The reference implementation (`trust-layer.js`) has been running in production
within the JARVIS OS multi-agent system since March 2026.

### 6.2 Storage Backends

ATAP is storage-agnostic. Recommended backends:
- **Development:** JSON files (included in reference implementation)
- **Production:** PostgreSQL / Supabase
- **Audit-grade:** Append-only ledger, blockchain

### 6.3 Language Agnostic

While the reference implementation is in JavaScript,
ATAP is designed to be implemented in any language.
Port implementations are encouraged.

---

## 7. Security Considerations

### 7.1 Policy Integrity
Policies MUST be stored outside agent execution context.
Agents MUST NOT be able to modify their own policies.

### 7.2 Audit Integrity
Audit Chain records MUST be tamper-evident.
Records MUST be stored in infrastructure inaccessible to agents.

### 7.3 Escalation Security
Escalation channels MUST reach actual humans, not other agents.

---

## 8. Relationship to Existing Standards

| Standard | Focus | Relationship to ATAP |
|---|---|---|
| W3C DID | External agent identity | Complementary — ATAP is internal |
| NIST AI Agent Standards | Interoperability, security | ATAP fills the internal accountability gap |
| Mastercard Verifiable Intent | Payment authorization | ATAP generalizes beyond payments |
| Microsoft Entra Agent ID | Identity lifecycle | Complementary — different layers |
| OpenAI Responses API | Agent capabilities | ATAP adds governance layer on top |

---

## 9. Versioning

This document follows Semantic Versioning:
- **MAJOR** — breaking changes to interfaces
- **MINOR** — new components or optional features
- **PATCH** — clarifications and corrections

Current version: **0.1** (Draft)
Next milestone: **0.2** — community feedback incorporated

---

## 10. Contributing

This specification is open for public comment.

To contribute:
1. Open an issue or pull request at the GitHub repository *(coming soon)*
2. Submit feedback via NIST AI Agent Standards Initiative public comment process
3. Contact: trust-layer@jarvis-os.com *(coming soon)*

All contributions are welcome. The goal is a vendor-neutral standard
that benefits the entire multi-agent AI ecosystem.

---

## 11. License

This specification is released under
**Creative Commons Attribution 4.0 International (CC BY 4.0)**.

You are free to share, adapt, and build upon this work,
provided you give appropriate credit to the original authors.

© 2026 JARVIS OS Project. All rights reserved.
Specification authored by Kirill Fenix.
