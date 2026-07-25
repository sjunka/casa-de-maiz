# 5. Contract-version policy: major-equal, minor-greater-or-equal

## Status
Accepted

## Context
The client must survive an additive CMS change without a binary release, but must not silently misinterpret a breaking one.

## Decision
Envelope compatibility is major-equal, minor-greater-or-equal: contract `1.1` and any future `1.x` are accepted; `2.x` and `1.0` are rejected into an unsupported-contract state. Each block additionally carries its own `contractVersion` and `channels`; the renderer re-checks both client-side even though the server already filters, so a single incompatible block degrades without taking down the page.

## Consequences
A minor CMS change (new optional field, new block) never requires an app update. A major change fails safely instead of rendering garbage.
