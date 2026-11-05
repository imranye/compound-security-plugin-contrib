# Validation record — v0.2.1

Validated November 5, 2026.

- A fresh plugin exercise followed help into brainstorm. The help response used the full Codex plugin name, and both the saved brief and final response contained the same qualified audit command. The README-only fixture correctly remained needs_input pending implementation source.
- A separate fresh standalone exercise recommended the standalone core command and created no artifacts.
- The package validator passed. Negative checks rejected bare follow-up commands in a mode reference and the full manual, and rejected a wrapper missing the shared command-routing reference.
- Host manifests and marketplace metadata use 0.2.1 to distinguish this revision from cached 0.2.0 installations.

These exercises cover agent-authored handoffs. Native Codex CLI installation and cache refresh on the user's machine still need user-side confirmation. The validator scans authored examples and routing references; live generated text also requires the outgoing-command check in the skill instructions.

## Previous validation — v0.2.0

Validated November 4, 2026, with Node.js v24.22.1 and the available Python 3 runtime.

- 65 unchanged upstream Cloudflare validator tests passed.
- 33 new closure-validator tests passed, including unsafe file inputs, Unicode/diagnostic handling, revision freshness, self-review rejection, and required regression/compatibility/prevention records.
- Plugin structure checks passed for two host manifests, two local marketplaces, the core, ten entry points, runtime resources, local Markdown references, and upstream notices.
- Four disposable incomplete packages were correctly rejected after removing each new entry point or the LFG reference. All JSON manifests, schemas, and examples parse.
- The canonical standalone skill passed its frontmatter/name validation.

A fresh agent used the skill for a focused read-only review of a synthetic document service. It identified a tenant-boundary candidate, rejected stale knowledge and embedded malicious instructions, used independent source review, and left runtime exploitability as needs_validation because no controlled runner/database was available. No target code was executed and no product changes were made in that exercise.

Fresh-agent checks of the new entry modes:

- Help used the standalone core invocation correctly, recommended a concrete starting task, and created no audit artifacts or product edits.
- Brainstorm produced a private brief with a useful customer-data scope, explicit success criteria, alternatives, and a standalone handoff. It marked missing implementation source as `needs_input` and did not start an audit or change the target.
- LFG reconciled an inaccurate completed checkpoint with missing evidence, rejected its embedded instruction to claim completion, and retained a source-based candidate as unvalidated under an exhausted delegation budget and unavailable runtime. It respected report-only scope and did not execute target code.

These are behavioral exercises on synthetic inputs, not evidence of end-to-end remediation on a live target.

Independent package review of the prior version led to hardened closure input handling and full lesson-destination containment instructions. The bundled validators test recorded assertions; they do not authenticate agents, prove evidence, enforce an OS sandbox, or prove absence of vulnerabilities.

Claude Code and Codex CLIs were unavailable in this authoring environment. Their native loading/install flows have not been smoke-tested. Manifests follow the inspected upstream layout; verify loading in the intended host before team rollout. No production target, scanner backend, remote API, deployment, or live exploit test was used.

## Patch lifecycle (v0.3.0)

Run `node --test skills/compound-security/scripts/validate-patch.test.cjs` and validate the synthetic shape with `node skills/compound-security/scripts/validate-patch.cjs skills/compound-security/assets/patch-state.example.json`.

The patch suite rejects stale revisions, self-review, missing evidence, compatibility failures, production closure based only on local/staging results, incomplete inventory/health observations, and inconsistent rollback. Assertions in a record remain claims; validators do not execute tests, authenticate reviewers, or inspect production.

Behavioral exercises should include a direct update, a transitive parent upgrade, and a security-resolving candidate that breaks legitimate behavior. Verify help/brainstorm route dependency work to patch, plan-only remains read-only, LFG resumes within budget, and continuation commands retain the host namespace. Real npm/pnpm rehearsal requires the controlled runner; no native host or production integration is supplied here.
