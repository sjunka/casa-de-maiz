# 10. Styling approach: StyleSheet plus local design tokens, no UI kit

## Status
Accepted

## Context
The app must feel native on both iOS and Android, follow system dark mode, text scaling, and reduced motion, and avoid forcing one platform's conventions onto the other. A Material component library would impose Android conventions on iOS.

## Decision
Presentation uses React Native's `StyleSheet` plus a local token set — colour, spacing and typography — with light and dark themes driven by system appearance. No UI kit dependency. Platform-specific files are used only where the difference genuinely improves the experience (iOS back gestures vs. Android system back, safe-area handling, touch targets).

## Consequences
Full control over cross-platform look without fighting a component library's opinions; the cost is writing presentation components by hand instead of importing them.
