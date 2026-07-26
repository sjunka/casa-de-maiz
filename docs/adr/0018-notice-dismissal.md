# 18. Notice dismissal: an undo window in the slot, one exit for every notice

## Status
Accepted

Supersedes the "one slab shape" decision in [0017-banner-presentation](0017-banner-presentation.md) — the inset rounded card that ADR 0017 prototyped and rejected was adopted later (`NoticeCard`, commit b0e3476), once all three notices shared it rather than one of them wearing it alone. The safe-area, animation-in-the-layout, and absolute-content decisions in 0017 still hold.

## Context
Dismissal was a one-way tap on a 14px `×`. The notice vanished, its slot collapsed, and there was no way back: an update notice dismissed by a mis-tap was gone until the next cold start, and an alert dismissal persisted through `recordDismissal` for its whole cooldown. The control that is easiest to hit by accident had the least forgiving result.

The motion was thin too. `CollapsibleBanner` drove opacity, an 8px slide, and height from a single shared value, so a dismissed banner faded while its slot closed underneath it — the card and the page moved together and the eye had nothing to follow.

Three variants were prototyped on a dev tab (a fake three-card stack over a menu): a pure lift with no undo, an in-slot undo row, and a bottom snackbar holding the undo. The in-slot row won. The snackbar is the convention guests know from mail apps, but it puts the undo at the far end of the screen from the control that triggered it and floats over the content the guest is reading — the second sin the banner stack was rebuilt to stop committing.

## Decision
**Dismissal opens an undo window in the notice's own slot.** Pressing `×` swaps the card for an undo row of the same tint: "Notice dismissed", an `Undo` action, and a hairline rule that drains for exactly the length of the window (`UNDO_MS = 4000` in `NoticeCard`). Nothing below the notice moves for those four seconds — the slot is already the right size and the layout stays still while the guest decides.

The notice itself is gone from the moment of the tap. The row is only the window to take it back, so it carries no message, no icon, and no second dismiss control.

**The window is `NoticeCard`'s, the commit is the caller's.** `NoticeCard` owns the pending state and the timer; when the timer fires it calls the same `onDismiss` the caller already passed. Every consumer (`AlertBanner`, `AppUpdateGate`, `OperationalNoticeBanner`) is unchanged — persistence, frequency recording, and suppression still happen exactly where they did, four seconds later. Undo clears the timer and the notice returns; `onDismiss` is never called, so nothing is recorded.

**One exit for every notice.** `CollapsibleBanner` now leaves in three beats rather than one: the content fades (130ms), then lifts 34px and scales to 0.93 while accelerating out of the top (240ms, delayed 70ms), and only then does the slot collapse (260ms, delayed 166ms). The page settles after the card has left instead of being dragged up with it. Entry replays the same beats in reverse. `useReducedMotion` still zeroes every duration.

Because the exit lives in the wrapper and the window lives in the card, all three notice kinds behave identically without any of them knowing about the other two.

## Consequences
A dismissal now takes four seconds to become real. Anything that reads dismissal state must tolerate that delay — including tests, which assert on the notice's `testID` disappearing (the undo row deliberately carries `${testID}-undo`, not the notice's own id) rather than on `onDismiss` having fired.

Unmounting during the window cancels the dismissal rather than committing it: the timer is cleared on unmount, so a guest who dismisses a notice and immediately leaves the screen finds it still there when they return. This is the safe direction (nothing is recorded that the guest did not confirm by waiting), and it, the 4000ms duration, and the lack of any dedup across simultaneously-dismissed notices were reviewed as part of the follow-up ticket (#53) and kept as-is: each is a deliberate default, not an open question.

The undo row's copy ("Aviso descartado", "Deshacer") now comes from `noticeCardStrings` (`src/presentation/banners/noticeCardStrings.ts`), a small local module rather than the CMS — every other string on this surface is CMS-sourced, this pair is not, by decision (#53).

Two constants now split one behaviour: `UNDO_MS` in `NoticeCard` and the exit timings in `CollapsibleBanner`. Anyone retuning "how dismissal feels" has to touch both files.
