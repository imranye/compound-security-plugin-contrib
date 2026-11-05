---
name: cs-plan
description: Build a scoped remediation plan from current security findings and applicable prior lessons. Use when the user invokes cs-plan or explicitly requests the plan phase of Compound Security.
---

# Compound Security: plan

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `plan` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's scope, findings, run path, constraints, and arguments. This entry point selects `plan`; it does not expand authorization or override an explicit user restriction. Follow the core's prerequisites, evidence gates, execution boundaries, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
