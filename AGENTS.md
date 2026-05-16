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

## Module Safety

`@happydesigns/nuxt-variants` is already working. Do not change module runtime
behavior, generated public types, virtual module names, schema helper
contracts, or documented options without first writing a high-level plan and
getting operator approval.
