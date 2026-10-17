import fs from "node:fs";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import config from "./config.js";

let activeDriver = null;

function assertPathsExist() {
    const entries = [
        ["CHROME_BIN", config.chromeBin],
        ["CHROMEDRIVER_PATH", config.chromedriverPath],
    ];
    for (const [name, file] of entries) {
        if (file && !fs.existsSync(file)) {
            throw new Error(`${name} menunjuk ke file yang tidak ada: ${file}`);
        }
    }
}

export async function createDriver() {
    if (config.browser !== "chrome") {
        throw new Error(`Unsupported BROWSER "${config.browser}". Only "chrome" is supported for now.`);
    }
    assertPathsExist();

    const options = new chrome.Options();
    options.setPageLoadStrategy("eager");
    options.excludeSwitches("enable-logging", "enable-automation");
    if (config.chromeBin) options.setChromeBinaryPath(config.chromeBin);
    if (config.noSandbox) options.addArguments("--no-sandbox");
    options.addArguments(
        "--incognito",
        "--window-size=1920,1080",
        "--lang=id-ID",
        "--disable-dev-shm-usage",
        "--log-level=3",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-sync",
    );
    if (config.headless) options.addArguments("--headless=new");

    const builder = new Builder().forBrowser("chrome").setChromeOptions(options);
    if (config.chromedriverPath) {
        builder.setChromeService(new chrome.ServiceBuilder(config.chromedriverPath));
    }
    const driver = await builder.build();

    await driver.manage().setTimeouts({ pageLoad: config.timeouts.pageLoad });
    activeDriver = driver;
    return driver;
}

export async function quitDriver() {
    if (!activeDriver) return;
    const driver = activeDriver;
    activeDriver = null;
    await driver.quit();
}

export function getActiveDriver() {
    return activeDriver;
}
