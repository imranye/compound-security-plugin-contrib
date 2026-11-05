# Remediation and verification

## Invariant and plan

State a testable invariant, e.g. “object lookup constrains tenant and object ID,” rather than “add auth.” Name attacker capability and legitimate behavior to preserve. Inspect sibling entrypoints sharing the primitive. Fix the narrowest reliable boundary without unrelated cleanup.

Keep the original finding immutable; closure records refer to its fingerprint and exact source. Map affected files, common root causes, tests, compatibility, rollback, and external assumptions before editing. Full `run` authorizes local implementation; do not manufacture per-file approvals. Preserve existing user changes and production boundaries.

Dependency upgrades: inspect manifests/lockfiles, dependency paths and usage, supported fixed versions from primary advisories, peer/runtime constraints, and migrations. Resolve shared prerequisites before leaves. Do not assume all newer versions are compatible or safer. Keep versions and lockfiles consistent. Do not fetch/install without required authorization and runner controls.

Infrastructure changes: map control-plane/runtime versions, rollout order, workload disruption limits, removed APIs/config, rollback prerequisites, and health checks. Local config edits/tests establish a proposed fix, not a deployed repair. Keep external checks explicit.

For npm/pnpm work, follow [patching.md](patching.md) for inventory, candidate comparison, baseline/rehearsal, and deployment evidence. Preserve the finding evidence requirements below; patch-state labels cannot bypass them.

## Evidence matrix

| Check | Required observation |
| --- | --- |
| Baseline regression | Security assertion fails because the original defect is reached |
| Patched regression | Same attack-shaped input is blocked by the invariant |
| Legitimate behavior | Representative valid operations still succeed |
| Independent review | Different agent reconstructs control and checks alternate paths |
| Revision identity | Logs/reviewer refer to exact source including dirty changes |

Missing dependency, syntax error, unexplained timeout, or swapped fixture does not prove old-fail/new-pass. Use the same regression on disposable baseline and patched source; document harness-only adaptations. Preserve realistic preconditions and stop at a minimal dummy-data effect.

Without independent contexts, prepare checks and leave verification pending. Without the required sandbox, write authorized patch/tests but do not execute target code. Keep secret-free evidence and skipped-check reasons. Validators check recorded assertions, not their authenticity.

Use `fixed_unverified` before all gates, `verified` after independent review, and `compounded` after durable prevention and learning/decision records. `deferred` needs owner/reason/review date; accepted risk is deferred ownership, not remediation. Material patch changes require fresh independent checking.
