// Every hand-tuned duration for notice/banner motion, in one place. Previously
// split between `NoticeCard` and `CollapsibleBanner` — "how
// dismissal feels" meant touching both files to retune. `useReducedMotion`
// still zeroes durations at the call site; this file only names the numbers.

// How long a dismissed notice waits in its own slot before the dismissal
// becomes real. Long enough to catch a mis-tap, short enough that the notice
// is not still sitting there when the guest has moved on.
export const UNDO_MS = 4000;

// Evaluator-facing banners (operational notice, alert) auto-dismiss so a fresh
// install can be verified without manually closing every card.
export const BANNER_AUTO_DISMISS_MS = 8000;

// CollapsibleBanner's three-beat exit: the banner gives up its ink, then lifts
// and accelerates out of the top, and only then does the slot close — so the
// page settles after the banner has left rather than being dragged up with
// it. Arriving replays the same beats in reverse.
export const BANNER_FADE_MS = 130;
export const BANNER_RISE_MS = 240;
export const BANNER_RISE_DELAY_MS = 70;
export const BANNER_COLLAPSE_MS = 260;

// SourceMarker: how long the dev-only overlay holds before fading, and how
// long the fade itself takes.
export const SOURCE_MARKER_HOLD_MS = 5000;
export const SOURCE_MARKER_FADE_MS = 300;
