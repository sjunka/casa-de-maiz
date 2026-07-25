# 6. Cache policy: network-first, hard expiry on `nextChangeAt`

## Status
Accepted

## Context
Guests need the app to be useful offline, but must never see targeted content past the boundary the CMS declared for it.

## Decision
Every launch and refresh goes to the network first. The persisted last-good response ([[0002-data-layer]]) is served only when a request fails, and is always marked as saved content in the UI. `nextChangeAt` is a hard expiry: an entry past its boundary is discarded rather than shown, and the guest gets the retry state instead. Offline is derived from request failure, not a connectivity library — a reachable network with an unreachable API is the same user-facing situation.

## Consequences
No separate connectivity dependency. A guest can never act on expired targeted content, even offline.
