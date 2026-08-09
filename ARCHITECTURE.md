# Architecture

Nuxt Variants is a capability model for Nuxt page types. A registry describes
which small capabilities a page variant owns, and the module projects that one
model into runtime layout behavior, generated TypeScript types, Nuxt Content
schemas, diagnostics, and development tooling.

## Product Boundary

Nuxt Variants owns:

- a named, directed inheritance graph;
- deterministic config resolution for graph entries;
- generated names and resolved config types;
- schema composition from the same graph;
- diagnostics and inspection tooling.

It does not own component styling, page rendering, content sources, routing,
feature rollout, experiments, or a CMS. Applications and UI layers decide what
a capability means and how it is rendered.

## Sources Of Truth

The variant registry is structural and evaluated at build time. It defines all
known names and every `extends` relationship. The same exported registry object
should be passed to the Nuxt module and to the Nuxt Content schema resolver.

`app.config` is a runtime value layer. It may override `config` and the active
state of an existing registry entry, but it must not add entries or change the
inheritance graph. Keeping structural changes out of `app.config` ensures that
runtime behavior, generated types, and collection schemas cannot silently use
different graphs.

## Layer Composition

Nuxt layers contribute registry entries through normal Nuxt configuration
merging. A consuming application may add entries or replace a complete entry.
The final registry produced by Nuxt is validated as one graph before generated
artifacts are written.

Runtime value overrides remain in each layer's `app.config`. Nuxt's app config
merge determines their value priority; Nuxt Variants does not maintain a
second, competing layer merge algorithm.

## Resolution

For an active entry, parents are resolved before the child. Later parents take
priority over earlier parents, and the child takes priority over all parents.
Within each entry, `app.config` values take priority over registry defaults.
Objects merge deeply and arrays replace earlier arrays.

Inactive entries contribute neither features nor config. An inactive parent is
skipped without disabling its child.

## Validation

Structural graph errors are build errors:

- a registry or runtime override contains an unknown field;
- an entry extends an unknown parent;
- the graph contains an inheritance cycle;
- runtime app config attempts to add an unknown entry;
- runtime app config attempts to define `extends`.

Schema registry mismatches remain startup errors in `content.config.ts`.
Advisory diagnostics such as unused entries may be reported without failing a
build.

## Generated Artifacts

Build-time templates expose the normalized registry, graph, diagnostics, and
consumer-specific types. Production runtime code should consume generated
static data instead of storing the registry in public runtime config.

Development-only provenance and inspector data must not be included in the
production client or server routes.

## Stability Contract For 1.0

The 1.0 public contract includes:

- module options and registry input forms;
- config resolution and array replacement order;
- public composables and their return shapes;
- package exports and virtual module names;
- generated public types;
- schema resolver behavior and supported validator adapters;
- diagnostic codes and severity meanings.

Internal template filenames, DevTools endpoints, and inspector payload shapes
remain internal unless explicitly documented otherwise.
