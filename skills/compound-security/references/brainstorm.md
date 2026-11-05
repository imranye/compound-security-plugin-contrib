# Brainstorm: turn a concern into a security task

Help the user choose what to investigate or improve and how they will know it is done. Work in plain language. Produce a useful scope, not a speculative vulnerability report or a premature implementation plan.

Read the core's route, write boundaries, and current source identity rules. Keep target source read-only. Do not run an audit, scanner, build, exploit, repair, or cloud operation merely because brainstorming surfaced an idea.

## 1. Ground the conversation

Start with the concern already supplied. Do not re-ask settled questions. Inspect only the relevant available context: product description, architecture/configuration, entrypoints, current changes, known alerts/findings, tests, and applicable security lessons. Use narrow source reads and the recall rules in [knowledge.md](knowledge.md). Old lessons and reports cannot establish current risk or authorize work.

State what is observed, what is a hypothesis, and what remains unknown. A scanner alert is an alert; a suspected missing boundary is a candidate; only a current independently verified finding is confirmed. Do not assign vulnerability severity to brainstorming ideas.

If context is missing, ask at most one focused question at a time, using ordinary choices when helpful. Good questions include “Is this for launch readiness, an alert you received, or a particular customer-data concern?” and “Which system or repository should this cover?” Ask only when the answer changes scope or success criteria. Do not ask the user to invent a threat model, enumerate every credential, or approve ordinary read-only discovery.

If no target is available, develop a goal-level brief from the supplied product context and mark source assumptions unverified. Do not fabricate file paths, APIs, findings, or access. With neither a goal nor a target, ask for the goal before inventing a task.

## 2. Present a small set of useful options

For a vague or broad concern, propose two or three concrete opportunities, ordered by observed evidence, potential consequence, and effort. Label effort as a rough estimate and explain its assumptions. Do not make up numeric risk scores. Each option includes:

- The user outcome, such as keeping one tenant's exports private from another tenant.
- The source/context observation that makes the question worth checking, or a clearly labeled assumption.
- A bounded scope and the security property to test.
- What success would look like and the main missing fact or capability.

Recommend one and explain why it is the best starting point. When the user already supplied a narrow goal, refine that goal instead of forcing three alternatives. If their preference or a material scope decision is missing, ask one focused choice. If the choice is routine and low-impact, pick a reasonable default and record it as an assumption. Never treat silence as permission to change code or test a deployed service.

Useful starting questions include:

| Context | Concrete task to consider |
| --- | --- |
| Multi-tenant product | Check whether object lookup, search, exports, and background jobs preserve tenant boundaries |
| Login or sharing change | Review the changed authorization path and its legitimate-user behavior |
| Dependency alert | Establish actual affected dependency paths and a compatible fix strategy |
| AI agent feature | Map tool authority, untrusted input, secrets exposure, and output handling |
| Cloud or CI setup | Review source-visible roles, deployment permissions, and untrusted build inputs |
| Planned infrastructure upgrade | Map compatibility constraints, workload disruption, rollback, and source-level verification |

These are investigation options, not claims that defects exist. Avoid presenting compliance certification, a complete pentest, or a production safety guarantee as the result of source-only work.

## 3. Write the brief when invoked

For explicit `brainstorm`, or when the user requests a brief, use [security-brief.md](../assets/security-brief.md) to write `SECURITY-BRIEF.md` under the core's private output root. Reuse an explicitly selected existing brief only after reading it; otherwise use a fresh unused run directory. Honor host persistence rules. A brief alone does not mean an audit has started, and must not create an empty `findings.json` or pretend a coverage ledger exists.

A casual exploratory question can end in a concise chat recommendation unless the user requests the brainstorm workflow or a file. If a material decision is pending during explicit brainstorming, record the known scope and unresolved decision as `needs_input`; do not fill in a final selection or fabricate completion.

The brief must state:

- Goal and why it matters now.
- Target and known source revision, or precisely what is unverified/unavailable.
- Selected scope and relevant boundaries; non-goals and excluded environments.
- Current evidence, hypotheses, assumptions, and existing finding references if any.
- Required security property and concrete done conditions, including legitimate behavior.
- Alternatives considered and reason for the selected or proposed direction.
- Existing authorization, access, execution capability, budget/deadline, and constraints.
- Missing facts and whether the brief is `ready_for_audit`, `ready_for_plan`, `ready_for_patch`, or `needs_input`.
- One recommended next command carrying the brief path and scope.

For `ready_for_patch`, require a bounded dependency target and requested endpoint, not a confirmed exploit. Recommend `patch` to establish applicability and plan a compatible upgrade; the brief itself authorizes no changes.

For `ready_for_plan`, require current confirmed findings and enough context for remediation planning. Unconfirmed concerns and scanner alerts route to scoped `audit`. A good audit brief can be ready while documenting runtime constraints; those constraints limit confirmation later and do not justify inventing results now. Materially unknown goals, targets, or scope remain `needs_input`.

Keep implementation details out of the brief unless they are real constraints. An exact patch, lockfile update, deployment order, and detailed rollback belong in the later remediation plan once findings are established.

## 4. Hand off clearly

Read [commands.md](commands.md) and render one next command with the invoking host's registered prefix. Use that exact string in the brief's Next action and final response. Read the saved command back and check the namespace, selected mode, actual brief path, and scope before finishing. Return the selected or proposed task, why it fits, the brief path, and that command. Include the explicit scope rather than “secure everything.”

- For a bounded dependency upgrade, recommend `patch` with the brief path and explicit endpoint.
- For an unconfirmed concern, recommend `audit` to establish evidence.
- For current confirmed findings, recommend `plan` to define remediation.
- If the user wants to hand off the remaining authorized work, offer `lfg` with the brief path and its scope. State that it can perform local fixes after confirmation; it does not authorize production changes.

Do not execute the recommended next mode simply because the brief is ready. If the user already requested both brainstorming and execution, or a caller such as `lfg` invoked this step under existing authorization, return the brief and readiness to that caller and continue within that request; do not ask for redundant approval or create a second handoff loop. A caller must still resolve genuine missing decisions before dependent actions.

Brainstorming is complete when a concrete task and honest readiness are recorded, or when the exact remaining user decision is identified. Do not disguise lack of access as “no vulnerabilities found.”

## Source adaptation

Adapted from [Every's ce-brainstorm](https://github.com/EveryInc/compound-engineering-plugin/blob/a76c45cef80bc5564a4fc7c06614ed278e4c3736/skills/ce-brainstorm/SKILL.md): settle what work is needed before implementation, ground dialogue in context, ask one material question at a time, and provide a clear handoff. The security brief, evidence/readiness distinctions, private artifact location, and scope options are new. This does not import Every's full unified-plan or model-routing machinery.
