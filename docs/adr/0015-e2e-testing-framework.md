# 15. End-to-end testing: Maestro, against a local mock content server

## Status
Accepted

## Context
Unit and component tests (Jest, React Native Testing Library) cover most guest-observable behaviour, but three resilience paths were flagged in the README's Known limitations as under-covered: offline fallback ([[0006-cache-policy]]), expired content past `nextChangeAt`, and an unsupported `contractVersion` ([[0005-contract-version-policy]]). Component tests exercise these by mocking `fetch` and asserting on rendered output in-process — they never touch the real `AsyncStorage` persistence the offline path depends on, the real navigation/tab-shell mount the app boots through, or real elapsed time for the expiry boundary. MSW was considered for the mock layer and rejected for the same reason: it intercepts requests inside the JS runtime under test, which is exactly the boundary these three scenarios need to cross to be trustworthy — a passing MSW-backed test proves the reducer logic works, not that a cold-launched app on a simulator/emulator actually shows the saved-content banner or the retry state.

Detox and Maestro were the two frameworks considered.

- **Detox** runs in-process with the app (grey-box), giving it native synchronization with the JS thread, but requires a dedicated Detox build target, `detox init` scaffolding, a jest-circus test runner wired separately from the unit suite, and a rebuild whenever native code changes. That's a second build system to maintain end-to-end.
- **Maestro** drives the already-built app black-box, over the platform's accessibility tree, from a single CLI with no native project changes, no extra test runner, and no new npm dependency (installed once as a standalone CLI, like Xcode/Android Studio already are per the README's Prerequisites). Flows are declarative YAML, readable without React Native experience, and a flow can call out to a local HTTP mock server directly from a `runScript` step — exactly what these three scenarios need to force a specific response mid-flow (first success, then failure; a version bump) that a live CMS or a static fixture can't reliably reproduce on demand.

Maestro's black-box tradeoff (no direct access to JS-thread state, coarser synchronization) doesn't cost anything here: all three scenarios are asserted purely on rendered `testID`s that already exist for other purposes (`content-saved-banner`, `content-error`, `bootstrap-unsupported-contract`).

## Decision
Maestro flows in `e2e/flows/` drive the app against a small dependency-free Node mock server (`e2e/mock-server.js`) that stands in for the CMS content API, controlled at runtime via a `POST /__control` endpoint. The app is pointed at the mock through `ENVFILE`-selected `.env.e2e.ios` / `.env.e2e.android` (`react-native-config`, [[0002-data-layer]]) rather than a code change — `localhost` for the iOS Simulator, `10.0.2.2` for the Android emulator, both already permitted by the existing `NSAllowsLocalNetworking` (iOS `Info.plist`) and debug-build `usesCleartextTraffic` (Android manifest), so no native config changed for this. Three flows cover the acceptance criteria: `offline-fallback.yaml`, `expired-content.yaml`, `unsupported-contract-version.yaml`. Run commands are documented in the README.

## Consequences
E2E coverage requires a native build per platform pointed at the mock env file before running flows (`npm run e2e:build:ios` / `:android`), not just `npm test`; it's a separate, slower step from the Jest suite and not wired into a fast inner loop. The mock server duplicates a small slice of the real envelope shape by hand — acceptable because it only needs to produce the three shapes these scenarios require, not the full CMS contract. Detox remains the fallback if a future scenario needs JS-thread-level control (e.g. asserting on React Query cache state directly) that black-box driving can't reach.
