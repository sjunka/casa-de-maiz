# Casa Maiz

A React Native CLI app, TypeScript throughout, that renders the Casa Maiz guest experience entirely from the published Payload CMS content contract (v1.1). This is the project scaffold: a placeholder screen, configuration, and quality tooling that later verticals (client, navigation, Home, Menu, Privacy, resilience, accessibility) build on.

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

- **Android emulator**: the emulator's virtual network reaches the public API directly over `https`; no host-mapping is needed for this deployment.
- **Physical device**: same as the emulator, since the base URL is a public `https` endpoint rather than a machine-local server.

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

## Quality commands

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest, with React Native Testing Library and an in-memory AsyncStorage mock
```

## Source layout

The seven boundaries this codebase is organized around, plus screens on top:

- `src/api` — API transport and configuration (base URL, app version)
- `src/models` — runtime content validation and inferred TypeScript models
- `src/repository` — cache and repository layer
- `src/state` — application state
- `src/navigation` — navigation and destination resolution
- `src/blocks` — CMS block rendering (registry + block components)
- `src/ui` — shared, reusable presentation components (not blocks, not screens)
- `src/screens` — screens, composed from the layers above

Most of these folders are empty at this stage — this ticket establishes the structure; later tickets fill each boundary in.

## Architecture decisions

See `CONTEXT.md` for the domain glossary and `docs/adr/` for the architectural decisions this scaffold and later verticals are built on.

## Screenshots

Placeholder screen on both platforms, captured at scaffold time:

- [iOS Simulator](docs/screenshots/ios-placeholder.png)
- [Android emulator](docs/screenshots/android-placeholder.png)
