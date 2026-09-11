# Excalidraw Diagram Skill — sustainable AG fork

A coding agent skill that generates beautiful and practical Excalidraw diagrams from natural language descriptions. Not just boxes-and-arrows - diagrams that **argue visually**.

> **This is a fork of [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill)** with two changes:
>
> 1. **Brand palette** — `references/color-palette.md` carries the sustainable AG eucalyptus/Pale-Red palette, matching the CEF-online design tokens.
> 2. **Node renderer instead of Python** — the upstream `uv` + Python pipeline is replaced by `references/render_excalidraw.mjs`, which borrows whatever Playwright is already on the machine. The template also loads Excalidraw from **esm.run**, not esm.sh, whose bundle pulls a transitive dependency that 404s — the module then never evaluates and the render times out with no error.
>
> Everything else is upstream's design methodology, which is the valuable part.

Compatible with any coding agent that supports skills. For agents that read from `.claude/skills/` (like [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [OpenCode](https://github.com/nicepkg/OpenCode)), just drop it in and go.

## What Makes This Different

- **Diagrams that argue, not display.** Every shape/group of shapes mirrors the concept it represents — fan-outs for one-to-many, timelines for sequences, convergence for aggregation. No uniform card grids.
- **Evidence artifacts.** As an example, technical diagrams include real code snippets and actual JSON payloads.
- **Built-in visual validation.** A Playwright-based render pipeline lets the agent see its own output, catch layout issues (overlapping text, misaligned arrows, unbalanced spacing), and fix them in a loop before delivering.
- **Brand-customizable.** All colors and brand styles live in a single file (`references/color-palette.md`). Swap it out and every diagram follows your palette.

## Installation

**Globally (recommended)** — one copy, available in every repo:

```bash
npx skills add -g JE-sustainable/excalidraw-diagram-skill --copy
```

That lands at `~/.agents/skills/excalidraw-diagram`, symlinked into `~/.claude/skills/`. `--copy` rather than a symlinked mirror, so local tweaks survive.

**Project-local** — only if a specific repo needs its own pinned version:

```bash
npx skills add JE-sustainable/excalidraw-diagram-skill
```

## Setup

Usually none. The renderer looks for Playwright in this order — `$EXCALIDRAW_PLAYWRIGHT` → the skill's own `references/node_modules` → **the current repo's `node_modules`** → bare resolution — so inside any repo that already has Node Playwright it works untouched.

If it can't find one:

```bash
npx playwright install chromium          # once per machine (browsers are shared per-user)

# and, only if no repo-local Playwright exists:
cd ~/.claude/skills/excalidraw-diagram/references && npm install
```

## Usage

Ask your coding agent to create a diagram:

> "Create an Excalidraw diagram showing how the AG-UI protocol streams events from an AI agent to a frontend UI"

The skill handles the rest — concept mapping, layout, JSON generation, rendering, and visual validation.

## Customize Colors

Edit `references/color-palette.md` to match your brand. Everything else in the skill is universal design methodology.

## File Structure

```
excalidraw-diagram/
  SKILL.md                          # Design methodology + workflow
  references/
    color-palette.md                # Brand colors (edit this to customize)
    element-templates.md            # JSON templates for each element type
    json-schema.md                  # Excalidraw JSON format reference
    render_excalidraw.mjs           # Render .excalidraw to PNG (Node + Playwright)
    render_template.html            # Browser template for rendering (loads Excalidraw from esm.run)
    package.json                    # Optional self-contained Playwright install
```
