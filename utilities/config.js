import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const hasDisplay =
  process.platform !== "linux" ||
  Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
  baseUrl: (process.env.BASE_URL || "https://www.gramedia.com").replace(
    /\/+$/,
    "",
  ),
  browser: (process.env.BROWSER || "chrome").toLowerCase(),
  headless:
    String(process.env.HEADLESS).toLowerCase() === "true" || !hasDisplay,
  // Pause between actions to stay under rate limits (risk R5). Not a sync wait.
  actionDelayMs: toInt(process.env.ACTION_DELAY_MS, 1000),
  timeouts: {
    explicit: toInt(process.env.EXPLICIT_WAIT_MS, 15000),
    pageLoad: toInt(process.env.PAGE_LOAD_TIMEOUT_MS, 30000),
  },
  screenshotDir: path.join(import.meta.dirname, "..", "screenshots"),
  chromeBin: process.env.CHROME_BIN || "",
  chromedriverPath: process.env.CHROMEDRIVER_PATH || "",
  noSandbox: String(process.env.NO_SANDBOX).toLowerCase() === "true",
};

export default config;
