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
- Moved landing page copy and structure back into `docs/content/index.md` so
  the page is easier to translate with content files.
- Moved the CodeTree content into Markdown so Docus/MDC owns Shiki syntax
  highlighting instead of a custom regex highlighter.
- Kept the CodeTree on its standard Markdown component path so the file tree,
  code pane, copy button, icons, and highlighting come from Docus.
- Let the CodeTree stretch to the resolver panel height so the hero workbench
  reads as one balanced surface.
- Changed the hero title to positive copy and rendered mental-model code terms
  as actual inline code instead of Markdown backticks inside prop strings.
- Added a combined CodeTree and variant resolver demo for article, landing, and
  event variants.
- Replaced more hand-rolled landing sections with Nuxt UI primitives such as
  `UPageFeature` and `UPageSection` features where the component model fits.
- Added `docs/tsconfig.json` so editors resolve Docus/Nuxt generated types and
  auto-imports for docs Vue components.
- Changed `lint` to a non-mutating check and moved formatting writes to
  `lint:fix`.
- Added Git line-ending attributes so tracked text files stay LF on Windows.
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
- The landing page structure now lives in `docs/content/index.md`, with focused
  interactive/support components in
  `docs/app/components/content/LandingWorkbench.vue`,
  `docs/app/components/content/LandingMentalModel.vue`, and
  `docs/app/components/content/LandingFeature.vue`; keep further landing polish
  in those files unless a broader docs structure change is approved.

When you stop, summarize:
- role chats or sub-agents run
- commits created or reviewed
- current .agents/NEXT.md action
- blockers or human decisions needed
```
