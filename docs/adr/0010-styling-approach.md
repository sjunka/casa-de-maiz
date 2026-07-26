# 10. Styling approach: StyleSheet plus local design tokens, no UI kit

## Status
Accepted

## Context
The app must feel native on both iOS and Android, follow system dark mode, text scaling, and reduced motion, and avoid forcing one platform's conventions onto the other. A Material component library would impose Android conventions on iOS.

## Decision
Presentation uses React Native's `StyleSheet` plus a local token set — colour, spacing and typography — with light and dark themes driven by system appearance. No UI kit dependency. Platform-specific files are used only where the difference genuinely improves the experience (iOS back gestures vs. Android system back, safe-area handling, touch targets).

## Consequences
Full control over cross-platform look without fighting a component library's opinions; the cost is writing presentation components by hand instead of importing them.

System appearance being the only input also makes dark mode awkward to *show*: seeing it means leaving the app for system settings. `useTheme` therefore reads an optional in-memory override, surfaced as a gear in the dev-only `FormFixtureScreen` (ADR 0011), so a reviewer can flip the whole app in place. The override is deliberately not persisted and lives behind `__DEV__` — it is a review affordance, not a user preference, so shipped builds still follow system appearance and nothing has to be kept in sync with it.
