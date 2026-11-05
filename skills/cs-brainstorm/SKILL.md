---
name: cs-brainstorm
description: Turn a vague security concern into grounded options, priorities, and a scoped brief. Use before choosing an audit or remediation goal.
---

# Compound Security: brainstorm

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `brainstorm` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's goal, scope, findings, run path, restrictions, and arguments. This entry point selects `brainstorm`; it does not override an explicit user restriction. Follow the core's mode-specific reference, prerequisites, evidence gates, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
