# 4. Destination resolution: one central resolver, keyed on path

## Status
Accepted

## Context
Navigation targets arrive from multiple surfaces (nav items, alert actions, CTA blocks, rich-text links). Alert actions carry only `href`, no key, so a key-first resolver would need a second code path for alerts. Path is the only identifier present on every surface.

## Decision
A single destination resolver takes an `href` or destination `path` string and returns an internal destination, an external URL, or unsupported. Pattern table: `/`, `/menu`, `/legal/:key`, `/reservas`. External URLs are accepted only with an `https` scheme and only after the system confirms it can open them. Unsupported internal destinations do not navigate and surface a user-safe message.

## Consequences
Every tappable CMS link — nav item, alert action, block CTA, rich-text link — routes through the same safety and correctness rules.
