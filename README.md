# Compound Security

Find a vulnerability, repair its cause, prove the fix, and retain the lesson so the next review starts with better security knowledge.

Compound Security combines [Cloudflare's source-grounded security audit](https://github.com/cloudflare/security-audit-skill) with [Every's compound engineering loop](https://github.com/EveryInc/compound-engineering-plugin). The reusable core is one portable skill; version 0.2.0 provides ten focused entry points and native Claude Code and Codex manifests.

For all ten workflows, examples, and record formats, read the [full documentation](docs/Full-Documentation.md).

## Start here

Describe what you are building or what worries you. Start with `cs-help` for a recommendation, use `cs-brainstorm` to choose a useful security goal, and use `cs-lfg` to carry that goal through the available local work.

| What you have in mind | Start with | What you get |
| --- | --- | --- |
| "I don't know where to start" | `cs-help` | One recommended next action, a ready-to-use command, and a few alternatives |
| "We're launching a SaaS; what should we secure first?" | `cs-brainstorm` | Grounded options, priorities, and a scoped `SECURITY-BRIEF.md` |
| "Take this goal through to completion" | `cs-lfg` | A route from current evidence, local execution, independent verification, prevention, and honest blockers |

For example, in Claude Code:

```text
/compound-security:cs-help We're about to launch a SaaS. Where should I start?
/compound-security:cs-brainstorm We handle customer documents and use AI agents. What should we secure first?
/compound-security:cs-lfg Take the selected tenant-isolation scope from our brief through verified local fixes and prevention.
```

Each is a separate invocation. Help gives guidance without creating a run. Brainstorm creates a brief without starting an audit or changing product code. Invoking LFG requests the scoped local work; it preserves any explicit restrictions such as "report only."

## Use it

| Entry point | Outcome |
| --- | --- |
| `compound-security` | Select the appropriate mode from the user's request |
| `cs-help` | Explain useful starting points and recommend one next command |
| `cs-brainstorm` | Turn a concern or goal into grounded options and a security brief |
| `cs-lfg` | Choose or resume the route from current work, completing feasible local stages with bounded retries |
| `cs-audit` | Inspect scoped code and report evidence-backed findings |
| `cs-plan` | Turn findings and prior lessons into a remediation plan |
| `cs-fix` | Apply selected local fixes within the authorized scope |
| `cs-verify` | Check the fix, regression protection, and remaining gaps |
| `cs-compound` | Preserve verified lessons as checks and reusable knowledge |
| `cs-run` | Run the explicitly requested full audit-to-compound pipeline |
| `cs-status` | Report coverage, findings, blockers, and next actions |

For Claude Code, use the plugin namespace:

```text
/compound-security:cs-audit review the authentication and tenant-isolation code
/compound-security:cs-plan use the findings from that audit
/compound-security:cs-fix apply the confirmed findings' remediation plan
/compound-security:cs-verify verify those fixes
/compound-security:cs-compound retain the verified prevention lessons
```

For Codex, invoke plugin skills with the `compound-security:` prefix inside the Codex prompt. Type `$compound-security:` to find them in the skill picker. For example:

```text
$compound-security:cs-help I'm new to this. Recommend a starting point for this project.
$compound-security:cs-brainstorm Help me prioritize security work before launch.
$compound-security:cs-lfg Carry the selected scope through local fixes, verification, and prevention.
$compound-security:cs-audit review the authentication and tenant-isolation code
$compound-security:cs-run audit this repository and fix confirmed findings locally
$compound-security:cs-status summarize the latest run
```

The core [SKILL.md](skills/compound-security/SKILL.md) defines each mode, its prerequisites, and the artifact contract. Wrappers delegate to that same core rather than maintaining separate methodologies.

If only the standalone core skill is installed, use `$compound-security help`, `$compound-security brainstorm`, or `$compound-security lfg` with the same request. The short `$compound-security:cs-*` entry points belong to the plugin package.

## LFG and run

`cs-run` requests the full audit → plan → fix → verify → compound pipeline. `cs-lfg` starts from a goal, brief, existing audit, remediation plan, or unfinished patch, checks which evidence is still current, and runs the missing stages. It keeps a private checkpoint and carries retry limits forward on resume. Both honor the same evidence and execution gates. Missing capabilities produce an explicit partial result; they never become invented passing tests.

LFG handles requested local work without repeated stage-by-stage approval. Publishing, messaging, merging, deployment, paid services, or new data uploads still require their own existing authorization. Its checkpoint records progress; it is not an authorization source or an installed background runner.

## Install from this package

Install directly from the public Offense Research repository. In Claude Code, run these commands one at a time:

```text
/plugin marketplace add offense-research/compound-security-plugin
/plugin install compound-security@compound-security-plugin
```

For Codex CLI, run:

```bash
codex plugin marketplace add offense-research/compound-security-plugin
codex plugin add compound-security@compound-security-plugin
```

To install from a local checkout instead, clone the repository:

```bash
git clone https://github.com/offense-research/compound-security-plugin.git
cd compound-security-plugin
pwd
```

Use the absolute directory printed by `pwd` wherever the commands below show `/absolute/path/compound-security-plugin`.

### Claude Code

Load the local package for the current session:

```bash
claude --plugin-dir /absolute/path/compound-security-plugin
```

For a persistent installation, in Claude Code:

```text
/plugin marketplace add /absolute/path/compound-security-plugin
/plugin install compound-security@compound-security-plugin
```

### Codex CLI

Register the local marketplace and install its plugin:

```bash
codex plugin marketplace add /absolute/path/compound-security-plugin
codex plugin add compound-security@compound-security-plugin
```

Local marketplace installation uses a cached copy; edits to this source directory may require reinstalling. Use a new session after installation if skills are not immediately visible. The manifests follow the native Codex layout present in the inspected Every revision; actual host loading must be checked with the installed CLI version.

### Portable skill

An Agent Skills-compatible host can load `skills/compound-security/` directly. If importing the `cs-*` entry points too, preserve the sibling layout under `skills/`. The core works without the wrappers. Multi-agent hosts can delegate specialist passes; a host without delegation must disclose reduced independence.

## What compounds

| Inherited from | What is retained |
| --- | --- |
| Cloudflare | Deterministic coverage, independent candidate disproof, distinct confirmed/blocked/rejected verdicts, final record checks |
| Every | Recall before planning, plan/work/review/compound, executable prevention before documentation, stale-lesson refresh |
| New in this package | Immutable audit snapshot plus a separate fix lifecycle, revision-bound regression evidence, independent patch verification, sanitized security memory |

Audit evidence and reusable security knowledge serve different purposes. A candidate remains unconfirmed until its attack path is supported. A verified fix can produce a regression check or a narrowly applicable lesson. Later audits and fix plans retrieve those lessons, recheck them against current code, and use them to change what gets reviewed or tested.

An audit does not authorize product changes. Fix, run, and LFG modes apply only the requested local scope. Runtime exploit checks require the execution boundary described by the core; missing capabilities are reported as blockers. A clean scanner result alone does not prove a fix. The package has no automatic hooks, remote MCP servers, telemetry, API keys, or mandatory paid services.

## Validate the package

Requires Node.js 18+ for the artifact validators/tests and Python 3.9+ for the structural checker. Independent-agent support and an appropriately controlled execution runner are needed for full runtime verification; neither is supplied by this package.

```bash
python3 scripts/validate_plugin.py
node --test skills/compound-security/references/audit/validate-findings.test.cjs skills/compound-security/references/audit/validate-coverage-ledger.test.cjs skills/compound-security/scripts/validate-closure.test.cjs
```

This checks manifest consistency, the core and wrapper layout, relative wrapper links, and provenance notices. It does not execute target code or prove that Claude Code or Codex can load the plugin. Follow the core's own artifact validation and verification instructions during actual reviews.

The Node suites test the bundled record validators, including rejection of stale/self-reviewed closure and unconfirmed findings. They are not target application tests. Neither native host CLI was available in the authoring environment, so actual Claude/Codex loading has not been smoke-tested.

## Records

`SECURITY-BRIEF.md` holds brainstorm scope and success criteria. `LFG-STATE.json` records an LFG goal, progress, source identities, consumed retries, and blockers for safe resumption. Help creates neither file.

Keep raw audit artifacts outside tracked source. `findings.json` and `coverage-ledger.json` retain the audited revision; `closure.json` tracks planned, fixed-unverified, verified, compounded, or deferred work by fingerprint. `RECALL.md` records which prior lessons changed the work. Sanitized lessons default to `docs/solutions/security/`; the regression test/rule is the durable prevention artifact.

The complete shape reference is [closure.example.json](skills/compound-security/assets/closure.example.json), with fictional data clearly identified by [the contract](skills/compound-security/references/closure-contract.md). Never use example results as execution evidence.

## Attribution

Copyright 2026 Offense Research. Original Compound Security work is licensed under Apache-2.0. Bundled upstream material retains its MIT notices. See [LICENSE](LICENSE), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [sources.lock.json](sources.lock.json) for retained notices and exact upstream revisions.
