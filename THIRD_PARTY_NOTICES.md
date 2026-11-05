# Third-party notices

Copyright 2026 Offense Research. Original Compound Security work is licensed under Apache-2.0. Bundled upstream material retains its MIT notices.

Compound Security synthesizes and adapts ideas and workflow structure from these MIT-licensed projects. It is an independent Offense Research package; it is not an official Cloudflare or Every product.

| Source | Inspected revision | Notice |
| --- | --- | --- |
| [Cloudflare Security Audit Skill](https://github.com/cloudflare/security-audit-skill) | [c1c8a8c](https://github.com/cloudflare/security-audit-skill/commit/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8) | [Copyright (c) 2025-2026 Cloudflare, Inc. — MIT](licenses/Cloudflare-MIT.txt) |
| [Every Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | [a76c45c](https://github.com/EveryInc/compound-engineering-plugin/commit/a76c45cef80bc5564a4fc7c06614ed278e4c3736) | [Copyright (c) 2025 Every — MIT](licenses/Every-MIT.txt) |

The full upstream copyright and permission notices are retained at the linked paths. Source revisions and attribution are also recorded in [sources.lock.json](sources.lock.json). These are provenance pins, not runtime dependencies: installation and use do not fetch upstream content.

The core's orchestration and remediation lifecycle are newly authored. It bundles Cloudflare's audit engine under `skills/compound-security/references/audit/`, preserving its methodology, schemas, validators, and tests; see that directory's `SOURCES.md` for the documented filename adaptations. Every's plan/work/review/compound, retrieval, help, brainstorm, and LFG principles inform the learning workflow, onboarding, autonomous routing, and plugin layout. Upstream text that couples uncertain findings to critical severity is not adopted; impact and evidence confidence remain separate.
