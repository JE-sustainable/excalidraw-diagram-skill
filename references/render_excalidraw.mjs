#!/usr/bin/env node
/**
 * Render Excalidraw JSON to PNG using Node + Playwright + headless Chromium.
 *
 * Usage:
 *   node <skill>/references/render_excalidraw.mjs <file.excalidraw> [--output out.png] [--scale 2] [--width 1920]
 *
 * Playwright resolution (first hit wins) — the skill is usually installed
 * OUTSIDE any repo (~/.agents/skills/...), so a bare `import('playwright')`
 * resolves against the skill directory, not your project:
 *   1. $EXCALIDRAW_PLAYWRIGHT           explicit path to playwright's index.mjs
 *   2. <skill>/references/node_modules  self-contained install (npm i here)
 *   3. <cwd>/node_modules               the repo you are working in
 *   4. bare import('playwright')        normal resolution, if it happens to work
 *
 * Browsers are shared per-user (~/AppData/Local/ms-playwright on Windows), so
 * `npx playwright install chromium` once covers every repo and this skill.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Load Playwright from wherever it actually lives on this machine. */
async function loadPlaywright() {
  const candidates = [
    process.env.EXCALIDRAW_PLAYWRIGHT,
    path.join(HERE, "node_modules", "playwright", "index.mjs"),
    path.join(process.cwd(), "node_modules", "playwright", "index.mjs"),
    path.join(process.cwd(), "node_modules", "playwright-core", "index.mjs"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return import(pathToFileURL(candidate).href);
  }
  try {
    return await import("playwright");
  } catch {
    fail(
      "Playwright not found. Tried:\n" +
        candidates.map((c) => `  - ${c}`).join("\n") +
        "\n\nFix with EITHER:\n" +
        `  cd "${HERE}" && npm install && npx playwright install chromium   (self-contained)\n` +
        "  EXCALIDRAW_PLAYWRIGHT=/abs/path/to/node_modules/playwright/index.mjs  (point at an existing one)",
    );
  }
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function validate(data) {
  const errors = [];
  if (data?.type !== "excalidraw")
    errors.push(`Expected type 'excalidraw', got '${data?.type}'`);
  if (!("elements" in (data ?? {}))) errors.push("Missing 'elements' array");
  else if (!Array.isArray(data.elements))
    errors.push("'elements' must be an array");
  else if (data.elements.length === 0)
    errors.push("'elements' array is empty — nothing to render");
  return errors;
}

function boundingBox(elements) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const w = el.width ?? 0;
    const h = el.height ?? 0;

    // Arrows and lines carry a points array relative to x/y.
    if (
      (el.type === "arrow" || el.type === "line") &&
      Array.isArray(el.points)
    ) {
      for (const [px, py] of el.points) {
        minX = Math.min(minX, x + px);
        minY = Math.min(minY, y + py);
        maxX = Math.max(maxX, x + px);
        maxY = Math.max(maxY, y + py);
      }
    } else {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + Math.abs(w));
      maxY = Math.max(maxY, y + Math.abs(h));
    }
  }

  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  return { minX, minY, maxX, maxY };
}

function parseArgs(argv) {
  const args = { input: null, output: null, scale: 2, width: 1920 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--output" || arg === "-o") args.output = argv[++i];
    else if (arg === "--scale" || arg === "-s") args.scale = Number(argv[++i]);
    else if (arg === "--width" || arg === "-w") args.width = Number(argv[++i]);
    else if (!args.input) args.input = arg;
    else fail(`Unexpected argument: ${arg}`);
  }
  if (!args.input)
    fail(
      "Usage: render_excalidraw.mjs <file.excalidraw> [--output x.png] [--scale 2] [--width 1920]",
    );
  if (!Number.isFinite(args.scale) || args.scale <= 0)
    fail("--scale must be a positive number");
  if (!Number.isFinite(args.width) || args.width <= 0)
    fail("--width must be a positive number");
  return args;
}

/** The screenshot write hits a transient Windows file lock often enough to warrant one retry. */
async function screenshotWithRetry(handle, outputPath) {
  try {
    await handle.screenshot({ path: outputPath });
  } catch (err) {
    if (!/UNKNOWN|EBUSY|EPERM/.test(String(err))) throw err;
    await new Promise((resolve) => setTimeout(resolve, 400));
    await handle.screenshot({ path: outputPath });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  if (!existsSync(inputPath)) fail(`File not found: ${inputPath}`);

  let data;
  try {
    data = JSON.parse(await readFile(inputPath, "utf8"));
  } catch (err) {
    fail(`Invalid JSON in ${inputPath}: ${err.message}`);
  }

  const errors = validate(data);
  if (errors.length > 0)
    fail(
      `Invalid Excalidraw file:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );

  const elements = data.elements.filter((el) => !el.isDeleted);
  const { minX, minY, maxX, maxY } = boundingBox(elements);
  const padding = 80;
  const viewport = {
    width: Math.min(Math.round(maxX - minX + padding * 2), args.width),
    height: Math.max(Math.round(maxY - minY + padding * 2), 600),
  };

  const outputPath = args.output
    ? path.resolve(args.output)
    : inputPath.replace(/\.excalidraw$/i, "") + ".png";

  const templatePath = path.join(HERE, "render_template.html");
  if (!existsSync(templatePath)) fail(`Template not found at ${templatePath}`);

  const { chromium } = await loadPlaywright();

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (/Executable doesn't exist|browserType.launch/.test(String(err))) {
      fail(
        `Chromium not installed for Playwright.\nRun: npx playwright install chromium`,
      );
    }
    throw err;
  }

  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: args.scale,
  });

  // Page errors are the ONLY way to see why the ES module failed to evaluate —
  // console messages report a bare "Failed to load resource" with no culprit.
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  try {
    await page.goto(pathToFileURL(templatePath).href);

    try {
      await page.waitForFunction(
        "window.__moduleReady === true || window.__moduleError",
        { timeout: 30000 },
      );
    } catch {
      const detail = pageErrors.length > 0 ? `\n${pageErrors.join("\n")}` : "";
      fail(
        "The Excalidraw ES module never finished loading (30s). This is normally a CDN " +
          `problem in render_template.html, not a problem with your diagram.${detail}`,
      );
    }

    const moduleError = await page.evaluate("window.__moduleError || null");
    if (moduleError) fail(`Excalidraw module failed to load: ${moduleError}`);

    const result = await page.evaluate(
      (diagram) => window.renderDiagram(diagram),
      data,
    );
    if (!result?.success)
      fail(`Render failed: ${result?.error ?? "renderDiagram returned null"}`);

    await page.waitForFunction("window.__renderComplete === true", {
      timeout: 15000,
    });

    const svg = await page.$("#root svg");
    if (!svg) fail("No SVG element found after render.");

    await screenshotWithRetry(svg, outputPath);
  } finally {
    await browser.close();
  }

  console.log(outputPath);
}

await main();
