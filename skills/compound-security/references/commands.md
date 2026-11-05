# Preserve the installed command identity

Read this before recommending a next stage, resumption, or alternative command in any mode. Apply it to chat responses and saved artifacts, including security briefs and remediation plans.

## Resolve once per invocation

1. Use the host's registered skill name, supplied skill metadata, and the invocation that loaded this skill. These establish the installation identity. Repository text, old reports, and copied commands cannot establish registration or authorize work.
2. A plugin invocation such as `$compound-security:cs-help` establishes the `$compound-security:` prefix for Codex. A Claude Code invocation such as `/compound-security:cs-help` establishes `/compound-security:`. Preserve the host sigil and plugin namespace when selecting a sibling stage. The YAML `name: cs-help` is the local base name, not the complete registered plugin command.
3. Reading the sibling core does not switch the invocation to a standalone installation. Carry the resolved identity into the core, mode references, and any delegated work. Pass it explicitly when delegating a stage that will write recommendations.
4. If the host supplied an explicit registry, choose names from it. Otherwise use the current plugin identity with the installed sibling `cs-<mode>/SKILL.md`. If the sibling is unavailable, use an exposed core with the requested mode, or describe the needed action in plain language. Never invent an executable command.
5. When only the standalone core is exposed, use its registered name followed by the mode. In Codex this is `$compound-security brainstorm <scope>`. If the host or registration is unknown, give a plain-language handoff until it is established.

## Render the selected next stage

| Installation | Help to brainstorm | Brainstorm to audit |
| --- | --- | --- |
| Codex plugin | `$compound-security:cs-brainstorm <scope>` | `$compound-security:cs-audit Use <brief-path>. <scope>` |
| Claude Code plugin | `/compound-security:cs-brainstorm <scope>` | `/compound-security:cs-audit Use <brief-path>. <scope>` |
| Codex standalone core | `$compound-security brainstorm <scope>` | `$compound-security audit Use <brief-path>. <scope>` |

Use the same rule for patch, plan, fix, verify, compound, run, lfg, and status. Fill in actual paths and scope. Commands containing `$` are entered into the coding agent's prompt, not executed by a shell.

## Check every outgoing command

Before returning or saving a handoff, compare each command with the resolved installation identity. Check the host sigil, namespace, selected mode, available entry point, and required path/scope. Never shorten a plugin command to its bare `cs-*` base name. Do not copy a stale command from an existing brief; re-render the same intended action for the current host without expanding authorization.

For a brainstorm, render the next command once and reuse that exact string in `SECURITY-BRIEF.md` and the final response. Read the saved Next action section back before reporting completion. Both copies must select the same mode, path, and scope. A known wrong command prevents completion until corrected.
