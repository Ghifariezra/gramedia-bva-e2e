import fs from "node:fs/promises";
import path from "node:path";
import config from "./config.js";

export async function saveScreenshot(driver, name) {
    await fs.mkdir(config.screenshotDir, { recursive: true });
    const safeName =
        name
            .replace(/[^a-z0-9]+/gi, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 80) || "screenshot";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(config.screenshotDir, `${safeName}_${stamp}.png`);
    await fs.writeFile(file, await driver.takeScreenshot(), "base64");
    return file;
}
