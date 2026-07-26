# 19. Form block presentation: platform-native field layout and a fill-space success card

## Status
Accepted

## Context
[[0011-form-block-modelling]] settled the `formBlock` data shape and the dev-only `FormFixtureScreen` used to review it, but left its visual presentation and the post-submit confirmation screen unspecified — both were prototyped and decided on `prototype/form-block-variants` and need recording before that branch's work is treated as done and merged.

Three variants were prototyped for the field layout (a glass ticket card, a sectioned journey, a conversational docked CTA) per [[0012-platform-native-presentation]]'s iOS-glass/Android-Material split. The confirmation screen started as a single line of centred text on both platforms, which read as an afterthought next to the fielded form above it, and had no way back to the form short of leaving the screen.

## Decision
**Field layout, iOS.** A raised glass "ticket" card (`GlassSurface`, `thinMaterialLight`/`thinMaterialDark`): underline text inputs, pill-shaped `select` options, a native `Switch` for `checkbox`.

**Field layout, Android.** Outlined M3 text fields, no card, no FAB. `select` renders as a connected segmented control (`colors.accent` border, filled segment on selection) rather than the iOS pills — a full-bleed card was prototyped here and explicitly rejected as not matching the rest of the app's Android screens.

**Footer as its own region.** Submit (and any submit-error text) sits in a footer set off from the fields by a hairline (`StyleSheet.hairlineWidth`) and extra top padding, so it reads as the form's closing action rather than the last item in the field list.

**Defaults that avoid an ambiguous empty state.** A `select` field defaults to its first option — an unset segmented control / pill group reads as "nothing answered" even when the field isn't required, which is worse than a slightly presumptive default. `__DEV__`-only prefill (`DEV_PREFILL`, keyed by `blockType`) fills `text`/`email`/`textarea` fields so `FormFixtureScreen` is submit-ready without typing; never bundled into a release build.

**Success is a wax-seal medallion card, not a text line.** A centred circular medallion (`seal-variant` from `@react-native-vector-icons/material-design-icons`, `colors.accent` on `colors.accentContainer`) above the confirmation message reads as "sealed/confirmed" and plays on `colors.accent` already being a sealing-wax terracotta — deliberately not a generic checkmark-in-a-circle. The card follows the same iOS-glass/Android-tonal-elevation split as the fields (`GlassSurface` vs `getElevatedSurfaceStyle`).

**The card fills the available space.** Centring the medallion inside a content-sized box left a large dead gap between the card and the tab bar. Rather than hardcoding a screen-height card, the fix is the standard `flexGrow` pattern: the hosting `ScrollView`'s `contentContainerStyle` opts into `{ flex: 1 }` (`FormFixtureScreen`), `BlockList`'s wrapping `View` does the same so the flex context reaches the blocks it renders, and `FormBlock`'s success container is `flex: 1`. Both changes are additive `flex: 1` on views that previously had no flex behaviour, so they're a no-op for every other screen that renders `BlockList` inside a plain (non-flexGrow) `ScrollView` — confirmed against `HomeScreen` and `MenuScreen`, neither of which sets `flexGrow`.

**Close returns to a cleared idle form.** An X (`accessibilityLabel="Close"`) top-right resets `status` to `idle` and re-derives `values` from the same initializer used on mount (first-option `select` defaults, `__DEV__` prefill) rather than navigating away or leaving stale answers/errors in place.

## Consequences
The form now has a decided look on both platforms instead of an unstyled placeholder, and the success state is reviewable and dismissable in the same dev fixture used for the fields. The `flexGrow` wiring is a small amount of cross-file coordination (`FormFixtureScreen` → `BlockList` → `FormBlock`) for a single visual outcome — anyone adding a new block that also wants to fill the screen inherits the same opt-in mechanism rather than reinventing it, but anyone reading `BlockList` alone won't see why its wrapper has `flex: 1` without this ADR.

As with [[0011-form-block-modelling]], the field-type set and submission endpoint remain assumptions rather than verified facts; this ADR only settles presentation, and both should be revisited together once a real `formBlock` payload exists.
