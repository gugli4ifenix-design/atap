# Changelog

All notable changes to ATAP are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-03-17

### Initial Release

First public release of the Agent Trust and Accountability Protocol.

The specification and reference implementation emerged from production experience
building JARVIS OS — a 14-agent autonomous business management system —
where the absence of internal accountability infrastructure made it impossible
to delegate real authority to agents without constant human supervision.

**Components:**

- **Consent Engine** — policy-based authorization before agent actions
  - Human-readable policies defined by system owners
  - Policy hierarchy: agent:action → agent:* → *:action → *:*
  - Numeric limits and approval requirements

- **Audit Chain** — human-readable decision trail
  - Append-only storage (tamper-evident)
  - Plain-language `reason` field requirement
  - Storage-agnostic with pluggable adapters
  - In-memory default for zero-configuration start

- **Arbitration Protocol** — conflict resolution between agents
  - Priority-based resolution
  - Explicit winner/loser/reason in every resolution
  - Escalation to humans for equal-priority conflicts
  - Pluggable escalation handler (Telegram, Slack, email, etc.)

- **Guard API** — unified check + audit in one call

**Reference Implementation:**
- Node.js, zero required dependencies
- Optional Supabase adapter for production persistence
- Two working examples: basic usage and Kimi 2.5 integration

---

## Upcoming

### [0.2.0] — Planned

- Community feedback from v0.1.0 incorporated
- Python reference implementation
- PostgreSQL storage adapter
- Policy persistence (load/save from JSON or database)

### [0.3.0] — Planned

- Rollback specification — standardized undo for agent actions
- Policy versioning
- Audit Chain export (CSV, JSON)

### [1.0.0] — Target: Q3 2026

- Stable specification, no breaking changes
- Implementations in 3+ languages
- Community-ratified standard
