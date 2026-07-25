# 1. Types strategy: Zod schemas as the single source of truth

## Status
Accepted

## Context
The CMS contract needs runtime validation, not just compile-time types. Generated OpenAPI types give no runtime guarantee, and the live API already returns fields the public contract doesn't declare — two sources of truth (generated types + hand validation) would drift apart.

## Decision
Zod schemas describe only the fields the app consumes and tolerate additive fields the contract doesn't promise. TypeScript types are inferred from the schemas with `z.infer`.

## Consequences
A malformed or incompatible response is caught at the API boundary, not deep in a component. Adding a field the app cares about means widening a schema, not regenerating a client.
