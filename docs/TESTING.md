# Quality and testing

## Commands

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest, with React Native Testing Library and an in-memory AsyncStorage mock
```

All three pass on `main`: no type errors, no lint errors (five pre-existing `no-bitwise` warnings in the Lexical rich-text renderer, where bitwise flags are the format Lexical itself uses), 179 tests across 43 suites green.

Tests assert user-observable behaviour through stable selectors (accessibility roles, labels and test IDs) rather than private implementation details.

## Required coverage

The assessment names six minimum cases. Each maps to a test file:

| Required case | Covered by |
|---|---|
| Required query-context construction | `__tests__/core/contract/deliveryContext.test.ts`, `appVersion.test.ts` |
| Contract-version validation | `__tests__/core/contract/models/contractVersion.test.ts` |
| One successful CMS block-rendering path | `__tests__/presentation/screens/HomeScreen.test.tsx`, `presentation/blocks/BlockList.test.tsx` |
| Unknown-block handling | `__tests__/presentation/blocks/UnknownBlock.test.tsx` |
| One cache / error / offline fallback scenario | `__tests__/data/remote/cache.test.ts`, `core/transport/client.test.ts` |
| One bootstrap-driven behaviour | `__tests__/data/logic/selectActiveAlert.test.ts`, `featureFlags.test.ts`, `decideAppUpdate.test.ts`, `navigation/TabNavigator.test.tsx` |

Beyond the minimum: alert frequency policy, scroll-progress triggers, destination resolution, deep linking, media URL resolution, form submission, rich text, theming, reduced motion, reduce transparency, and crash reporting.

## End-to-end tests

Scenarios that depend on real navigation, persistence and timing rather than a scripted `fetch`: offline fallback, expired content, an unsupported contract version, tab navigation, a CMS-published alert, and a form submission. Maestro-driven, against a local mock content server; see [ADR 0015](adr/0015-e2e-testing-framework.md).

```sh
npm run e2e:mock-server    # terminal 1 — mock CMS content API on :4001

npm run e2e:build:ios      # terminal 2 — build & launch pointed at the mock (once per change)
npm run e2e:ios            # run the flows against the iOS Simulator

npm run e2e:build:android  # Android emulator must already be running
npm run e2e:android
```

Flows live in `e2e/flows/`. The `.js` files in that directory drive the mock server's state (a failing home endpoint, a near-expiry `nextChangeAt`, an unsupported contract version, a top-bar alert) so each flow starts from a known server condition.

## Accessibility checks

Interactive elements expose roles, labels, states and a minimum touch target through `AppPressable` (`__tests__/presentation/ui/AppPressable.test.tsx`). Dynamic type, dark mode, Reduce Motion and Reduce Transparency each have a hook with its own test under `__tests__/presentation/theme/`.

Measured results — accessibility-tree labels, touch-target sizes, and both platforms at their largest text settings — are in [Profiling and accessibility notes](PROFILING.md), including two findings the tests do not catch.
