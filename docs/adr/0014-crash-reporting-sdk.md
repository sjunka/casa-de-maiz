# 14. Crash reporting: Sentry, initialised at the app root

## Status
Accepted

## Context
No crash-reporting SDK was wired in ([[0001-types-strategy]]-era scope cut, documented as a gap in the README's Production observability section). The app needs both native and JS crash capture, tagged with the installed app version and platform the app already reads in one place each (`src/api/appVersion.ts`, `src/api/deliveryContext.ts`), plus the existing transport-boundary error context (`src/api/client.ts`, `src/api/apiError.ts` — endpoint, status, error kind) landing in the same pipeline.

Firebase Crashlytics was considered and rejected: it would pull in the whole Firebase native SDK for a single feature, and its React Native crash symbolication is weaker for JS-only errors (the majority of what this app throws, per `ApiError`). A hand-rolled `ErrorUtils.setGlobalHandler` plus a custom HTTP reporter was also considered and rejected — it would mean reimplementing native crash capture, breadcrumbs, and offline queuing that an off-the-shelf SDK already provides correctly.

## Decision
`@sentry/react-native` is initialised once at the app root (`App.tsx`, via `src/observability/crashReporting.ts`), wrapping the root component with `Sentry.wrap` for native and JS crash capture. DSN and environment come from `react-native-config` (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`) — an empty DSN disables reporting entirely, which is the local-dev default. App version and platform are read from the existing single-source modules and set as tags on init, rather than re-derived. Transport errors from `client.ts` are forwarded to Sentry with endpoint, status, and error kind as tags — never the response payload. Unknown or invalid content blocks ([[0008-block-fallback]]) are recorded as breadcrumbs carrying only the block type.

## Consequences
Crash and content-failure visibility now goes through one pipeline instead of `console.error`/`console.warn` alone. Source-map upload for readable stack traces is wired into both release build pipelines — `android/app/build.gradle` applies `sentry.gradle` to wrap the JS bundle task, and the iOS "Bundle React Native code and images" build phase runs through `sentry-xcode.sh` — reading org/project from `ios/sentry.properties` / `android/sentry.properties` and the auth token from a `SENTRY_AUTH_TOKEN` environment variable, never committed. Debug builds skip the upload, so it costs nothing locally.
