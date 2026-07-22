# SOP: Issue lifecycle

How work is claimed, tracked, and closed against GitHub issues in any `qwts`
repo. Shared baseline under [ENG-0008](../decisions/ENG-0008-shared-sop-inheritance.md),
inherited by default and varied only by a documented delta. It pairs with the
[branch, PR, and review workflow](branch-pr-review.md): the issue is where work
starts and the PR is where it lands.

## Every change traces to an issue (mandatory — extend, don't drop)

- Work originates from a GitHub issue. If none exists for the change, open one
  first — the issue is the durable record of *why*, the PR of *how*.
- The PR closes its issue with a closing keyword, so the trace from problem to
  merged change is complete without manual bookkeeping.

## Before you start

- Check for active-claim signals so two people do not build the same thing: a
  `[WIP]` marker in the title, an assignee, an in-progress label, a linked PR, or
  a recent claim comment. If the work looks claimed, coordinate before starting.
- State the slice you intend to take on the issue, then proceed — coordination is
  visible, not narrated step by step.

## While the work is open

- Scope to the issue's stated deliverables and exit criteria. Adjacent but
  non-blocking concerns become their own issues; they do not expand the current
  one.
- Keep the issue current with the problem, the root cause once known, and the
  plan — enough that another contributor could pick it up.

## Feature issues (mandatory — extend, don't drop)

Feature work follows the [feature-lifecycle SOP](feature-lifecycle.md) (decision:
[ENG-0007](../decisions/ENG-0007-feature-lifecycle-convention.md)): it opens as a
spec — problem, requirements, design, proposed patterns — and closes as a record
of what was built. A repo may add sections to the shared feature form but may not
drop them.

## Closing

- Merging the linked PR closes the issue; do not leave the work as a lingering
  draft PR.
- If the change was only partially delivered, the remaining slice is captured as
  a new issue before the original closes, so nothing falls through the gap.

## Recorded deltas (see the inventory for the full list)

- **cartograph** additionally binds specification and traceability artifacts to
  the issue (user-story, acceptance-criterion, and test-map updates in the same
  PR); that is a cartograph traceability delta, not a shared requirement.

## Changelog

- 2026-07-22 — initial version; generalized the claim-and-close conventions from
  the photos and cartograph working agreements (ENG-0008).
