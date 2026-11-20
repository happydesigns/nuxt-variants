# Contributing

Read `README.md` before making changes.

This document defines contribution standards for human contributors and automated coding agents working on `@happydesigns/config-variants`.

## Repository Hygiene

Keep the repository conventional and tool-neutral. Project context should live in normal project documentation such as `README.md`, `docs/`, `ARCHITECTURE.md`, `DESIGN.md`, `SECURITY.md`, `API.md`, `DEPLOYMENT.md`, or `DOMAIN_MODEL.md`.

Avoid assistant-specific workflow folders unless they are explicitly part of the project setup.

## Scope and Change Size

Keep changes focused on the agreed scope. Prefer small, reviewable changes over large rewrites.

Preserve existing module behavior unless the change intentionally modifies it. This package is already working; treat public composables, virtual modules, schema helpers, generated types, and module options as public contracts.

## Implementation Standards

Follow the existing project structure, naming conventions, and coding style. Prefer precise types, explicit data shapes, clear interfaces, and straightforward implementation.

Do not silently swallow errors. Avoid bypassing type, lint, formatting, or static-analysis rules. Suppressions should be local, justified, and used only when the alternative would make the code worse.

## Architecture

Favor simple, readable architecture. Keep core variant resolution logic separate from Nuxt integration details where practical. Keep module entry points thin and put reusable runtime behavior in `src/runtime`.

Document important architectural decisions when they affect future contributors.

Write each Markdown paragraph on one line and let the editor wrap it visually.

## Security and Privacy

Never hardcode secrets, tokens, credentials, or environment-specific endpoints. Do not commit generated local data, uploaded files, private artifacts, logs, or secrets.

Avoid logging sensitive payloads, credentials, personal data, payment data, or internal-only information.

## Dependencies

Do not add new dependencies unless they are necessary for the current change. Prefer well-maintained, widely used packages and update the lockfile when a dependency is added.

Keep ranges shared by workspace packages in the pnpm catalog. The manifests declare each package's dependencies and peer requirements. Link to these files from documentation for supported versions.

## Testing

Add or update tests when changing logic. Prioritize tests for variant graph resolution, deep merge behavior, runtime override behavior, generated public types, Nuxt Content schema merging, and public contracts.

Run `pnpm prepack` followed by `pnpm bench` when changing graph traversal, resolution-plan compilation, or config merging. Compare relative throughput on the same machine; absolute numbers are environment-specific and are not a CI gate.

If tests are not practical for a change, note the reason in the pull request or final summary.

## Release workflow

Run `pnpm release:preview` to preview the changelog and `pnpm release:prepare` to validate the checkout. The package check prints the archive path after installing it in separate core, Comark Content, and Nuxt consumers. To use that build in another project, run `pnpm add /path/to/printed-archive.tgz`.

Run `pnpm run release -r <version>` from a clean checkout to create the local Changelogen release commit and tag. Review the changelog and run `pnpm release:check` before pushing the commit and tag.

Pushing the version tag runs package and documentation checks in [GitHub Actions](.github/workflows/ci.yml). The release job takes its notes from the matching changelog entry and marks prerelease tags accordingly. Publishing the package to npm is a separate step.

## Commits

Use Conventional Commits.

Examples:

- `feat: add project dashboard`
- `fix: validate missing email address`
- `test: add parser cases`
- `docs: update deployment notes`
- `refactor: extract storage adapter`

Avoid vague commit messages such as `update`, `fix stuff`, `changes`, or `wip`.

## Review Checklist

Before finishing a change, verify that it:

- matches the agreed scope
- follows repository conventions
- does not introduce unrelated changes
- does not add unnecessary files or dependencies
- preserves existing behavior unless intentionally changed
- includes relevant tests or has a clear reason why tests are not needed
- updates documentation when relevant
- avoids leaking secrets, private data, or environment-specific values
