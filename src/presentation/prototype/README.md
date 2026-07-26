# Prototype — tab bar chrome

**Question:** now that the tab bar has icons, what shape should the app chrome
take — and how far should the iOS glass / Android Material split (ADR 0012)
extend beyond the tab bar?

Three variants, switched at runtime from the black pill at the top of the
screen. `__DEV__` only. Each variant still diverges per platform: the variant
picks the *structure*, `Platform.OS` picks the *material*.

| Variant | Tab bar | Cards |
| --- | --- | --- |
| A — Anchored | Full-bleed, flush to the edge, icon over label | Radius 12, light elevation |
| B — Floating pill | Detached rounded bar, inset; only the active tab shows its label | Radius 20, stronger elevation |
| C — Icon rail | Compact icon-only bar, active marked by a top indicator line | No surface; hairline dividers |

Run `npm run ios` / `npm run android` and tap `‹` `›` to cycle.

## Folding a winner in

1. Inline the winning branch in `AppTabBar.tsx` and `ui/Surface.tsx`, drop the
   `chrome` prop and the `useChrome()` call.
2. Delete this directory and `PrototypeChromeProvider` from `App.tsx`.
3. Update ADR 0012 — it still names `AndroidTabBar.tsx` and
   `TabBarBackground.tsx`, which this branch replaced with the single
   `AppTabBar.tsx`.

The full set of variants stays on this branch as the primary source; main
should only ever get the decision.
