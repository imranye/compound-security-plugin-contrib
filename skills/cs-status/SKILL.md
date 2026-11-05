---
name: cs-status
description: Summarize the current security run, coverage, finding states, blockers, and next actions without product edits. Use when the user invokes cs-status or explicitly requests the status phase of Compound Security.
---

# Compound Security: status

Before loading the core, read [command routing](../compound-security/references/commands.md). Preserve the host-provided registered name and invocation prefix throughout this mode and all follow-up commands.

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `status` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's scope, findings, run path, constraints, and arguments. This entry point selects `status`; it does not expand authorization or override an explicit user restriction. Follow the core's prerequisites, evidence gates, execution boundaries, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
