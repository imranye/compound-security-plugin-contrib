#!/usr/bin/env python3
"""Validate local package structure without executing any skill or target code."""
import argparse
import json
import re
import sys
from pathlib import Path


def validate(root):
    errors = []

    def check(condition, message):
        if not condition:
            errors.append(message)

    def read_json(relative):
        try:
            value = json.loads((root / relative).read_text(encoding="utf-8"))
            if not isinstance(value, dict):
                raise ValueError("expected an object")
            return value
        except (OSError, ValueError) as exc:
            errors.append(f"{relative}: {exc}")
            return {}

    claude = read_json(".claude-plugin/plugin.json")
    codex = read_json(".codex-plugin/plugin.json")
    claude_market = read_json(".claude-plugin/marketplace.json")
    codex_market = read_json(".agents/plugins/marketplace.json")
    for label, manifest in (("Claude", claude), ("Codex", codex)):
        check(manifest.get("name") == "compound-security", f"{label}: wrong plugin name")
        check(bool(re.fullmatch(r"\d+\.\d+\.\d+", manifest.get("version", ""))), f"{label}: invalid version")
        check(manifest.get("license") == "Apache-2.0", f"{label}: expected Apache-2.0 license")
        check("hooks" not in manifest and "mcpServers" not in manifest, f"{label}: unexpected automatic integration")
    check(claude.get("version") == codex.get("version"), "Plugin versions disagree")
    check(codex.get("skills") == "./skills/", "Codex: skills directory mismatch")
    for label, market in (("Claude", claude_market), ("Codex", codex_market)):
        check(market.get("name") == "compound-security-plugin", f"{label}: wrong marketplace name")
        entries = market.get("plugins", [])
        if not isinstance(entries, list):
            errors.append(f"{label}: plugins must be a list")
            entries = []
        check(len(entries) == 1, f"{label}: expected one plugin")
        entry = entries[0] if entries and isinstance(entries[0], dict) else {}
        check(entry.get("name") == "compound-security", f"{label}: marketplace plugin mismatch")
        source = "./" if label == "Claude" else {"source": "local", "path": "./"}
        check(entry.get("source") == source, f"{label}: invalid local source")

    modes = ("help", "brainstorm", "lfg", "audit", "plan", "fix", "verify", "compound", "run", "status")
    core = root / "skills/compound-security/SKILL.md"
    check(core.is_file(), "Missing skills/compound-security/SKILL.md")
    core_root = core.parent
    required = (
        "LICENSE", "agents/openai.yaml", "references/EVERY-LICENSE.txt",
        "references/execution.md", "references/remediation.md", "references/knowledge.md",
        "references/reviewer-prompts.md", "references/closure-contract.md", "references/synthesis.md",
        "references/help.md", "references/brainstorm.md", "references/lfg.md",
        "assets/security-brief.md", "assets/lfg-state.example.json",
        "assets/remediation-plan.md", "assets/security-lesson.md", "assets/closure.example.json",
        "scripts/validate-closure.cjs", "scripts/validate-closure.test.cjs",
        "references/audit/AUDIT-WORKFLOW.md", "references/audit/RECONNAISSANCE.md",
        "references/audit/HUNTING.md", "references/audit/ATTACK-CLASSES.md",
        "references/audit/VALIDATION-AND-REPORTING.md", "references/audit/report-schema.json",
        "references/audit/validate-findings.cjs", "references/audit/validate-coverage-ledger.cjs",
        "references/audit/validate-findings.test.cjs", "references/audit/validate-coverage-ledger.test.cjs",
        "references/audit/LICENSE", "references/audit/SOURCES.md",
    )
    for relative in required:
        resource = core_root / relative
        check(resource.is_file() and resource.stat().st_size > 0, f"Missing or empty core resource: {relative}")
    for document in core_root.rglob("*.md") if core_root.is_dir() else []:
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", document.read_text(encoding="utf-8")):
            if "://" in target or target.startswith("#") or target.startswith("mailto:"):
                continue
            local = target.split("#", 1)[0]
            if not local:
                continue
            destination = (document.parent / local).resolve()
            check(destination.is_relative_to(core_root.resolve()), f"Core reference escapes skill: {document.name}: {target}")
            check(destination.is_file(), f"Missing core reference: {document.name}: {target}")
    for name in ("compound-security", *("cs-" + mode for mode in modes)):
        path = root / "skills" / name / "SKILL.md"
        try:
            body = path.read_text(encoding="utf-8")
        except OSError as exc:
            errors.append(f"{path.relative_to(root)}: {exc}")
            continue
        frontmatter = re.match(r"\A---\n(.*?)\n---(?:\n|$)", body, re.S)
        check(bool(frontmatter), f"{name}: missing YAML frontmatter")
        if frontmatter:
            check(bool(re.search(rf"^name: {re.escape(name)}$", frontmatter[1], re.M)), f"{name}: name mismatch")
            check(bool(re.search(r"^description: .+", frontmatter[1], re.M)), f"{name}: description missing")
        check("[TODO:" not in body, f"{name}: unfinished scaffold")
        if name.startswith("cs-"):
            mode = name[3:]
            check("../compound-security/SKILL.md" in body, f"{name}: missing core link")
            check(f"`{mode}` mode" in body, f"{name}: wrong delegated mode")
            check(len(body.splitlines()) < 30, f"{name}: wrapper should remain thin")

    sources = read_json("sources.lock.json").get("sources", [])
    check(isinstance(sources, list) and len(sources) == 2, "Expected two pinned upstream sources")
    for source in sources if isinstance(sources, list) else []:
        if not isinstance(source, dict):
            errors.append("Invalid upstream source entry")
            continue
        check(bool(re.fullmatch(r"[0-9a-f]{40}", source.get("commit", ""))), "Unpinned upstream revision")
        notice = source.get("notice", "")
        if not isinstance(notice, str) or not notice.startswith("licenses/") or ".." in Path(notice).parts:
            errors.append("Invalid notice path")
            continue
        try:
            content = (root / notice).read_text(encoding="utf-8")
            check("Permission is hereby granted, free of charge" in content, f"{notice}: incomplete MIT notice")
            check("THE SOFTWARE IS PROVIDED" in content, f"{notice}: missing disclaimer")
        except OSError as exc:
            errors.append(f"{notice}: {exc}")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    errors = validate(args.root.resolve())
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("Package structure valid: 2 host manifests, 2 marketplaces, 1 core skill, 10 entry points, 2 source notices.")
    print("This is a structural check, not host-load or security-workflow validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
