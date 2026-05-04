# Next Action

This file tells the human/operator what to do next and gives the exact prompt
to paste into the next chat.

Update it after every completed implementation, review, planning, integration,
or workflow task.

## Current Mode

Adaptive Teamflow.

## Current Next Step

Review the documentation scaffold and decide whether to plan module or
playground changes. Do not change module behavior until the operator approves a
high-level plan.

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
