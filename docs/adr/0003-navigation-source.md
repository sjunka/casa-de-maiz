# 3. Navigation source: `bootstrap.navigation` is authoritative

## Status
Accepted

## Context
The response also contains `experience.navigation`, the raw Payload document with record ids and per-platform paths identical to the public ones. Modeling both would duplicate a source of truth.

## Decision
`bootstrap.navigation` — the shape the OpenAPI contract declares — is the only navigation source consumed by the app. `experience.navigation` is deliberately left unmodeled, exercising the tolerate-additive-fields rule from [[0001-types-strategy]].

## Consequences
A future change to `experience.navigation` cannot break the app, since nothing reads it.
