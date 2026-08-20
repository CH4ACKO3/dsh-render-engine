# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

DSH plugin developers evaluating or debugging the three `dsh-render-engine` browser services in a local development environment.

## Product Purpose

The private integration consumer proves that Shiki tokenization, structured syntax highlighting, and safe HTML rendering work together inside the real DSH browser Cordis runtime. Success means a developer can both inspect the automated result and see the rendered output without adding UI to any published package.

## Positioning

The probe consumes the same public Cordis services that another DSH plugin would use; it does not call package internals or duplicate the rendering path.

## Operating Context

It runs only from `integration/consumer` in an isolated local DSH Web Profile. The three packages under `packages/` remain the only npm publication targets.

## Capabilities and Constraints

- Executes the integration assertions automatically when DSH loads the plugin.
- Provides a language selector, editable source, rendered preview, structured Tokens view, and escaped HTML view.
- Supports collapse and reopen for inspecting the host interface.
- Must remain private and must not become a fourth published plugin.

## Evidence on Hand

The integration result is written to `data-dsh-render-engine-integration` on the document element and logged with the `[dsh-render-engine:integration]` prefix. Desktop, mobile, and current-user-viewport captures live under `.impeccable/review/`.

## Product Principles

- Test the public service boundary end to end.
- Keep preview UI outside the published packages.
- Make failures explicit and machine-readable.
- Preserve the DSH host application's normal operation.

## Accessibility & Inclusion

The preview supports keyboard focus, labeled form controls, an ARIA tab interface, and responsive desktop and mobile layouts.
