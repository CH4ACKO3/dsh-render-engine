---
name: DSH Render Engine Local Preview
description: A private integration overlay for inspecting DSH's public browser rendering services.
colors:
  accent: "#465bdb"
  accent-soft: "#eef0ff"
  success: "#2e9b59"
  success-text: "#22663d"
  text: "#0f1115"
  muted: "#68707d"
  border: "#dedfe2"
  surface: "#ffffff"
  surface-raised: "#f7f8fa"
typography:
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.5
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: 'var(--ds-font-family-code, "SF Mono", Consolas, monospace)'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  tab: "8px"
  control: "9px"
  editor: "10px"
  launcher: "11px"
  pane: "12px"
  shell: "14px"
  circle: "50%"
spacing:
  xxs: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "14px"
  3xl: "16px"
components:
  overlay-shell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.shell}"
    width: "min(460px, calc(100vw - 32px))"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "32px"
    width: "32px"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.control}"
    rounded: "{rounded.tab}"
    padding: "0 10px"
    height: "30px"
  tab-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.control}"
    rounded: "{rounded.tab}"
    padding: "0 10px"
    height: "30px"
  source-editor:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    typography: "{typography.code}"
    rounded: "{rounded.editor}"
    padding: "12px"
  launcher:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.launcher}"
    padding: "0 14px"
    height: "44px"
---

# Design System: DSH Render Engine Local Preview

## Overview

**Creative North Star: "The Native Debugging Instrument"**

This visual contract belongs only to the private `integration/consumer` preview. Its FORM is `local-extension/no-roll`: a deliberately scoped extension that borrows the established DSH light system UI so it feels native inside the host, without creating or implying a broader repository design system.

The overlay makes the Shiki → Tokens → HTML mechanism directly inspectable. It stays visually quiet and operational: one bordered right-side tool surface, compact system typography, monospace only for code and structured data, and an indigo accent reserved for interaction and focus. Its visual hierarchy supports the public `syntaxHighlighter` and `codeRenderer` service boundary; it does not turn DSH into a dashboard or add UI to published packages.

**Key Characteristics:**

- Private, local, and developer-facing.
- Matched to DSH's restrained light system interface.
- One compact overlay with code-first density.
- Public service output is inspectable in Preview, Tokens, and HTML representations.
- Collapsible so the host interface remains usable.

## Colors

The palette is a cool, nearly neutral light system with one restrained indigo interaction voice and a compact green health signal.

### Primary

- **Instrument Indigo:** The sole interaction accent, used for active tabs, keyboard focus, the text caret, selection, and the collapsed launcher.
- **Washed Indigo:** A low-contrast selected-state fill that keeps the active tab legible without reading as a callout card.

### Tertiary

- **Service Green:** The status dot for a passing integration check.
- **Deep Service Green:** Status copy paired with Service Green for accessible, compact confirmation.

### Neutral

- **Ink:** Primary text and pipeline labels.
- **Slate:** Secondary labels, metadata, and inactive tabs.
- **Cool Hairline:** Borders, dividers, and scrollbar thumbs.
- **White Surface:** The overlay and control surface.
- **Lifted Mist:** Tonal separation for the pipeline, editor, rendered output, and hover states.

### Named Rules

**The One Accent Rule.** Instrument Indigo is the only interactive accent; do not introduce competing action colors.

**The Host-Light Rule.** This overlay always declares a light color scheme and remains visually compatible with the established DSH light UI.

## Typography

**Display Font:** None; this tool has no display layer.

**Body Font:** Native DSH-compatible system sans serif.

**Label/Mono Font:** The host's code font token when available, with SF Mono, Consolas, and generic monospace fallbacks.

**Character:** Compact, neutral, and tool-like. Sans serif carries interface meaning; monospace is reserved for editable source, highlighted code, token JSON, and escaped HTML.

### Hierarchy

- **Title** (650 weight, 14px, 1.5 line-height): Names the tool once in the header.
- **Body** (400 weight, 13px, 1.5 line-height): Establishes the overlay's inherited interface baseline.
- **Control** (400 weight, 12px, 1.5 line-height): Tabs and compact controls.
- **Code** (400 weight, 12px, 1.55 line-height): Editable source and rendered code; rendered Shiki output may open to 1.65 line-height for scanning.
- **Label** (400–650 weight, 11px, 1.5 line-height): Field labels, pipeline metadata, subtitle, and status.

### Named Rules

**The Monospace Boundary Rule.** Use monospace only where the user is reading or editing code, tokens, or HTML; all surrounding interface copy stays in the system sans serif.

## Layout

The expanded desktop preview is a fixed right-side overlay, inset 16px from the viewport, with a maximum working width of 460px. Its four-row grid keeps the header and pipeline intrinsic, gives the editor at least 150px, and gives the output at least 180px with slightly more vertical share. Internal spacing follows a dense 2px–16px rhythm.

At 720px and below, the overlay fills the viewport inside an 8px safe inset. Horizontal editor and output gutters tighten from 16px to 12px. Collapsed state becomes a small launcher anchored to the lower-right corner, preserving access to the host interface.

### Named Rules

**The Host-Presence Rule.** The preview may cover the host while open, but it must always collapse to a small lower-right launcher.

## Elevation & Depth

Depth is structural and restrained. Hairline borders and Lifted Mist tonal surfaces define most grouping; a single ambient shell shadow separates the overlay from DSH, while the launcher receives a smaller indigo-tinted shadow so it remains discoverable when collapsed.

### Shadow Vocabulary

- **Overlay Ambient** (`0 18px 48px rgb(15 23 42 / 18%)`): The expanded tool shell only.
- **Launcher Ambient** (`0 8px 24px rgb(70 91 219 / 28%)`): The collapsed launcher only.

### Named Rules

**The Two-Elevation Rule.** Use ambient shadow only for the fixed overlay and its collapsed launcher; internal panes stay flat and bordered.

## Shapes

The form language is softly rounded but compact: tabs use 8px corners, controls 9px, the editor 10px, the launcher 11px, output containers 12px, and the shell 14px. Borders remain one pixel and neutral. The editor and output visually join through complementary top and bottom corner treatment rather than floating as unrelated cards.

## Components

### Overlay Shell

- **Character:** A focused instrument layered over, but visually belonging to, DSH.
- **Structure:** Four grid rows inside a bordered white shell; content overflow is contained.
- **Responsive behavior:** Right-side desktop tool becomes an 8px-inset viewport surface on narrow screens.

### Header and Collapse Control

- **Header:** One title, one pipeline subtitle, one service status, and a compact chevron control.
- **Status:** Green is informational health state only, never an action.
- **Hover / Focus:** Hover uses Lifted Mist; keyboard focus uses a 2px Instrument Indigo outline with 2px offset.

### Pipeline Strip

- **Character:** A quiet process legend, not navigation.
- **Structure:** Shiki, Tokens, and HTML are centered in equal columns and linked by one-pixel hairlines.

### Language Select and Source Editor

- **Select:** White, bordered, compact, and labeled; minimum height is 32px.
- **Editor:** Lifted Mist surface, borderless at rest, fixed-width type, non-resizable, and joined visually to the output below.
- **Focus:** Instrument Indigo focus outline; the text caret uses the same accent.

### Output Tabs and Panes

- **Tabs:** Inactive tabs are Slate on transparent; hover gains Ink and Lifted Mist; selected state uses Instrument Indigo on Washed Indigo at 650 weight.
- **Panes:** Preview renders the public `codeRenderer` HTML. Tokens shows the public `syntaxHighlighter` structure. HTML shows the escaped rendered markup.
- **Overflow:** Each pane scrolls independently with a subtle bordered thumb.

### Collapsed Launcher

- **Character:** Compact and unmistakably actionable without becoming promotional.
- **Style:** White text on Instrument Indigo, 44px minimum height, soft corners, and the launcher-specific ambient shadow.

## Do's and Don'ts

### Do:

- **Do** keep this design contract scoped to `integration/consumer` and FORM `local-extension/no-roll`.
- **Do** match the established DSH light UI through system typography, cool neutrals, compact density, and restrained rounding.
- **Do** expose results from the public `syntaxHighlighter` and `codeRenderer` services without duplicating their rendering logic.
- **Do** preserve keyboard focus, labeled controls, ARIA tabs, and collapse/reopen behavior.
- **Do** preserve host usability at desktop and mobile viewport sizes.

### Don't:

- **Don't** treat this file as a design system for the repository, published packages, or DSH as a whole.
- **Don't** add dashboard chrome, marketing styling, or a second accent hierarchy.
- **Don't** move preview UI or preview-only tokens into any published package.
- **Don't** use monospace for general interface copy.
- **Don't** let internal cards or panes compete with the overlay shell through extra shadow.
