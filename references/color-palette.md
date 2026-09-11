# Color Palette & Brand Style — sustainable AG

**This is the single source of truth for all colors and brand-specific styles.** Everything else in the skill is universal methodology.

This palette is the **sustainable AG** brand: the eucalyptus greens are the ink, Pale Red `#e35b3b` is the one accent. It mirrors the design tokens in the CEF-online app (`app/globals.css`), so a diagram drawn here sits next to a screenshot of the product without clashing.

**Two house rules that override the generic advice elsewhere in the skill:**

1. **There is no black.** The darkest ink is Eucal Dark `#274540`. Never `#000000`.
2. **Pale Red is an accent, not a decoration.** It marks the one thing the diagram is arguing about — the CTA, the bottleneck, the change. If three things are pale red, none of them are.

---

## Brand Base

| Token        | Hex       | Role                                                |
| ------------ | --------- | --------------------------------------------------- |
| Eucal Dark   | `#274540` | Darkest ink — headings, primary strokes, dark fills |
| Eucal        | `#91b0a9` | Mid green — secondary shapes, structural lines      |
| Eucal Light  | `#e2ebea` | Light green — default shape fill                    |
| Pale Red     | `#e35b3b` | The accent — CTAs, the pivotal element, emphasis    |
| Brand Blue   | `#457b9d` | Second voice — alternate paths, "realistic" case    |
| Brand Purple | `#3b366e` | Third voice — use sparingly, mostly for 4+ series   |
| Canvas       | `#f6f9f8` | Page background (off-white, not pure white)         |

---

## Shape Colors (Semantic)

Colors encode meaning, not decoration. Each semantic purpose has a fill/stroke pair.

| Semantic Purpose  | Fill      | Stroke                        |
| ----------------- | --------- | ----------------------------- |
| Primary/Neutral   | `#e2ebea` | `#274540`                     |
| Secondary         | `#91b0a9` | `#274540`                     |
| Tertiary          | `#f6f9f8` | `#91b0a9`                     |
| Emphasis/Hero     | `#274540` | `#1a302c` (white text on it)  |
| Start/Trigger     | `#d8e5e3` | `#457b9d`                     |
| End/Success       | `#c9e4d8` | `#2fa37a`                     |
| Warning/Reset     | `#fbdcd4` | `#e35b3b`                     |
| Decision          | `#f5e6c8` | `#d08a2c`                     |
| AI/LLM            | `#ddd9ea` | `#3b366e`                     |
| Inactive/Disabled | `#eef3f2` | `#94a3b8` (use dashed stroke) |
| Error             | `#fbd0c6` | `#b91c1c`                     |

**Rule**: Always pair a darker stroke with a lighter fill for contrast. The one inversion is Emphasis/Hero — dark fill, white text — reserved for the element the diagram is _about_.

---

## Text Colors (Hierarchy)

Use color on free-floating text to create visual hierarchy without containers.

| Level          | Color     | Use For                             |
| -------------- | --------- | ----------------------------------- |
| Title          | `#274540` | Section headings, major labels      |
| Subtitle       | `#457b9d` | Subheadings, secondary labels       |
| Body/Detail    | `#64748b` | Descriptions, annotations, metadata |
| Accent         | `#e35b3b` | The one call-out per diagram        |
| On light fills | `#1e2d2b` | Text inside light-colored shapes    |
| On dark fills  | `#f0f6f5` | Text inside eucal-dark shapes       |

---

## Series Colors (3+ parallel things)

When a diagram shows parallel alternatives — scenarios, pathways, variants — use these in order. They match the app's scenario tokens, so a diagram of "BAU / Realistic / Ambitious" uses the same hues the charts do.

| Order | Hex       | App token                                      |
| ----- | --------- | ---------------------------------------------- |
| 1st   | `#64748b` | `--scenario-a` (slate — baseline / do-nothing) |
| 2nd   | `#457b9d` | `--scenario-b` (brand blue — the middle case)  |
| 3rd   | `#e35b3b` | `--scenario-c` (pale red — the bold case)      |
| 4th   | `#3b366e` | `--chart-4`                                    |
| 5th   | `#91b0a9` | `--chart-5`                                    |

For **module families** (if a diagram spans the product suite): Carbon Accounting `#3b82c4`, Decarbonization `#2fa37a`, Supplier Engagement `#d08a2c`.

---

## Evidence Artifact Colors

Used for code snippets, data examples, and other concrete evidence inside technical diagrams.

| Artifact          | Background | Text Color                            |
| ----------------- | ---------- | ------------------------------------- |
| Code snippet      | `#1e2d2b`  | Syntax-colored (language-appropriate) |
| JSON/data example | `#1e2d2b`  | `#91b0a9` (eucal)                     |
| SQL / shell       | `#1e2d2b`  | `#e2ebea`                             |

---

## Default Stroke & Line Colors

| Element                                       | Color                                                         |
| --------------------------------------------- | ------------------------------------------------------------- |
| Arrows                                        | Use the stroke color of the source element's semantic purpose |
| Structural lines (dividers, trees, timelines) | Eucal Dark (`#274540`) or Slate (`#64748b`)                   |
| Marker dots (fill + stroke)                   | Eucal (`#91b0a9`)                                             |
| The one emphasized arrow                      | Pale Red (`#e35b3b`), thicker stroke                          |

---

## Background

| Property          | Value     |
| ----------------- | --------- |
| Canvas background | `#f6f9f8` |

Set `appState.viewBackgroundColor` to `#f6f9f8` — the app's background, not pure white. Shapes filled `#ffffff` then read as raised cards against it.

---

## Typography

The brand Hausschrift is **DM Sans**. Excalidraw's built-in fonts don't include it, so use `fontFamily: 2` (Helvetica/normal) rather than the hand-drawn default (`1`) — the diagrams should read as product documentation, not sketches. Reserve `fontFamily: 1` for genuinely informal sketches.
