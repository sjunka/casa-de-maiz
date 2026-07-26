# 12. Platform-native presentation: iOS glass, Android Material

## Status
Accepted

## Context
[[0010-styling-approach]] already commits to platform-specific files "where the difference genuinely improves the experience," but until now the Android build was pixel-identical to iOS: no `Platform.select` in presentation code, no ripple on any `Pressable`. The bonus brief asks for a tasteful iOS glass treatment and a distinct Android Material adaptation, not a palette swap.

## Decision
**iOS.** The tab bar background and the top-placement `AlertBanner` render over a real `UIVisualEffectView` material via `@react-native-community/blur`'s `BlurView` (ships Fabric codegen; verified to build against RN 0.86 New Architecture, so the ADR 0008-style contingency of a hand-written Fabric fallback was not needed). Both are wrapped by a shared `GlassSurface` component (`src/ui/GlassSurface.tsx`) that checks `useReduceTransparency` — a hook copying the shape of `useReducedMotion`, backed by `AccessibilityInfo.isReduceTransparencyEnabled()` and a `reduceTransparencyChanged` listener — and swaps the blur for an opaque surface, live, whenever the setting changes rather than only at mount. Cards remain opaque throughout; only the tab bar and the alert banner get the material.

**Android.** Material conventions are applied structurally:
- A single shared `AppPressable` (`src/ui/AppPressable.tsx`) replaces every raw `Pressable` call site. It sets `android_ripple` on Android and an opacity-on-press style on iOS, so all interactive elements changed together instead of one at a time.
- `ColorTokens` gained `surfaceElevated` plus a `getElevatedSurfaceStyle` helper (`src/theme/tokens.ts`) that resolves per platform: a tonal `surfaceElevated` background with `elevation` on Android, a hairline border and soft shadow on iOS. Components ask the token layer for elevation rather than branching on `Platform.OS` themselves.
- `@react-navigation/bottom-tabs` has no built-in Material 3 active-tab indicator, so Android gets a fully custom `tabBar` (`src/navigation/AndroidTabBar.tsx`): each tab is an `AppPressable`, and the focused tab shows a tonal pill behind its label. iOS keeps the library's default tab bar with `tabBarBackground` pointed at the glass material (`src/navigation/TabBarBackground.tsx`).

Deliberately out of scope: Material typography (Roboto is already the Android system font) and Material You dynamic colour (fights the fixed brand palette).

Separately, `android/gradle.properties` still had the React Native template's default `edgeToEdgeEnabled=false`, while `targetSdkVersion` is already 36 — Android 15+ enforces edge-to-edge display regardless of that flag, so content was drawing behind the system bars without React Native's inset wiring. Flipped to `true`; `SafeAreaProvider` already wraps the app root and the new `AndroidTabBar` reads `insets.bottom`, so this closes the gap rather than opening a new one.

## Consequences
The two platforms now visibly diverge in the tab bar — the component the brief calls out as the direct counterpart between the two treatments — and every interactive element gives platform-appropriate feedback from one shared component each, rather than per-call-site duplication. The cost is two new small native/JS surfaces (`GlassSurface`, `AndroidTabBar`) to maintain, and a new native dependency (`@react-native-community/blur`) that only iOS uses.
