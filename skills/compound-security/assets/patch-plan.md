# Patch plan

## Goal and inventory
- Stable patch ID; requested endpoint; scope and exclusions:
- Source revision/dirty digest, lockfile hash, package manager/runtime:
- Advisory and primary sources with retrieval dates; existing finding fingerprints:
- Direct/transitive paths, workspaces, usage, services, deployed inventory or unknowns:
- Owner, exposure, priority rationale, constraints and uncertainty:
- Decision: patch / investigate / mitigate / defer (owner, reason, review date):

## Upgrade decision
| Candidate | Prerequisites and migrations | Support/fix evidence | Compatibility risk | Decision |
| --- | --- | --- | --- | --- |

- Ordered changes, expected lockfile diff, alternatives, mitigation if no viable fix:

## Baseline and rehearsal
| Check / business flow | Baseline evidence | Candidate evidence | Revision / environment | Result / gap |
| --- | --- | --- | --- | --- |

- Controlled runner, reproducible install, pre-existing failures:
- Security reproduction or reason unavailable; advisory evidence is separate:
- Independent reviewer and exact reviewed revision:
- Rejected candidates, failures, attempts consumed and remaining budget:

## Rollout and recovery
- Artifact/source identity; staging checks; authorized integration/environment:
- Batches, metrics, thresholds, observation duration, stop criteria and owner:
- Previous artifact; config/data compatibility; restore/forward-repair prerequisites:
- Rollback implications and temporary mitigation:

## Deployment observation and handoff
- Actual version/artifact across affected scope; health evidence and observation window:
- Outstanding checks and current PATCH-STATE.json dimensions:
- Exact next action with the current host's command prefix:
