# Closure ledger contract

Use `closure.json` separately from the immutable audit `findings.json`. Findings describe the audited source; closure describes later fixes. Never change an audit verdict to `fixed` or overwrite historical evidence.

Run:

```bash
node <skill-root>/scripts/validate-closure.cjs <run-directory>/closure.json <run-directory>/findings.json
```

The command reads each input once into a bounded snapshot, validates the findings snapshot using the bundled Cloudflare `validateDocument` function and trusted report schema, then cross-checks closure against that same snapshot. It never reopens the untrusted findings path for a second validator. Exit `0` means both record structures passed; `1` means invalid records; `2` means missing/unsafe inputs, parsing or resource-limit failure, or missing trusted validator/schema. It never executes target code, opens evidence paths, or calls a network service. It cannot prove recorded results, evidence contents, actual reviewer independence, audit coverage, or deployment. A fresh verifier must inspect those facts before recording them. The CLI reports confirmed findings omitted from closure; omission is not closure.

Require an OS with `O_NOFOLLOW` and `O_NONBLOCK` support. Input files are opened with both protections and checked through their open descriptors; final-path symlinks, directories, devices, sockets, and FIFOs are refused. The CLI reads regular files only and rejects invalid UTF-8. Files are not required to be inside the target repository; choose their trusted parent directory in the main workflow. No-follow protects the final component, not all ancestor directories.

The input limits apply independently to each JSON file: at most **5 MiB**, **32 nesting levels**, **1,000 items per array or properties per object**, **20,000 total values**, **65,536 UTF-16 code units per string**, and **1,024 code units per object key**. Nesting is checked before JSON parsing; breadth and value counts are checked before semantic validation. Schema validation can impose tighter upstream limits. Split large runs into explicit scopes rather than silently truncating records. Diagnostics are capped at **100 messages**, each **1,024 code units**; control, format, invisible, line-separator, and lone-surrogate characters are escaped. Parse and I/O failures use generic messages without echoing input contents, paths, or system exception text.

Use [the complete synthetic example](../assets/closure.example.json) as a shape reference only. Its paths, revisions, identities, and results are fictional and must never be presented as execution evidence.

## Root fields

| Field | Meaning |
| --- | --- |
| `schema_version` | Exactly `1`. |
| `audit_revision` | Immutable source identity for the audited vulnerable code. |
| `current_revision` | Source identity currently being assessed, including dirty-worktree digest when needed. |
| `entries` | Array of records referencing unique confirmed finding fingerprints. May be empty; this means no recorded remediation. |

Use precise opaque source identities, such as a commit or a commit plus a digest of uncommitted changes. Never use a moving branch name as the only source identity. Regression tests may be grafted onto the vulnerable snapshot; record the target source identity and the test revision in the evidence log. Tests execute only in the sandbox required by the main workflow.

## Entry fields and gates

Every entry requires `fingerprint` and `status`. `fingerprint` must exactly match one unique `confirmed` finding. Keep `needs_validation` and `rejected` findings in the audit records; neither is a verified vulnerability to close.

| Status | Required objects | Interpretation |
| --- | --- | --- |
| `planned` | `plan` | Work is proposed. |
| `fixed_unverified` | `plan`, `fix` | A patch exists but closure is unproven. |
| `verified` | `plan`, `fix`, `verification` | Recorded independent verification and old/new tests passed the gates below. |
| `compounded` | `plan`, `fix`, `verification`, `compound` | Verified fix also has durable knowledge and prevention artifacts. |
| `deferred` | `deferral`; optional `plan` | Unresolved work with an accountable owner and review date. Never count as fixed. |

Do not add future-phase objects before reaching their status. For example, `planned` forbids a `verification` object. Keep incomplete review notes in a separate working document until complete. Each object rejects unknown keys to catch misspellings.

- `plan`: nonempty strings `summary`, `regression_plan`, `compatibility_plan`, `rollback`.
- `fix`: nonempty strings `author`, `revision`; nonempty unique string array `changed_files`. `revision` is the snapshot at which the patch was authored. It can precede `current_revision`; verification must assess the current snapshot.
- `verification`: nonempty strings `verifier`, `reviewed_revision`; nonempty unique string array `evidence_files`; objects `regression` and `compatibility`. Use actual distinct session identities for author and verifier. The validator rejects the same identity case-insensitively but cannot authenticate identities.
- `verification.regression`: objects `before` and `after`. Each has `revision`, `result`, `evidence_file`. `before.revision` must equal `audit_revision` and `before.result` must be `fail`. `after.revision` must equal `current_revision` and `after.result` must be `pass`. These are security assertions: the same intended assertion fails on vulnerable source and passes on patched source. Merely observing an exploit command fail is not sufficient.
- `verification.compatibility`: `revision` equals `current_revision`, `result` is `pass`, and `evidence_file` identifies the compatibility-test log.
- `verification.reviewed_revision`: must equal `current_revision`. A verified fix requires a current source identity different from the audit identity. After changes, reverify or return to `fixed_unverified` and remove the stale verification/compound objects; preserve their history in prior run artifacts.
- `compound`: nonempty `lesson_file`; nonempty unique string arrays `prevention_files` and `applies_to`. Link a real regression test, static rule, or other automated prevention artifact. A prose recommendation alone cannot satisfy this gate. If prevention cannot yet run, retain `verified` and explain the gap in the working report.
- `deferral`: nonempty strings `reason`, `owner`, and an actual `review_date` in `YYYY-MM-DD` form. A past review date is structurally valid but is overdue; status reporting must flag it.

All strings must have visible non-whitespace content and no surrounding whitespace. Closure fields reject control/format/default-ignorable characters, Unicode line/paragraph separators, and lone surrogates, including invisible suffixes added to reviewer identities. Keep prose fields on a single line and put multiline evidence in referenced files. Evidence and lesson paths are references relative to the run or repository as documented in the run manifest; the validator does not resolve or execute them. Keep raw exploit details in access-controlled audit storage. Repository lessons should contain the minimum sanitized detail needed for prevention.

## Independent verification checklist

Read the current source and tests without accepting the fix author's conclusions. Confirm the invariant is enforced at the effective boundary, the regression reproduces the original condition on the old snapshot, the patch blocks the condition on the new snapshot, and supported behavior still works. Read the actual logs and confirm they match the recorded revisions. Missing sandbox, dependencies, credentials, or independent reviewers means `fixed_unverified`, not invented passing results.
