# 11. Form block: modelled on Payload's form-builder shape, submissions mocked by default

## Status
Accepted

## Context
The OpenAPI contract declares a form-submission request/response pair but no block schemas at all ([[0008-block-fallback]] already notes `formBlock` as contract-known but unimplemented). Neither the live Home nor Menu payload serves a `formBlock`, so its shape is unobservable against real traffic. The assessment is explicit that test submissions must never reach the shared public API.

## Decision
`formBlock` is modelled on Payload's form-builder plugin shape (`form.id`, `form.fields[]` each carrying its own `blockType`, `submitButtonLabel`, `confirmationMessage`), on the grounds that this API is a Payload deployment and that is the best-supported guess available with no contract to check it against. Rendering only supports `text`, `email`, `textarea`, `checkbox` and `select` field types; any other field type is skipped rather than failing the block. If the block's shape does not match the schema at all, the existing block registry ([[0008-block-fallback]]) falls through to `UnknownBlock` exactly as it does for any other malformed or unrecognised block — a wrong guess degrades no differently than today's behaviour.

Submission is real client code against the documented request/response shape, but `ENABLE_LIVE_FORM_SUBMISSIONS` gates it: unset (the default in every build, including release), submissions resolve against a local mock instead of calling the network. Setting it to `"true"` is required to reach the real endpoint. This mirrors the existing `Config`-driven override pattern used for `FEATURE_FLAG_OVERRIDES`.

Because no live page serves a `formBlock`, a dev-only `FormFixtureScreen` renders the block from a local fixture so it is reviewable at all.

## Consequences
The block is reviewable and testable despite an unobservable contract, and a wrong shape guess never regresses existing behaviour. The cost is that the field-type set and submission endpoint path are assumptions, not verified facts, and must be revisited once a real `formBlock` payload or OpenAPI block schema becomes available.

**Superseded in part.** This ADR left the field layout and the post-submit confirmation screen unstyled (a single line of centred text). Both were decided in [[0019-form-block-presentation]] — platform-native field layout per [[0012-platform-native-presentation]] and a fill-space wax-seal confirmation card with a close-to-idle reset. The data-shape and mocked-submission decisions above still hold.
