# Known limitations and next steps

Deliberately deferred, with reasoning:

- **Generated OpenAPI types.** Rejected outright, not deferred — see [Types strategy](ARCHITECTURE.md#types-strategy).
- **Five block types on a best-effort renderer.** `restaurantHero`, `cta`, `content`, `mediaBlock` and `archive` are declared by the OpenAPI contract but the contract publishes no field shapes for them — no live Home or Menu payload has ever served one to check a shape against. Each renders through `GenericBlock`, which reads only generically-named optional fields (`heading`/`title`, `richText`/`content`, `media`/`image`, `link`/`href`, `label`) and renders nothing if none are present, rather than guessing at an unpublished schema (see [ADR 0008](adr/0008-block-fallback.md)).
- **Alert triggers beyond `load` and `scrollPercent`.** Both are implemented. `scrollPercent` is unverified against live content — the CMS currently publishes only a `load` trigger, so the field name (`trigger.scrollPercent`) is taken from the contract and covered by tests rather than by a real payload. Any further trigger type falls through to the same "render nothing" path as an unsupported placement.
- **A connectivity library.** Offline is derived from request failure instead, which already covers the case a connectivity library wouldn't (reachable network, unreachable API) and avoids an extra dependency.
- **Reservations.** A local placeholder screen — no reservation API is documented for this contract version.
- **Performance instrumentation.** The timing boundary exists but is not wired to a metrics backend — see [Observability](OBSERVABILITY.md). Without it, time-to-first-content can only be measured as launch time plus CMS latency rather than as one number; both halves are measured in [Profiling](PROFILING.md).
- **Touch targets 4 dp under Material on Android.** The carousel arrows and the notice dismiss button are sized to the iOS 44 pt minimum on both platforms, where Android specifies 48 dp — measured in [Profiling](PROFILING.md). The fix is a per-platform minimum-target token rather than a one-off size.
- **The notice stack at the largest text sizes.** Three simultaneous notices fill the viewport at iOS `accessibility-extra-extra-extra-large`, so Home is reachable only after dismissing them. They are all dismissible, but the stack should cap its height and scroll past a threshold.
- **No screen-reader pass.** Labels and touch targets were verified from the accessibility tree, which is not the same as confirming announcement order and focus movement under TalkBack and VoiceOver.
- **Universal Links / Android App Links.** Out of scope: no domain the assessment lets us verify ownership of. The `casamaiz://` custom scheme is implemented ([ADR 0013](adr/0013-deep-linking.md)).

With more time: broader E2E coverage beyond navigation, forms and alerts (deep-linking, error-state screenshots), and visual regression snapshots on both platforms.
