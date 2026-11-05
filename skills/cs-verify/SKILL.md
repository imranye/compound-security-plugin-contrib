---
name: cs-verify
description: Check whether a security finding is resolved and whether its regression protection detects the defect. Use when the user invokes cs-verify or explicitly requests the verify phase of Compound Security.
---

# Compound Security: verify

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `verify` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's scope, findings, run path, constraints, and arguments. This entry point selects `verify`; it does not expand authorization or override an explicit user restriction. Follow the core's prerequisites, evidence gates, execution boundaries, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
