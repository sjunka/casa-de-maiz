# CONTEXT.md

Domain glossary for the Casa Maiz mobile app. This app consumes the published Casa Maiz Payload CMS content contract (v1.1) and renders the guest experience entirely from its responses. See `docs/adr/` for the architectural decisions built on these terms.

- **Delivery context** — the four query parameters required on every content request: `platform` (derived from `Platform.OS`), `market` (fixed `MX`), `audience` (fixed `guest`), `appVersion` (installed binary version, semver). Built in exactly one module; screens never construct it.
- **Envelope** — the response wrapper around every content request: `{ contractVersion, data, nextChangeAt, preview, resolvedContext }`.
- **Contract version** — the `contractVersion` field (currently `1.1`) declaring the shape of a response. Compatibility is major-equal, minor-greater-or-equal.
- **Block** — one entry in a page's `data.layout` array, identified by `blockType` (e.g. `cardGrid`, `carousel`, `promoRail`, `textBlock`, `restaurantCTA`, `imageBlock`, `formBlock`). Each block also carries its own `contractVersion` and `channels`.
- **Block registry** — the map from `blockType` to the React component that renders it. Adding a block means adding a registry entry, not editing a screen.
- **Destination** — a CMS-published navigation target, found in `bootstrap.navigation`.
- **Destination resolver** — the single function that turns a path or `href` string into an internal route, an external URL, or an unsupported result.
- **Saved content** — the last successful response, persisted locally and served as a read-only fallback when the network is unavailable. Discarded once `nextChangeAt` has passed.
- **Alert** — a CMS-configured notice with a placement (e.g. `topBar`), a trigger (e.g. `load` with `delayMs`), a frequency policy, and optional page targeting.
- **Alert frequency** — `alert.frequency.type` controls how often a shown alert reappears: `always` (every eligible occasion; `cooldownHours` suppresses it only after a dismissal), `once` (never again after being shown, on this device, regardless of dismissal), `session` (at most once per app launch, tracked in memory, not persisted). An unrecognised or missing type behaves like `always` and is never suppressed by default, so the CMS's intent to show content is never silently swallowed.
- **Operational controls** — CMS-driven state describing whether the restaurant is running under a notice (e.g. a closing-time banner) and the current app-update policy.
- **Feature flag** — a named toggle in bootstrap that gates a destination or surface. A destination with no mapped flag is visible by default.
- **Form block** — a `formBlock` modelled on Payload's form-builder shape (`form.id`, `form.fields[]`, `submitButtonLabel`, `confirmationMessage`); see [ADR 0011](docs/adr/0011-form-block-modelling.md). Submissions are mocked by default and only reach the shared API when `ENABLE_LIVE_FORM_SUBMISSIONS` is explicitly set.
- **Elevated surface** — a component background that reads as raised above its parent. Resolved per platform from the token layer (`getElevatedSurfaceStyle` in `src/theme/tokens.ts`): a tonal `surfaceElevated` colour plus `elevation` on Android, a hairline border and soft shadow on iOS; see [ADR 0012](docs/adr/0012-platform-native-presentation.md).
