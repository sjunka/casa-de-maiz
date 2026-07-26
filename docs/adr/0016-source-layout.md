# 16. Source layout: three layers over seven flat folders

## Status
Accepted

## Context
The assessment names seven boundaries: core, data, navigation, and four presentation concerns (blocks, banners, shared ui/theme, screens). Laid out as seven flat top-level folders, the tree would record what exists but not which direction dependencies are allowed to run, and it would put navigation and observability — both consumed across the other boundaries rather than owned by one of them — on the same footing as the boundaries that do have a single dependency direction.

## Decision
Three layers, each one directory: `src/core`, `src/data`, `src/presentation`. The assessment's seven boundaries map one level down inside them:

- `src/core` — `transport` (HTTP client, error mapping, base-URL config) and `contract` (supported version, delivery-context construction, installed app version, and `contract/models` for the Zod schemas). No internal dependencies; everything else depends on it.
- `src/data` — `repository` (endpoint fetchers, query hooks, cache and freshness policy) and `state` (alert selection, scroll-progress derivation, app-update decisioning, feature flags). Depends only on `core`.
- `src/presentation` — `blocks`, `banners`, `ui`/`theme`, `screens`. Depends on `data` and `core`.

`src/navigation` and `src/observability` sit outside the three layers rather than inside any one of them: both are consumed from multiple layers (navigation's destination resolver is called from blocks, banners and screens alike; observability's crash reporting is called from transport, the block registry and the app root), so nesting either under a single layer would misstate who owns it.

The dependency rule the folder tree encodes: `core` depends on nothing internal, `data` depends only on `core`, `presentation` depends on `data` and `core`. The one rule with a lint gate behind it is narrower than the full graph: `data` must hold no React — no `react` or `react-native` import, enforced by an ESLint `no-restricted-imports` override scoped to `src/data/**` (`.eslintrc.js`) — because `data` is the cache, freshness policy and application state, consumed by presentation rather than rendering itself. Type-only imports are exempted since they vanish at compile time and carry no runtime React dependency.

## Consequences
The allowed dependency direction is visible in the directory tree itself rather than only documented in prose, and a `data` module that starts importing `react` fails lint immediately instead of drifting until a later review catches it. A reviewer checking the boundary list against the filesystem finds a real directory for each of the seven, one level down from three top folders instead of seven.

The cost: a boundary is two directories deep (`src/data/state`, not `src/state`) rather than one, and finding "where does app-update decisioning live" means knowing which layer it falls under first. Flat folders would have made every boundary equally one hop from `src/`.
