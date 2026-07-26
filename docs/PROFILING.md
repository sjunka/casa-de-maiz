# Profiling and accessibility notes

Measurements, not claims. Everything below was captured on 26 July 2026 against
the release build and the live CMS, with the commands shown so it can be
re-run.

**Setup:** Android — release APK (`arm64-v8a`, JS bundled) on a Pixel-class
emulator (`neotox`, 1080×2400, 420 dpi, Android 16). iOS — iPhone 17 Pro
simulator, iOS 26.2. Both are emulated hardware, so treat the numbers as
relative rather than as device-accurate; a simulator does not model thermal
throttling, real GPU limits, or a cold page cache.

## Startup

Cold launch to first frame, `adb shell am start -W`, app force-stopped between
runs:

```sh
adb shell am force-stop com.casamaiz
adb shell am start -W -n com.casamaiz/.MainActivity
```

| Run | 1 | 2 | 3 | 4 | 5 | Median |
|---|---|---|---|---|---|---|
| TotalTime (ms) | 349 | 220 | 234 | 320 | 235 | **235** |

That is launch to first frame, which is the loading state — not content. Time
to first content is that plus the CMS round trip, measured separately below,
because the app has no startup instrumentation to report a single end-to-end
number. Adding one (an `os_signpost` on iOS, a trace section on Android, fired
when the first block renders) is the obvious next step and is what the
[repository/query boundary](ARCHITECTURE.md) exists to make easy.

## CMS latency

Three runs per endpoint from the development machine, with the required
delivery-context parameters:

```sh
curl -s -o /dev/null -w "ttfb=%{time_starttransfer}s total=%{time_total}s size=%{size_download}B\n" \
  "$BASE/api/content/v1/bootstrap?platform=android&market=MX&audience=guest&appVersion=1.0.0"
```

| Endpoint | TTFB (best–worst) | Payload |
|---|---|---|
| `/bootstrap` | 0.32 – 0.55 s | 12.1 KB |
| `/pages/home` | 0.31 – 0.40 s | 20.7 KB |
| `/pages/menu` | 0.32 – 0.51 s | 19.1 KB |
| `/legal/privacy_policy` | 0.31 – 0.34 s | 1.0 KB |

The first request of a run is consistently the slowest, which is the Vercel
deployment waking rather than anything in the app. Practical consequence: first
content lands roughly 0.5–0.9 s after launch on a warm network, and the
persisted last-good response is what covers the cold or offline case.

## Scroll performance

`dumpsys gfxinfo` reset immediately before each interaction, read immediately
after. The frame budget is 16.7 ms at 60 Hz.

```sh
adb shell dumpsys gfxinfo com.casamaiz reset
# ...interact...
adb shell dumpsys gfxinfo com.casamaiz
```

| Surface | Frames | Janky | p50 | p90 | p95 | p99 |
|---|---|---|---|---|---|---|
| Home, vertical (18 swipes) | 833 | 4.2% | 17 ms | 18 ms | 22 ms | 26 ms |
| Menu, vertical (10 swipes) | 372 | 5.4% | 17 ms | 17 ms | 18 ms | 19 ms |
| Carousel, horizontal paging (10 swipes) | 291 | 7.2% | 17 ms | 17 ms | 18 ms | 23 ms |

No missed vsyncs and no slow bitmap uploads on any run, which is the signal
worth watching given how image-heavy the CMS content is. The p99 on Home (26 ms)
comes from the frames where new cards with images enter the viewport.

One measurement to discard rather than believe: swiping horizontally on the
promo rail reported 50% janky frames over a sample of **16 frames**. The rail
currently has a single card, so there was nothing to scroll and the sample is
just idle noise. Recorded here because a 50% figure with no sample size next to
it is exactly the kind of number that gets repeated out of context.

## Memory and size

After launch plus the scroll runs above (`adb shell dumpsys meminfo`):

| Metric | Value |
|---|---|
| Total PSS | 253 MB |
| Total RSS | 353 MB |
| Native heap | 154 MB |
| Dalvik heap | 9 MB |
| Release APK (arm64-v8a) | 32.0 MB |
| iOS release JS bundle | 5.3 MB |

Native heap dominates, which is expected for Hermes plus the image decoding
buffers.

## Accessibility

### Labels and touch targets

The Android accessibility tree was dumped with `adb exec-out uiautomator dump`
on Home and every clickable node measured (420 dpi, so 1 dp = 2.625 px):

| Control | Before | After |
|---|---|---|
| Tab bar items | 82–103 × 52 dp | unchanged, already over both minimums |
| Notice actions ("Ir a menú") | 36 dp tall | **48 dp** |
| Carousel previous/next | 44 × 44 dp | **48 × 48 dp** on Android, 44 on iOS |
| Notice dismiss | 20 dp visual + `hitSlop={12}` = 44 dp | 20 dp visual + `hitSlop` = **48 dp** on Android, 44 on iOS |

Every clickable node has an accessibility label — none were missing.

The original sweep found three controls sized to the iOS 44 pt minimum on both
platforms, where Material specifies 48 dp, and notice action pills at just
36 dp. All of them now resolve through one `MIN_TOUCH_TARGET` token
(`src/presentation/theme/tokens.ts`) that returns 48 on Android and 44 on iOS,
alongside the other platform divergences.

Note that `uiautomator` reports visual bounds and cannot see React Native's
`hitSlop`, so the dismiss button still reads as 20 dp in a raw dump. Its
effective target is asserted in
`__tests__/presentation/banners/noticeTouchTarget.test.tsx` instead, which is
the only place the glyph size and the slop are checked together.

### Large text

Android was tested at `settings put system font_scale 1.3` and `2.0`; iOS at
`simctl ui booted content_size accessibility-extra-extra-extra-large`.

At Android 2.0×, everything reflows: notice text wraps to three lines, card
titles and descriptions grow, prices stay visible, and nothing is clipped or
overlapped. The tab bar keeps its icon-only layout, which is exactly why it has
no labels to overflow.

The original sweep found the notice stack dominating the viewport at those
sizes: with three notices active (app update, operational notice, alert) it took
roughly half the screen at Android 2.0× and filled it entirely at the iOS
`accessibility-extra-extra-extra-large` size, leaving Home reachable only after
dismissing them. The three notices now share one container
(`src/presentation/banners/NoticeStack.tsx`) capped at 40% of the screen that
scrolls internally past that point. Re-checked at both settings afterwards:
Home content and the tab bar stay reachable, the stack scrolls to reveal the
rest, and nothing changes at default text sizes.

### What was not tested

No screen-reader pass. TalkBack and VoiceOver cannot be driven from the command
line, and reading labels out of the accessibility tree — which is what was done
above — is not the same as confirming the announcement order and focus movement
a real screen reader produces. That needs a manual pass on a device and is the
first thing to do with more time.
