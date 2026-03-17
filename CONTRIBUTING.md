# Contributing to ATAP

Thank you for your interest in the Agent Trust and Accountability Protocol.

ATAP is an open standard. Its value comes from the community — from real-world
implementations, edge cases, and feedback that makes the specification stronger.

---

## Ways to Contribute

### 1. Implement ATAP in another language

The reference implementation is in Node.js. We need implementations in:
- **Python** (high priority — most ML/agent frameworks are Python)
- **Go**
- **Rust**
- **TypeScript** (strict types for the reference implementation)

If you build an implementation, open a PR to add it to the
[Implementations](#implementations) section of this document.

### 2. Report real-world edge cases

If you use ATAP and encounter a situation the specification doesn't handle,
open an issue. Real-world edge cases are the best way to strengthen the spec.

Include:
- What your multi-agent system does
- The situation ATAP couldn't handle
- What behavior you expected

### 3. Improve the specification

If you find ambiguity, contradiction, or gaps in [SPEC.md](./SPEC.md),
open an issue or submit a PR with a proposed change.

For significant changes, open an issue first to discuss.

### 4. Share your integration

If you've integrated ATAP into an agent framework (LangChain, AutoGen,
OpenClaw, CrewAI, etc.), we'd love to know. Open an issue or PR to add
your integration to the examples.

---

## Principles

**Vendor-neutral.** ATAP must not favor any specific LLM, framework, or company.

**Language-agnostic.** Interfaces are defined in TypeScript for clarity,
but must be implementable in any language.

**Human-readable first.** The `reason` field in Decision Records must be
understandable by non-technical system owners. This is a core requirement,
not a nice-to-have.

**Storage-agnostic.** ATAP must work with any storage backend.
The reference implementation provides in-memory storage by default.

**Backward compatible.** After v1.0, breaking changes require a major version bump.

---

## Process

1. **Issues** — for bugs, questions, and discussion
2. **Pull Requests** — for specification changes, new examples, documentation
3. **Discussions** — for design questions and roadmap

For the specification itself, changes to normative language
(`MUST`, `SHOULD`, `MAY`) require discussion before merging.

---

## Implementations

| Language | Repository | Status | Author |
|---|---|---|---|
| JavaScript (Node.js) | [jarvisOS/atap](https://github.com/jarvisOS/atap) | ✅ Reference | Kirill Fenix |
| *Python* | *wanted* | — | — |
| *Go* | *wanted* | — | — |

---

## Code of Conduct

Be respectful. Be constructive. Focus on the technical merit of ideas.

---

## License

By contributing to ATAP, you agree that your contributions will be
licensed under the same [CC BY 4.0 license](./LICENSE) as the project.
