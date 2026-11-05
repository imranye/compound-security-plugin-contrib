# Vendored audit engine

Source: [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill).

Pinned revision: [`c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8), inspected November 4, 2026.

Original directory: `skills/security-audit/`. All files in that directory are included. `LICENSE` is copied verbatim from the repository root; upstream copyright is 2025–2026 Cloudflare, Inc., under the MIT License.

Local changes: rename upstream `SKILL.md` to `AUDIT-WORKFLOW.md` to avoid registering a second nested skill; replace references to `SKILL.md` in the vendored Markdown files with `AUDIT-WORKFLOW.md`. All other upstream file contents are unchanged. No upstream validator or schema logic is modified. This provenance file is an addition by Compound Security. Upstream Git blob hashes were checked after reversing the documented filename references.

Read [AUDIT-WORKFLOW.md](AUDIT-WORKFLOW.md) as the audit protocol, with this directory as `<skill-dir>`. It describes audits and recommends source fixes; the enclosing Compound Security workflow separately controls source remediation and lesson capture.

Validation commands:

```sh
node <skill-dir>/validate-findings.cjs <output-dir>/findings.json
node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json
node --test <skill-dir>/validate-findings.test.cjs <skill-dir>/validate-coverage-ledger.test.cjs
```

The 65 upstream tests passed at vendoring. Tests include their fixtures inline and require only Node.js and local filesystem/process support. Validator success checks format and internal consistency; it does not prove a finding or create an execution sandbox.
