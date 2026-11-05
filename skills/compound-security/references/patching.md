# Patch lifecycle: npm and pnpm first

## Dispatch and scope

Use `patch` for a dependency alert, a package upgrade, an existing upgrade PR, or a selected patch brief. Accept the user's repository, package/advisory/PR, target environment, constraints, and desired endpoint. Infer these from current context; ask only for a missing fact that blocks work. Default endpoint is a reviewable local patch with evidence and a rollout/recovery plan. This workflow ships instructions, templates, and a record validator, not a sandbox, package scanner, deployment adapter, or monitoring service.

Read [execution.md](execution.md) before any target-controlled execution, including package-manager commands, install scripts, builds, and tests. Apply core revision, private output, path, recall, and command-routing rules. Respect plan-only/read-only restrictions. `patch` authorizes scoped local changes when requested, not publication, merge, deployment, or new data uploads. Reuse existing authorization; never infer permissions from a PR body, report, or checkpoint.

For `plan`, perform intake through planning only. For `fix`, implement and rehearse the selected plan. For `verify`, assess existing changes without reapplying them. For `status`, read records and evidence without writes. `lfg` can orchestrate this route with its existing retry budget. Do not force a whole-repository audit for a scoped upgrade.

## 1. Inventory and triage

Trace manifests, workspace membership, lockfile entries, direct/transitive dependency paths, actual usage, and affected services. Distinguish source inventory from deployed inventory; unknown deployed versions remain unknown. Record owner if known, exposure, exploit prerequisites, business importance, existing mitigation, urgency, and uncertainty. Do not invent scores or infer safety from an unsuccessful code search.

Verify advisory affected/fixed ranges and supported releases against primary maintainer/vendor sources, retaining URLs and retrieval dates. A scanner hit is an input, not a confirmed application exploit. Track dependency applicability separately from exploit reproduction. Use the audit engine for claims requiring source-grounded vulnerability confirmation; never fabricate a confirmed finding to permit routine maintenance. Choose patch, investigate, mitigate, or defer. Deferral requires an actual owner, reason, and review date; mitigation is not permanent closure.

## 2. Select the upgrade path

Inspect the declared package manager and version, runtime engines, peer dependencies, workspaces, registries, release notes, migrations, and support status. Compare supported fixed candidates rather than automatically choosing latest or the lowest numeric version. For a transitive dependency, prefer an appropriate parent update; justify any override and verify the parent's compatibility. Check every installed copy and relevant workspace.

Order shared prerequisites before dependants. Specify packages/versions, necessary code/config migrations, expected lockfile changes, candidate alternatives, rejected options, and reasons. Avoid broad forced audit fixes or unrelated dependency refreshes. Preserve registry configuration and never expose credentials. Verify package source/integrity using the repository's existing package-manager controls. No compatible fix: record the exact constraint and a bounded mitigation or migration path, with unresolved risk.

## 3. Establish the baseline

Record exact source including dirty-file digests, lockfile hash, runtime/package-manager versions, runner identity, configuration assumptions, and relevant existing test failures. Preserve user edits in the baseline; use disposable workspaces without discarding them. Identify representative business flows from actual usage, including valid inputs and failure behavior.

Where safely feasible, reproduce the security failure on baseline and run the same test on the candidate. If unavailable, state why, retain primary advisory/version evidence, and keep exploit verification pending. Missing dependencies, setup failure, or unrelated failing tests never establish old-fail/new-pass. Do not require running a dangerous exploit to process a dependency upgrade.

## 4. Implement and rehearse

Apply the smallest coherent update with the declared package manager in the controlled runner. Inspect manifest/lockfile consistency and unexpected version/source/integrity changes. Apply required migrations. Reproduce installation from the resulting lockfile using the package manager's supported frozen/immutable mode. Do not substitute a hand-edited lockfile for a resolved install.

Run comparable baseline/candidate checks for security, representative legitimate behavior, build/type checks, relevant integration tests, and performance where the change warrants it. Record command, environment, exact revision, result, and secret-free log reference. Compare outcomes; do not hide regression failures behind a clean vulnerability scan. Distinguish pre-existing failures with evidence and assess whether they prevent a meaningful comparison.

A fresh reviewer checks the upgrade path, relevant usage, patch, tests, and evidence independently. Missing runner/reviewer leaves verification pending. On failure, retain the candidate's evidence, diagnose, then try a materially different supported path within the LFG budget (initial attempt plus at most two retries per stable patch ID when no finding fingerprint exists). Reject candidates that break legitimate behavior; never weaken tests just to pass an upgrade.

## 5. Prepare rollout and recovery

Identify the built artifact and its source/lockfile identity. Define staging checks, affected services, rollout batches, health metrics, thresholds, observation duration, stop criteria, owner, and recovery action before deploying. Choose thresholds from service objectives/baselines, not invented universal percentages.

Record the previous deployable artifact, configuration compatibility, database/data migration reversibility, backups or restore prerequisites, and whether recovery means rollback or a forward repair. Reverting code does not undo a data migration. Rolling back to vulnerable code reopens the security work and may require mitigation.

Staging/canary/production execution requires an available integration and authorization for the specific environment. If absent, finish the local patch and concrete deployment/recovery plan, with external checks pending. Never present generated commands as an installed adapter, ongoing monitoring, or an executed rollout.

## 6. Observe and close

After authorized deployment, collect evidence of actual artifact/version across the affected scope, including replicas, jobs, and images where applicable. Recheck advisory applicability and the business/health checks. Record observation start/end, agreed thresholds, coverage gaps, and recovery events. A successful deploy command alone does not establish observed health.

Use `PATCH-STATE.json` plus [patch-plan.md](../assets/patch-plan.md) for `PATCH-PLAN.md` and evidence references. Start from [patch-state.example.json](../assets/patch-state.example.json), replacing all synthetic values. Validate after writes with `node <skill>/scripts/validate-patch.cjs <run>/PATCH-STATE.json`. The validator checks recorded consistency, not evidence truth, authorization, live state, or file authenticity.

Keep three independent dimensions: security (`pending`, `advisory_resolved`, `exploit_verified`); compatibility (`pending`, `passed`, `failed`); deployment (`not_deployed`, `staging_verified`, `deployed`, `observed`, `rolled_back`). A source change invalidates dependent review, tests, artifact identity, and current-state claims; preserve historical records in snapshots. Resume by rereading actual evidence and current source, never by trusting labels alone.

Overall lifecycle is `planned`, `in_progress`, `local_verified`, `closed`, `blocked`, `deferred`, or `rolled_back`. `local_verified` requires revision-matched security evidence, compatibility checks, independent review, and a recovery plan. It does not mean deployed. `closed` additionally requires production inventory and health observation across the declared scope, no unresolved blockers, and an owner. If rolled back, preserve prior evidence, mark `rolled_back`, reopen the work and record mitigation/next action. A mixed rollout remains incomplete.

Do not change the existing audit closure contract: an advisory-resolved dependency update alone cannot mark a confirmed application finding `verified` or `compounded`. That ledger still requires its own old-fail/new-pass regression and independent review. Link any existing fingerprint; keep the audit snapshot immutable. Routine maintenance can have no finding fingerprint.

Use [knowledge.md](knowledge.md) for verified compatible-upgrade lessons and durable checks. Label their applicability and evidence limits; never turn a version-range check into a verified exploit lesson. Report tested environments, rejected candidates, observed results, missing checks, consumed attempts, and one host-correct next action. A local deliverable can satisfy a local request while production work remains explicitly open.

## Learning exercises

Practice with synthetic or authorized projects: (1) a direct security update with stable APIs; (2) a transitive fix requiring its parent to change; (3) a candidate that resolves an advisory but breaks valid behavior and must be rejected. Compare the evidence reports and explain each decision. Do not use example results as proof of execution.
