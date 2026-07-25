# 9. Media strategy: pure resolver over React Native's own `Image`

## Status
Accepted

## Context
Media objects can carry absolute CDN URLs or relative Payload paths, multiple named sizes, and declared dimensions. Layout must not shift while an image loads, and no image dependency should be added for what a pure function can do.

## Decision
Media resolution is a pure function: it prefers `mobileImage` over `image` where a block offers both, selects the smallest `sizes` entry whose width covers the container width times device pixel ratio, falls back to the base URL, resolves relative Payload paths against the configured base URL ([[0001-types-strategy]]-adjacent config) while passing absolute CDN URLs through unchanged, and derives an aspect ratio from declared width/height so layout is reserved before load. React Native's own `Image` renders the result — no image library is added.

## Consequences
Image selection and layout reservation are unit-testable without rendering a screen. A relative-path CMS response and an absolute-URL one are handled by the same function.
