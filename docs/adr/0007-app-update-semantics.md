# 7. App-update semantics: `policy` is authoritative

## Status
Accepted

## Context
The live configuration returns `policy: recommended` with `minimumVersion: 1.5.0` against the installed `1.0.0`. If `minimumVersion` alone gated blocking, a version-only rule would lock a reviewer out of the entire app on first launch.

## Decision
`policy` decides the behavior, not a version comparison alone. `recommended` renders a dismissible banner carrying the CMS message. `required` combined with an installed version below `minimumVersion` renders a blocking screen. `minimumVersion` alone never blocks.

## Consequences
The CMS can publish a minimum version for informational purposes without accidentally locking out every guest before `policy` is explicitly set to `required`.
