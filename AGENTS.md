# AGENTS.md

Follow the repository documentation.

Start with:

1. `README.md` - project purpose, setup, and usage
2. `CONTRIBUTING.md` - contribution standards, scope, code quality, testing,
   security, dependencies, commits, and review expectations

## Additional Context

Check these documents when they are present and relevant:

- `docs/` - Docus documentation source for public guides and examples
- `ARCHITECTURE.md` - system structure, boundaries, data flow, and major technical decisions
- `DESIGN.md` - product UX, design system, theming, and branding rules
- `SECURITY.md` - security policy, privacy rules, sensitive data handling, and audit expectations
- `API.md` - public API, automation, OAuth, MCP, and integration contracts
- `DEPLOYMENT.md` - hosting, runtime targets, environment configuration, and release notes
- `DOMAIN_MODEL.md` - durable domain concepts, entities, relationships, and rules
- `EXTENSIONS.md` - extension strategy, plugin boundaries, hooks, and customer extension rules

Keep project knowledge in normal documentation files. Do not introduce
assistant-specific folders or tool-only instruction files unless they are
explicitly part of the project setup.

## Agentic Work Area

Operational planning for AI-assisted development lives in `.agents/`.

Before asking what to do next, check `.agents/NEXT.md` and
`.agents/WORKFLOW.md`.

After completing any implementation, review, planning, or integration task,
tell the user:

- what changed
- what was verified
- whether separate review is required and why
- the commit hash, unless a stop condition prevented committing
- what to do next
- the exact prompt to paste into the next chat, based on `.agents/NEXT.md` and `.agents/WORKFLOW.md`

Use `.agents/` for temporary or frequently changing work such as roadmap
snapshots, backlog grooming, epic breakdowns, task briefs, role prompts,
implementation handoffs, review notes, and proposed decisions.

Do not put durable product, architecture, design, security, API, deployment, or
contribution rules only in `.agents/`. Promote long-lived decisions back into
root documentation when they become stable.

## Module Safety

`@happydesigns/nuxt-variants` is already working. Do not change module runtime
behavior, generated public types, virtual module names, schema helper
contracts, or documented options without first writing a high-level plan and
getting operator approval.
