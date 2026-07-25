# Casa Maiz

A React Native CLI app, TypeScript throughout, that renders the Casa Maiz guest experience — Home, Menu, Privacy, navigation, alerts, operational notices and app-update gating — entirely from the published Payload CMS content contract (v1.1). Nothing editorial is hardcoded: the CMS is treated as an external dependency and the app follows whatever it publishes.

## Prerequisites

- Node 22.23.1 — pinned in `.nvmrc`. If you use `nvm`, run `nvm use`.
- Xcode 26.5+ and CocoaPods 1.16+ for iOS.
- Android Studio (SDK, platform-tools, an emulator image) and a JDK 17 for Android. `JAVA_HOME` must point at a JDK 17 install (e.g. `brew install openjdk@17`).
- Ruby + Bundler for CocoaPods (`bundle install`).

## Configuration

Base URL is read from `react-native-config` and must never be hardcoded.

```sh
cp .env.example .env
```

`.env.example` defaults `API_BASE_URL` to the published deployment. `.env` is git-ignored — no secrets or machine-specific values are committed.

- **iOS Simulator**: reaches the public API directly over `https`; no setup beyond the base URL.
- **Android emulator**: the emulator's virtual network reaches the public API directly over `https`; no host-mapping is needed for this deployment. (Only a machine-local server, addressed as `10.0.2.2`, would need special-casing — not the case here.)
- **Physical device**: same as the emulator, since the base URL is a public `https` endpoint rather than a machine-local server. iOS needs the device registered to a signing team in Xcode; Android needs USB debugging enabled and the device authorized (`adb devices` should list it).

## Install

```sh
npm install
bundle install                # once, for CocoaPods
(cd ios && bundle exec pod install)
```

## Run

```sh
npm run ios       # iOS Simulator
npm run android   # Android emulator (must be running first)
```

Physical device:

```sh
npx react-native run-ios --device "Your iPhone Name"
npx react-native run-android --device <adb-device-id>   # id from `adb devices`
```

## Quality commands

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest, with React Native Testing Library and an in-memory AsyncStorage mock
```

All three pass on `main`: no type errors, no lint errors (five pre-existing `no-bitwise` warnings in the Lexical rich-text renderer, where bitwise flags are the format Lexical itself uses), 109 tests green.

## Architecture overview

The app is organized around seven boundaries, screens composed on top:

- `src/api` — transport, delivery-context construction, envelope/contract-version validation, config (base URL, app version)
- `src/models` — Zod schemas and their inferred TypeScript types
- `src/repository` *(folded into `src/api` hooks + `src/api/cache.ts`)* — cache and freshness policy
- `src/state` *(covered by `src/alerts`, `src/appUpdate`, `src/operational`, `src/navigation/featureFlags`)* — bootstrap-driven application state
- `src/navigation` — destination resolution and the tab shell built from bootstrap
- `src/blocks` — the block registry and block components
- `src/ui` / `src/theme` — shared presentation, tokens, dark mode, reduced motion
- `src/screens` — composition only; no screen talks to the network or cache directly

Key trade-offs, and why they sit where they do:

- **Runtime validation over generated types** ([ADR 0001](docs/adr/0001-types-strategy.md)). The live API returns fields the public contract doesn't declare, so a generated client and hand validation would be two sources of truth that drift. Zod schemas describe only what the app consumes, tolerate additive fields, and infer TypeScript types with `z.infer` — one source of truth, and a malformed response is caught at the API boundary instead of deep in a component.
- **TanStack Query behind a thin repository, not a bespoke cache** ([ADR 0002](docs/adr/0002-data-layer.md), [ADR 0006](docs/adr/0006-cache-policy.md)). Query owns request lifecycle (dedupe, cancellation, refetch); the repository owns freshness policy — network-first, persisted last-good response served only on failure and always marked as saved, `nextChangeAt` as a hard expiry. Offline is derived from request failure rather than a connectivity library, since a reachable network with an unreachable API is the same user-facing situation.
- **One destination resolver, keyed on path, not per-surface routing** ([ADR 0004](docs/adr/0004-destination-resolution.md)). Nav items, alert actions, and block CTAs all converge on the same resolver, so every tappable CMS link gets the same safety rules (`https`-only external links, user-safe messaging for unsupported destinations) for free.
- **Contract compatibility is major-equal, minor-greater-or-equal, checked twice** ([ADR 0005](docs/adr/0005-contract-version-policy.md)). The envelope is checked once; each block re-checks its own `contractVersion` and `channels` client-side even though the server already filters, so one incompatible block degrades without taking the page down.
- **Unknown blocks fail safe, not silent forever** ([ADR 0008](docs/adr/0008-block-fallback.md)). A block with no registry entry, a bad version, or an excluded channel renders nothing in release (logging only the `blockType`) and a visible marker in development — new blocks are additive, a registry entry rather than a screen rewrite.
- **No UI kit** ([ADR 0010](docs/adr/0010-styling-approach.md)). `StyleSheet` plus local design tokens, light/dark driven by system appearance, because a Material component library would impose Android conventions on iOS. The cost is presentation components written by hand instead of imported.

See `CONTEXT.md` for the domain glossary and `docs/adr/` for the full set of architectural decisions.

## Dependencies

Every dependency added beyond the React Native CLI template, and why:

| Dependency | Why |
|---|---|
| `zod` | Runtime validation at the API boundary and the single source of truth for types ([ADR 0001](docs/adr/0001-types-strategy.md)) — see Types strategy below. |
| `@tanstack/react-query` | Request de-duplication, cancellation of obsolete responses, and refetch/pull-to-refresh without hand-rolling them ([ADR 0002](docs/adr/0002-data-layer.md)). |
| `@react-native-async-storage/async-storage` | Persists the last-good response for the offline fallback; the standard, officially-mocked choice for this. |
| `react-native-config` | Reads `API_BASE_URL` from `.env` per environment, so the base URL is configurable without editing code. |
| `react-native-device-info` | Reads the real installed app version for the `appVersion` delivery-context parameter, rather than trusting a source-file constant that can drift from the binary. |
| `@react-navigation/native`, `@react-navigation/bottom-tabs` | The tab shell is built at runtime from `bootstrap.navigation`; these provide native-feeling tab and stack navigation without writing a router. |
| `react-native-screens`, `react-native-safe-area-context` | Required peer dependencies of `@react-navigation` for native screen management and safe-area handling (notch, home indicator). |

No image library, connectivity library, crash-reporting SDK, or UI kit was added — each was considered and rejected in favour of a platform primitive or a documented deferral (see Known limitations below).

## Types strategy

Zod schemas, not generated OpenAPI types. Generated types give a compile-time shape with no runtime guarantee — a response that stops matching the contract still gets to the render path. The live API also returns fields the public OpenAPI contract doesn't declare, so a generated client and a hand-written validation layer would become two sources of truth that drift from each other over time. Zod schemas describe only the fields the app actually consumes, tolerate any additive field the contract doesn't promise, and TypeScript types are inferred straight from the schema with `z.infer` — one definition, checked at both compile time and at the API boundary at runtime. Full reasoning in [ADR 0001](docs/adr/0001-types-strategy.md).

## Known limitations and next steps

Deliberately deferred, with reasoning:

- **Deep links.** Out of scope for the timebox; the destination resolver is already the single chokepoint a deep-link handler would hang off, so adding it later doesn't require re-plumbing navigation.
- **`formBlock` and its submission endpoint.** No form UI is built and nothing is submitted to the shared form-submission endpoint; the block falls through to the safe unknown-block fallback like every other unimplemented block type.
- **Generated OpenAPI types.** Rejected outright, not deferred — see Types strategy above.
- **End-to-end testing.** Component and unit tests cover behaviour a guest can observe; a full E2E suite (Detox/Maestro) was judged lower value than breadth of unit/component coverage inside the timebox.
- **Alert triggers beyond `load` and `scrollPercent`.** Both are implemented. `scrollPercent` is unverified against live content — the CMS currently publishes only a `load` trigger, so the field name (`trigger.scrollPercent`) is taken from the contract and covered by tests rather than by a real payload. Any further trigger type falls through to the same "render nothing" path as an unsupported placement.
- **A connectivity library.** Offline is derived from request failure instead, which already covers the case a connectivity library wouldn't (reachable network, unreachable API) and avoids an extra dependency.
- **Crash-reporting integration.** No SDK added — see Production observability below for what would replace this.
- **iOS "glass" and Android Material bonus visual treatments.** Explicitly a bonus in the original spec; core functionality and accessibility were prioritized first and the timebox didn't extend to platform-specific visual flourish beyond what `ADR 0010` already covers (native back gestures, safe areas, dark mode).
- **Reservations.** A local placeholder screen — no reservation API is documented for this contract version.

With more time, in priority order: a crash-reporting SDK at the app root, deep-link handling on top of the existing resolver, E2E coverage of the resilience paths (offline, expired content, unsupported contract version), and the bonus platform-specific visual treatments.

## Production observability

Not built — documented here instead, since no crash-reporting or analytics dependency was added inside the timebox. How each failure mode would be observed in production:

- **Crashes.** No crash-reporting SDK or error boundary exists yet. A crash-reporting SDK (e.g. Sentry or a similar RN-native integration) would wrap the app root and report native and JS crashes with the installed app version and platform attached, both of which the app already reads in one place (`src/api/appVersion.ts`, `src/api/deliveryContext.ts`).
- **Content failures.** Transport failures are already mapped at the boundary (`src/api/client.ts`, `src/api/apiError.ts`) to a user-safe message plus retained technical context (endpoint, status, block type — never full payloads, so production logs can't leak editorial or PII content). Wiring that existing context into a logging backend is the remaining step, not a redesign.
- **Performance.** Screen transitions and first-content timing would be measured via the CMS-fetch boundary already isolated behind the repository/query layer — a single place to time "time to first content" and "time to interactive" without instrumenting every screen individually.

## Screenshots

Captured from the current app on both platforms:

- [iOS Simulator — Home](docs/screenshots/ios-home.png)
- [Android emulator — Home](docs/screenshots/android-home.png)
