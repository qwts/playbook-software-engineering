# SOP: Security reporting and response

How a vulnerability is reported and handled in any `qwts` repo, and the repo
settings that back the process. Shared baseline under [ENG-0008](../decisions/ENG-0008-shared-sop-inheritance.md),
inherited by every repo. It builds on the security settings recorded in
[repository baseline files](repo-baseline-files.md).

## Reporting a vulnerability (mandatory — extend, don't drop)

- Report through the repo's **private vulnerability reporting** (GitHub security
  advisories), following its `SECURITY.md`. Never open a public issue or PR that
  describes an unfixed vulnerability.
- `SECURITY.md` is served from `qwts/.github` unless a repo publishes its own;
  either way the private-reporting channel is the entry point.

## Settings that back it (mandatory — extend, don't drop)

Every repo keeps these on — they are the ENG-0005 baseline, and disabling one is
a security regression, not a delta:

- Private vulnerability reporting **enabled** (`SECURITY.md` depends on it).
- Secret scanning **and** push protection **on**.
- Dependabot security updates **on**.
- CodeQL default setup **on** once the repo has code.

## Handling a report

- Triage and fix behind the normal gated PR flow. A security fix still needs a
  green gate and at least one approving review; it may be prepared privately and
  held until a coordinated release.
- A leaked secret is **rotated first**, then scrubbed from history. Rotation is
  what limits exposure; removing it from history is cleanup, not containment.
- A push-protection bypass is justified on the spot and treated as a finding to
  follow up, never a routine step.

## After an incident

- A user-affecting incident gets a short, blameless write-up: what happened, the
  root cause, and the concrete guardrail added. The standing org guardrail from
  the 2026-07-21 photos incident — agent-authored changes are gated and require
  at least one human approval — lives in the
  [branch, PR, and review workflow](branch-pr-review.md).

## Recorded deltas (see the inventory for the full list)

- A repo with stricter handling (an embargo window, a named security owner in
  `CODEOWNERS`, a dedicated advisory template) records that as a delta next to
  its link. No repo currently relaxes this baseline.

## Changelog

- 2026-07-22 — initial version; unified vulnerability reporting on private
  advisories and pinned the ENG-0005 security settings as the shared floor
  (ENG-0008).
