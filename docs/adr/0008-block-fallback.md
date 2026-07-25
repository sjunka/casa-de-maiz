# 8. Block fallback: safe no-op for unknown or incompatible blocks

## Status
Accepted

## Context
The OpenAPI contract declares more block types (`restaurantHero`, `cta`, `content`, `mediaBlock`, `archive`, `formBlock`) than the live Home/Menu payloads currently return, and a future block type is inevitable.

## Decision
The block registry ([[0003-navigation-source]]-adjacent block registry, see block rendering) maps `blockType` to a component. A block with no registry entry, an incompatible `contractVersion`, or a `channels` entry excluding the running platform falls through to a safe fallback: it renders nothing and logs only the `blockType` in release, and renders a visible marker naming the type in development. The rest of the page still renders.

## Consequences
An unknown or bad block can never crash a screen or block the rest of the page. New blocks are additive: a registry entry, not a screen rewrite.
