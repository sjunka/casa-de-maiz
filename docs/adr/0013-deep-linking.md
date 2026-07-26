# 13. Deep links: custom scheme through the existing destination resolver

## Status
Accepted

## Context
Deep-link support is named as optional bonus work in the assessment. Nothing is registered today: `Info.plist` has no `CFBundleURLTypes`, and `AndroidManifest.xml` carries only the `MAIN`/`LAUNCHER` intent filter. What already exists is the useful half — [[0004-destination-resolution]]'s single resolver already maps `/`, `/menu`, `/reservas` and `/legal/:key` to screens and gates external URLs to `https:` only, and `navigationRef.ts` allows navigation from outside React.

Universal Links and Android App Links require `apple-app-site-association` and `assetlinks.json` served from a verified domain, and the only domain in play is the CMS's own deployment, which the assessment forbids modifying. Claiming those link types without being able to verify them would silently fall back to opening a browser — worse than not claiming them.

## Decision
Scope is a custom scheme, `casamaiz://`, registered in `Info.plist` (`CFBundleURLTypes`) and as a `VIEW`/`BROWSABLE` intent filter in `AndroidManifest.xml`. React Navigation's `linking` config is deliberately not used: it would establish a second destination-resolution table running in parallel with `resolveDestination`, and CMS actions and destinations must route through the one centralised resolver. Instead, `src/navigation/deepLinking.ts` strips the scheme down to a path (`casamaiz://menu` → `/menu`) and feeds it through the existing `resolveDestination` / `navigateToResolved`. A URL with any other scheme is rejected before it ever reaches the resolver. A path the resolver marks `unsupported` lands on Home rather than a dead or blank screen.

The tab navigator is built from `bootstrap.navigation` once bootstrap resolves, so a cold-start link can arrive before any screen exists to navigate to. `navigateToResolved` ([[0003-navigation-source]]-adjacent `navigationRef.ts`) now holds the resolved destination in memory when `navigationRef.isReady()` is false and replays it from `NavigationContainer`'s `onReady` callback, once the tab navigator has actually mounted.

## Consequences
One table, one set of tests: any destination the CMS publishes in future becomes deep-linkable with no additional work. The cost is a small pending-navigation queue in `navigationRef.ts` and no Universal/App Link claim — a `casamaiz://` link only works if the user (or a test harness) invokes it directly; a plain `https://` link from outside the app still opens a browser.
