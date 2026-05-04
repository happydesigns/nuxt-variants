# Agentic Work Area

This folder contains operational material for AI-assisted development. It is
intentionally separate from root documentation, which is long-lived project
knowledge for humans and agents.

Use this folder for planning, epic breakdowns, task creation, agent role
prompts, work handoffs, review notes, and temporary decisions before they
become stable project documentation.

Do not use this folder as the only home for durable product rules,
architecture, domain model, security requirements, API contracts, deployment
instructions, or contribution standards. Stable knowledge belongs in root
documentation, including the Docus source under `docs/`.

## Workflow

1. Check `.agents/NEXT.md`.
2. Follow `.agents/WORKFLOW.md` and its current operating mode.
3. The planner reads root documentation and updates `.agents/ROADMAP.md`,
   `.agents/EPICS.md`, and `.agents/BACKLOG.md`.
4. The planner turns backlog items into task briefs under `.agents/tasks/ready/`.
5. An implementer takes exactly one ready task, moves it to `in-progress`,
   implements it, verifies it, and moves it to `done`.
6. A reviewer reviews the implementation when the risk classifier, task file,
   or operator requires independent review.
7. Stable decisions are promoted from `.agents/decisions/` into root
   documentation.
