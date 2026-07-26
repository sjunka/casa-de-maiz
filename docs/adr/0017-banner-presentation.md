# 17. Banner presentation: one slab stack, one safe-area claim, animated collapse

## Status
Accepted

## Context
Three banners can sit above the tab navigator at once: `AppUpdateGate`'s recommended-update bar, `OperationalNoticeBanner` (the CMS notice described in `CONTEXT.md`), and `AlertBanner`. Each was written independently, and it showed.

Each one read `useSafeAreaInsets()` and added `12 + top` of its own padding. React Navigation re-provides the raw window insets to its screens, so its header added the status-bar height a fourth time. With two banners up, roughly 250px of empty white separated the notice from the page title — the banners appeared to shove the content down rather than sit above it.

Their appearance had drifted too: the update bar was a full-bleed yellow slab, the notice a centred pale-blue slab (`#e6f0ff`, a cold system-info blue that belongs to no other surface in a warm terracotta-and-cream app), the alert a tinted glass bar. Three shapes, three vertical rhythms, three dismiss glyphs at 18px — small enough to read as punctuation rather than a control.

Nothing animated. A banner arriving snapped the page down; dismissing one snapped it back up. For a guest whose goal is reading the menu, both jolts land on the content they were looking at.

## Decision
**One claim on the safe area.** `BootstrapScreen` wraps the whole stack in `SafeAreaView edges={['top']}`. Banners use plain padding, and `TabNavigator` sets `headerStatusBarHeight: 0` — necessary because React Navigation's `SafeAreaProviderCompat` re-provides window insets to its screens and would otherwise ignore the parent's consumption. The inset is paid once, by the topmost element.

**One slab shape.** All three banners are full-bleed, message left-aligned, `paddingVertical: 14 / paddingLeft: 16 / paddingRight: 4`, with a 26px `×` on a 44×44 target. An inset rounded card was prototyped and rejected here: stacked with the update bar it read as two unrelated objects rather than one piece of chrome.

**Superseded.** The inset rounded card was adopted later (`NoticeCard`, commit b0e3476) once all three notices shared it rather than one of them wearing it alone — see [0018-notice-dismissal](0018-notice-dismissal.md). The rest of this decision (safe-area, animation-in-the-layout, absolute-content) still holds.

**Colour carries severity, not decoration.** The `info` tokens moved from cold blue to a warm tonal wash (`#f6e3de` on `#5c2317`; `#3d241c` on `#f0d9d1` dark), siblings of `accentContainer`. That yields a deliberate ladder: yellow update (loudest, blocks a broken app), terracotta alert (accent, campaign-driven), warm notice (quiet, informational). Tokens were retuned at source rather than overridden per call site — nothing else consumed them.

**Arrival and departure are animated, in the layout.** A shared `CollapsibleBanner` (`src/presentation/ui/CollapsibleBanner.tsx`) wraps each banner and owns an animated height driven by one Reanimated shared value: 0 to measured height on entry (260ms ease-out, with a fade and an 8px slide), back to 0 on dismissal (160ms ease-in). Exit is deliberately faster than entry so reclaimed space feels immediate. `useReducedMotion` drops both durations to 0.

The content inside the wrapper is `position: absolute`. This is load-bearing, not styling: laid out normally it is clipped by the wrapper's collapsed height and `onLayout` reports 0, so the banner can never measure itself and never appears. Out of flow, it always measures full size while the wrapper animates around it.

`AlertBanner` records its dismissal in `onExited` rather than `onPress`, so the collapse finishes before the suppression state flips and unmounts it.

`react-native-reanimated` (with `react-native-worklets`) was added for this. `react-native-worklets` must be a direct dependency — as a transitive one, React Native's autolinking does not find its pod. Reanimated's shipped jest mock loads the real module and with it the native worklets binding, so `jest.setup.js` carries a small hand-written mock instead: animations land on their target value at once and completion callbacks fire synchronously.

Skia was evaluated for this and rejected: a GPU canvas for one opacity curve and one height curve.

## Consequences
The banner stack now costs one safe-area inset instead of four, and content stays put when a banner arrives or leaves. New banners get the behaviour by wrapping in `CollapsibleBanner` rather than reimplementing it — the same consolidation `AppPressable` and `GlassSurface` made in [[0012-platform-native-presentation]].

The costs: a native animation dependency the app did not previously have (so a rebuild, not just a JS reload, to pick up), and one non-obvious constraint — the absolutely-positioned content inside `CollapsibleBanner` looks like a styling choice and is not. Removing it silently renders every wrapped banner invisible, with no error.

Dismissal remains component-local state: a notice reappears on the next cold start. That is deliberate for server-controlled trading hours, and differs from `AlertBanner`, whose dismissals persist through `recordDismissal`.
