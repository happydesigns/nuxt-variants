# Next Action

This file tells the human/operator what to do next and gives the exact prompt
to paste into the next chat.

Update it after every completed implementation, review, planning, integration,
or workflow task.

## Current Mode

Adaptive Teamflow.

## Current Next Step

Review the `codex/explore-module-improvements` PR and decide whether to merge
or request follow-up changes.

Completed on this branch:

- Variant diagnostics for unknown parents, circular inheritance, and replaced
  `extends` chains.
- `active: false` semantics for resolved config and feature checks.
- Module option typing now accepts the documented `active: false` registry
  entry shape.
- The docs Nuxt config clears invalid Vite dependency pre-bundle includes from
  inherited MDC modules, which keeps local Docus startup logs focused on real
  issues.
- A Nuxt DevTools inspector served from a root Nuxt `client/` iframe app. The
  client uses `@nuxt/devtools-kit/iframe-client`, `@nuxt/devtools-ui-kit`, and
  split Vue components for variants, inheritance, config layers, resolved
  config, active features, and diagnostics. The sidebar is the only variant
  selector. The main panel focuses on a dynamic selected-variant summary, clear
  inheritance and feature sections, highlighted JSON config inspection, and
  validation issues only when issues exist. The inspector shows one composition
  view because feature checks resolve from the `extends` chain plus the selected
  variant itself.

Recommended next track after PR review: plan any further module features at a
high level before implementation. Good candidates are typed authoring helpers
for registry definitions or stronger validation ergonomics, but treat them as
public-contract work that needs operator approval before code changes.

## Prompt For Next Chat

```txt
You are the Orchestrator for @happydesigns/nuxt-variants.

Repo: C:\Users\janfr\Documents\GitHub\2.happydesigns\nuxt-variants

Read:
- AGENTS.md
- README.md
- CONTRIBUTING.md
- docs/
- .agents/WORKFLOW.md
- .agents/NEXT.md
- .agents/ROADMAP.md
- .agents/EPICS.md
- .agents/BACKLOG.md
- .agents/tasks/

Coordinate the next workflow step from .agents/NEXT.md.

Rules:
- The module is already working; do not change runtime behavior without first writing a high-level plan and getting operator approval.
- Use Adaptive Teamflow unless .agents/NEXT.md or the operator selects another mode.
- Classify each task with the risk classifier before delegation; if unclear, choose the higher-risk path.
- Use fresh role-specific contexts for Implementer, Reviewer, Integrator, Planner, or Architect work when available.
- Stop for operator approval before module features, public contracts, dependencies with broad impact, or breaking changes.

When you stop, summarize:
- role chats or sub-agents run
- commits created or reviewed
- current .agents/NEXT.md action
- blockers or human decisions needed
```
