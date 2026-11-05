# Sources, adaptations, and limits

| Source | Retained mechanism | Adaptation |
| --- | --- | --- |
| Cloudflare security-audit-skill | Coverage ledger, adversarial validation, distinct verdicts, independent final checks, bounded execution | Vendored audit stage; separate fix lifecycle and source identity |
| Every Compound Engineering | Recall before planning; plan/work/review/compound; executable prevention; stale/duplicate knowledge maintenance | Security invariants, independent patch review, sanitized lessons, return into future coverage |

Cloudflare: https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8

Every: https://github.com/EveryInc/compound-engineering-plugin/tree/a76c45cef80bc5564a4fc7c06614ed278e4c3736

Every source paths: `skills/ce-compound/SKILL.md`, `skills/ce-compound/references/form.md`, `skills/ce-compound/assets/resolution-template.md`, `skills/ce-plan/references/agents/learnings-researcher.md`, root manifests. Both upstreams use MIT; preserve [Every's notice](EVERY-LICENSE.txt) and [Cloudflare's notice](audit/LICENSE) when distributing. This is an independent synthesis, not an official Cloudflare or Every product.

The orchestrator, remediation lifecycle, closure validator, memory contract, templates, and mode wrappers are new. Version 0.2.0 adds help, brainstorm, and LFG modes, informed by Every's `skills/ce-help/SKILL.md`, `skills/ce-brainstorm/SKILL.md`, and `skills/lfg/SKILL.md` at the same pinned revision. Retain Cloudflare evidence thresholds; possible severe impact is not confirmed impact. Keep confidence and severity independent.

No bundled sandbox, scanner, paid service integration, scheduled automation, CI enforcement, or deployment system is implemented. Host tools and independent agents are required. Validators check shape/consistency, not evidence authenticity, complete coverage, or security. Native plugin loading must be checked in each host; the core skill is portable.

## Dependency patch lifecycle (v0.3.0)

The original patch workflow adds npm/pnpm inventory and advisory applicability, candidate comparison, baseline/candidate rehearsal, independent compatibility review, and explicit recovery and deployment observation. Patch-state evidence remains separate from Cloudflare findings and the existing application-fix closure contract. Deployment adapters and persistent monitoring are not included.
