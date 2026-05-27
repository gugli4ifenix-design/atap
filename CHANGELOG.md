# Changelog

## v0.2.0 (2026-05-27)

### New Primitives
- **Trust Decay** — Numerical trust score (0-1000) per agent, behavioral evolution
- **Shadow Mode** — New rules observe 7 days before enforcement
- **Cross-Model Verification (CMVK)** — Cross-check between data stores
- **Saga Orchestration** — Multi-step rollback capability
- **Hypervisor Delta** — Promised vs delivered comparison

### Spec Updates
- SPEC.md expanded from 364 to 531 lines (Sections 4-8 added)
- Comparison table with Microsoft Agent Governance Toolkit
- Total primitives: 8 (3 original + 5 new)

### Production Validation
- All 8 primitives implemented and tested in JARVIS OS
- 84 agents, 40 ATAP-enabled, 4 servers
- Trust Decay scoring 14 agent synapses
- Saga connected to conductor task pipeline

## v0.1.0 (2026-03-17)

### Initial Release
- Consent Engine — policy-based authorization
- Audit Chain — human-readable decision trail
- Arbitration Protocol — conflict resolution between agents
- npm package `atap` published
- NIST AI Agent Standards comment submitted
- TON Ecosystem Grant application
