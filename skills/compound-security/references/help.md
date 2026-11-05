# Help: choose a useful starting point

Make the next action obvious to someone who does not know security terminology. Lead with one recommendation, why it fits their situation, and a ready-to-run invocation. Recommend the work without silently starting it.

## Inspect just enough context

Read the user's goal and current conversation first. When available, inspect the target's README, top-level manifests/configuration, current diff summary, and already identified briefs or run records. Keep this bounded and read-only. Do not launch auditors, execute target code, scan the whole machine for prior runs, create a run directory, or write files for `help`.

Check which commands the installed host actually exposes. Do not assume the plugin wrappers exist when only the standalone core is installed. If a path or service is unavailable, give a useful route from the known facts and name only the missing prerequisite that changes the recommendation.

If the user has supplied no goal, explain three concrete starting points such as checking a change before launch, investigating an alert, or protecting customer data. Recommend `brainstorm` to narrow one. Ask one plain-language question only if it materially changes the route; do not make the user complete a security questionnaire.

## Route by the problem, not the command name

| What the user says or already has | Recommend | Explain the result |
| --- | --- | --- |
| “I don't know where to start” or “What should we secure first?” | `brainstorm` | Pick a worthwhile, bounded task with a clear done condition |
| “We are launching” or “Can users access each other's data?” | Scoped `audit` | Review the relevant source boundaries and distinguish evidence from unknowns |
| A scanner alert, suspected bug, or unverified report | Scoped `audit` | Validate the claim before treating it as a vulnerability to fix |
| Current independently confirmed findings, no repair plan | `plan` | Define the minimal fixes, tests, dependencies, and rollback |
| Confirmed findings and a concrete repair plan | `fix` | Implement requested local repairs and run verification where supported |
| A proposed patch or changed code with earlier evidence | `verify` | Check the patch independently at its current revision |
| Independently verified fixes, prevention/learning unfinished | `compound` | Retain useful tests and non-obvious security knowledge |
| “Where did we leave off?” or an interrupted run | `status` | Read the actual artifacts, flag stale evidence, and identify the next action |
| “Take this through to completion” | `lfg` | Resume from the evidence that exists and carry the remaining authorized work forward |
| “Run the full audit-and-fix loop on this scope” | `run` | Start the explicitly scoped full local loop |

Read the core and the selected mode's reference when details matter. Do not route a raw scanner alert straight to `fix`; `plan` builds remediation plans from confirmed findings. Do not recommend another audit merely because a verified run already completed one. Treat source changes, missing evidence, or missing independent review as reasons to revalidate, not permission to reuse stale closure.

## Give the user an entry point

Use the current project and concern in the command. Examples of meaningful scopes:

- A SaaS app: “review login, document lookup, and exports for cross-tenant access.”
- A dependency alert: “validate this lockfile alert and identify the smallest compatible remediation.”
- An AI feature: “review which tools the agent can call and whether untrusted content can cross that permission boundary.”
- Infrastructure work: “scope the exposed services and upgrade dependencies before changing versions.”

These examples suggest questions to investigate; they do not assert vulnerabilities. For a novice, describe the outcome before terms such as SSRF, IAM, or CWE.

Render exactly one syntax for the installed host:

| Installation | Invocation form |
| --- | --- |
| Claude Code plugin | `/compound-security:cs-<mode> <task>` |
| Codex plugin with wrappers exposed | `$compound-security:cs-<mode> <task>` |
| Standalone core in Codex | `$compound-security <mode> <task>` |
| Other skill host | `Use compound-security in <mode> mode to <task>` |

For example, on the Codex plugin: `$compound-security:cs-brainstorm we are launching a multi-tenant SaaS; help me choose the first security check`. On a standalone installation, give `$compound-security brainstorm we are launching a multi-tenant SaaS; help me choose the first security check` instead. Do not display both forms to the same user unless they asked about portability.

Keep the response small:

1. One recommended action and a one-sentence reason.
2. One filled-in command the user can copy.
3. Up to three alternatives or examples only when they help the user choose; show the full command map only when asked.
4. One relevant capability limit, if it changes what can happen next.

Do not claim a scanner, sandbox, cloud connection, installed wrapper, or published marketplace exists without evidence. Use the package's actual README for installation guidance. `help` does not require connecting every cloud account before it can be useful.

If the user explicitly asks to perform the recommended work or has already authorized it in the conversation, route to that mode and proceed. The recommendation itself is not execution authorization. Help is complete when the user has a concrete entry point or a direct answer to their setup question.

## Source adaptation

Adapted from [Every's ce-help](https://github.com/EveryInc/compound-engineering-plugin/blob/a76c45cef80bc5564a4fc7c06614ed278e4c3736/skills/ce-help/SKILL.md): orient work using current evidence, give a host-correct next command, and distinguish advice from execution. This security-specific routing map and examples are new; the core remains authoritative for evidence and authorization boundaries.
