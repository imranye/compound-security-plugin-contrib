---
name: cs-help
description: Recommend a useful security starting point and a ready-to-use command. Use when someone asks what these skills do, where to start, or what to run next.
---

# Compound Security: help

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `help` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's goal, scope, findings, run path, restrictions, and arguments. This entry point selects `help`; it does not override an explicit user restriction. Follow the core's mode-specific reference, prerequisites, evidence gates, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
