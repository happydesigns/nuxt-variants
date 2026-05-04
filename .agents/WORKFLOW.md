# Agent Workflow

This file defines a repeatable semi-automated workflow for building this
project with AI coding agents and human oversight.

Keep `.agents/NEXT.md` current so the next chat can resume from repository
state instead of relying on chat history.

## Operating Modes

### Interactive Flow

Use Interactive Flow when the operator wants frequent steering, when product
direction is unclear, or when a task is exploratory enough that autonomous
delegation would probably create rework.

### Fast Teamflow

Use Fast Teamflow for clear low-risk or medium-risk work where throughput and
iteration speed matter most.

Good candidates:

- documentation updates
- isolated playground polish
- test-only changes
- local developer tooling
- small internal cleanup with no public contract or shared data behavior

### Secure Teamflow

Use Secure Teamflow when correctness, privacy, security, public contracts,
dependency choices, or architecture boundaries matter more than raw throughput.

Rules:

- Serialize the work through implementation, independent review, focused fix if needed, and focused re-review.
- Use a fresh Reviewer that has not seen the Implementer conversation.
- Run the narrow checks required by the task and broader checks justified by the blast radius.
- Stop for the operator on critical risk, failed verification that cannot be bounded, unclear product/security decisions, approval requirements, destructive actions, or conflicting decisions.

### Adaptive Teamflow

Adaptive Teamflow is the normal autonomous mode. It classifies each next task,
chooses the fastest safe path, and continues without waiting for operator input
until a stop condition applies.

## Risk Classifier

Classify each task before implementation. If the classification is uncertain,
use the higher risk level.

Low risk:

- docs, copy, comments, or `.agents` planning updates
- isolated playground styling/layout changes that do not alter data flow
- test-only additions for existing behavior
- local tooling that does not affect production runtime

Medium risk:

- isolated playground behavior
- local/demo write flows for bounded non-production data
- small internal refactors with clear tests
- read-only module integration wiring

High risk:

- changes to public composables, schema helpers, module options, virtual module contracts, generated type contracts, or exports
- security, privacy, secrets, sensitive data handling, or audit behavior
- deployment/runtime boundaries, production configuration, or dependencies with broad impact
- broad refactors or cross-package behavior

Critical risk:

- destructive data actions
- production secrets or credentials
- conflicting accepted decisions or root documentation
- unclear human/product/security decisions
- changes that require external approval

Critical-risk default path: stop for the operator or delegate Planner/Architect
clarification only. Do not implement until the decision is clear.

## Roles

- Orchestrator: coordinates the workflow, delegates role-specific work, and verifies task state, commits, and next action.
- Planner: keeps roadmap/backlog/tasks coherent.
- Architect: evaluates boundaries, tradeoffs, and decisions before risky implementation.
- Implementer: implements exactly one task, self-checks it, updates task state, updates `NEXT.md`, and commits.
- Reviewer: reviews completed work when the workflow calls for independent review.
- Integrator: applies review fixes when needed, updates task state, updates `NEXT.md`, and commits.

## Task States

Tasks live under:

```txt
.agents/tasks/ready/
.agents/tasks/in-progress/
.agents/tasks/done/
.agents/tasks/deferred/
```

Only tasks in `ready` should be assigned to implementers. A worker should move
its assigned task to `in-progress` when starting and to `done` only after
implementation and verification.

## Review Policy

Separate review is required for tasks that touch:

- security, privacy, secrets, sensitive data handling, or audit behavior
- public composables, schema helpers, virtual modules, generated types, module options, or exports
- deployment/runtime boundaries, production configuration, or dependencies with broad impact
- broad refactors, cross-package behavior, or high-impact dependencies

Separate review is optional for low-risk scaffold, documentation, styling,
small playground, test-only, or internal cleanup tasks when acceptance criteria
and verification pass.

Every task still needs an implementer self-check against scope, acceptance
criteria, relevant docs/decisions, architecture boundaries, security/privacy
implications, verification results, and unrelated changes.

## Documentation Boundaries

Public, operator, user, developer, architecture, security, API, deployment,
domain, design, and extension documentation belongs in normal project
documentation such as root Markdown files or the Docus source under `docs/`.

Use `.agents/` only for operational workflow state.

## Stop Conditions

Stop and ask for human direction when:

- a task conflicts with accepted decisions
- a decision changes product scope
- a security or privacy risk is unclear
- a dependency choice is irreversible or high impact
- implementation would require deleting or rewriting unrelated work
- verification fails and the fix is not bounded
- an action requires approval
- review findings are broad, risky, unclear, or cannot be safely delegated
