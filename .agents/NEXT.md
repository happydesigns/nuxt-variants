# Next Action

This file tells the human/operator what to do next and gives the exact prompt
to paste into the next chat.

Update it after every completed implementation, review, planning, integration,
or workflow task.

## Current Mode

Adaptive Teamflow.

## Current Next Step

Review the `codex/docs-landing-page-polish` branch and decide whether to open a
PR, request copy/design follow-up, or merge it.

Completed on this branch:

- Reworked the Docus landing page around the core product promise: one shared
  Nuxt layout, many page shapes.
- Moved the landing page from a long Markdown/card composition into focused
  Vue components so the page can use Nuxt UI landing primitives more cleanly.
- Replaced the Docus `CodeTree` wrapper with a custom interactive workbench to
  avoid the `ProseCodeTree` slot warning and keep the hero demo visually
  stronger.
- Added a combined file-tree, highlighted code panel, and variant resolver demo
  for article, landing, and event variants.
- Tightened the narrative structure around the mental model, payoff surfaces,
  and guide entry points.

Recommended next track: visual review the docs landing page at
`http://localhost:3102/`, then open a PR or request one focused design/copy
follow-up if the page direction still needs refinement.

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
- The current branch is docs-only landing page polish. Keep any follow-up scoped to docs/content or docs app components unless the operator explicitly approves broader changes.
- Use Adaptive Teamflow unless .agents/NEXT.md or the operator selects another mode.
- Classify each task with the risk classifier before delegation; if unclear, choose the higher-risk path.
- Use fresh role-specific contexts for Implementer, Reviewer, Integrator, Planner, or Architect work when available.
- Stop for operator approval before module features, public contracts, dependencies with broad impact, or breaking changes.
- The landing page now uses `docs/app/components/content/LandingPage.vue` and
  `docs/app/components/content/LandingWorkbench.vue`; keep further landing
  polish in those files unless a broader docs structure change is approved.

When you stop, summarize:
- role chats or sub-agents run
- commits created or reviewed
- current .agents/NEXT.md action
- blockers or human decisions needed
```
