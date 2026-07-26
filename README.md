# Casa Maiz

A React Native CLI app, TypeScript throughout, that renders the Casa Maiz guest
experience — Home, Menu, Privacy, navigation, alerts, notices and app-update
gating — entirely from the published Payload CMS contract (v1.1). Nothing
editorial is hardcoded.

> **Reviewing this submission?** [**Architecture and trade-offs**](docs/ARCHITECTURE.md) ·
> [**Setup**](docs/SETUP.md) · [**Testing**](docs/TESTING.md) ·
> [**Limitations**](docs/LIMITATIONS.md)

## Demo

<p align="center">
  <img src="docs/media/demo.gif" width="300" alt="Demo: the CMS-driven Home blocks, the Menu tab, the privacy legal document, the reservations placeholder and the CMS form" />
</p>

> 🎬 Prefer video? [Watch the MP4](docs/media/demo.mp4)

## Both platforms

Same content contract, deliberately different chrome: a real
`UIVisualEffectView` behind the iOS tab bar, Material tonal surfaces and
elevation on Android ([ADR 0012](docs/adr/0012-platform-native-presentation.md)).

| Home | Menu | Privacy | Reservations | CMS form | Dark |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ![iOS home](docs/media/ios-01-home.png) | ![iOS menu](docs/media/ios-02-menu.png) | ![iOS privacy](docs/media/ios-03-privacy.png) | ![iOS reservations](docs/media/ios-04-reservations.png) | ![iOS form](docs/media/ios-05-form.png) | ![iOS dark](docs/media/ios-06-home-dark.png) |
| ![Android home](docs/media/android-01-home.png) | ![Android menu](docs/media/android-02-menu.png) | ![Android privacy](docs/media/android-03-privacy.png) | ![Android reservations](docs/media/android-04-reservations.png) | ![Android form](docs/media/android-05-form.png) | ![Android dark](docs/media/android-06-home-dark.png) |

*Top row iOS, bottom row Android.*

## Requirements coverage

Every core requirement in the assessment, and where it lives:

| # | Requirement | Where |
|---|---|---|
| 1 | Foundation with clear boundaries, configurable base URL | `src/core`, `src/data`, `src/presentation` ([layout](docs/ARCHITECTURE.md), [ADR 0016](docs/adr/0016-source-layout.md)) |
| 2 | Typed CMS client: four context params, `Platform.OS`, installed version, contract 1.1, media URLs, dedupe, cancellation | `core/contract/deliveryContext.ts`, `core/transport/client.ts`, `data/remote/` ([ADR 0001](docs/adr/0001-types-strategy.md), [ADR 0002](docs/adr/0002-data-layer.md)) |
| 3 | Block registry rendering every live Home and Menu block; unknown blocks fail safe | `presentation/blocks/registry.tsx` ([ADR 0008](docs/adr/0008-block-fallback.md)) |
| 4 | Bootstrap as configuration: navigation, promotions, feature flags, operational notice, update gate, alerts with placement/trigger/frequency/dismissal/targeting | `data/logic/`, `presentation/banners/` ([ADR 0007](docs/adr/0007-app-update-semantics.md), [ADR 0017](docs/adr/0017-banner-presentation.md), [ADR 0018](docs/adr/0018-notice-dismissal.md)) |
| 5 | Navigation from `bootstrap.navigation`, one destination resolver, validated external links, native back | `navigation/resolveDestination.ts`, `navigation/TabNavigator.tsx` ([ADR 0003](docs/adr/0003-navigation-source.md), [ADR 0004](docs/adr/0004-destination-resolution.md)) |
| 6 | Loading, empty, error+retry, pull-to-refresh, offline/stale, unsupported contract, not found; `nextChangeAt` as a hard expiry | `data/remote/cache.ts`, `presentation/ui/ContentStatus.tsx` ([ADR 0006](docs/adr/0006-cache-policy.md)) |
| 7 | Absolute and relative media, aspect ratio held, alt text | `data/remote/media.ts`, `presentation/ui/CmsImage.tsx` ([ADR 0009](docs/adr/0009-media-strategy.md)) |
| 8 | Safe areas, platform back, touch targets, dynamic type, dark mode, reduced motion, keyboard avoidance | `presentation/theme/`, `presentation/ui/AppPressable.tsx` ([ADR 0012](docs/adr/0012-platform-native-presentation.md), [ADR 0019](docs/adr/0019-form-block-presentation.md)) |
| 9 | Automated tests for all six required cases; typecheck, lint and test all pass | 179 tests, 6 Maestro flows ([Testing](docs/TESTING.md)) |

Bonus, all three categories: **iOS glass** (`presentation/ui/GlassSurface.tsx`,
gated on Reduce Transparency) · **distinct Android Material** (tonal surfaces,
elevation, ripple) · **advanced work** — `casamaiz://` deep links
([ADR 0013](docs/adr/0013-deep-linking.md)), mocked form submission
([ADR 0011](docs/adr/0011-form-block-modelling.md)), runtime Zod validation,
complete alert-frequency behaviour (`always` / `once` / `session` with cooldown
and a 4-second undo window), Sentry crash reporting with source maps
([Observability](docs/OBSERVABILITY.md)), and Maestro E2E flows.

## Quick start

```sh
cp .env.example .env          # API_BASE_URL defaults to the published deployment
npm install
bundle install && (cd ios && bundle exec pod install)
npm run ios                   # or: npm run android (emulator must be running)
```

Node 22, Xcode 26.5+ / Android Studio with a JDK 17. Physical devices, emulator
networking and deep links: [Setup](docs/SETUP.md).

## Quality

```sh
npm run typecheck && npm run lint && npm test
```

179 tests across 43 suites, plus 6 Maestro end-to-end flows covering offline
fallback, expired content, an unsupported contract version, navigation, a
CMS-published alert and a form submission. See [Testing](docs/TESTING.md).

## Docs

- [Architecture, trade-offs, dependency choices, types strategy](docs/ARCHITECTURE.md)
- [Setup: prerequisites, configuration, run commands, deep links](docs/SETUP.md)
- [Quality and testing](docs/TESTING.md)
- [Production observability](docs/OBSERVABILITY.md)
- [Known limitations and next steps](docs/LIMITATIONS.md)
- [`CONTEXT.md`](CONTEXT.md) — domain glossary · [`docs/adr/`](docs/adr/) — 19 decision records
