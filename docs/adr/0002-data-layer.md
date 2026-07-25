# 2. Data layer: TanStack Query with an AsyncStorage persister, behind a repository

## Status
Accepted

## Context
The app needs request de-duplication, cancellation of obsolete responses, refetch/pull-to-refresh, and a persisted last-good response as an offline fallback — without network work on the render path.

## Decision
TanStack Query owns request lifecycle (dedupe, cancellation, refetch). A thin repository layer sits behind it and owns freshness policy: network first on every launch and refresh, persisted content served only as a fallback on failure and always marked as saved content. Cache key is slug plus the full delivery context plus contract version. An entry past its `nextChangeAt` boundary is discarded rather than shown.

## Consequences
Screens never talk to the network or the cache directly — they read repository state. Freshness rules live in one place and are independently testable.
