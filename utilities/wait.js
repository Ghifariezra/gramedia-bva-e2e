import { until } from "selenium-webdriver";
import config from "./config.js";

const resolveTimeout = (ms) => ms ?? config.timeouts.explicit;

export async function waitForVisible(driver, locator, ms) {
    const element = await driver.wait(
        until.elementLocated(locator),
        resolveTimeout(ms),
        `Element not located: ${locator}`,
    );
    return driver.wait(until.elementIsVisible(element), resolveTimeout(ms), `Element not visible: ${locator}`);
}

export async function waitForClickable(driver, locator, ms) {
    const element = await waitForVisible(driver, locator, ms);
    return driver.wait(until.elementIsEnabled(element), resolveTimeout(ms), `Element not enabled: ${locator}`);
}

export async function waitForUrlContains(driver, fragment, ms) {
    return driver.wait(until.urlContains(fragment), resolveTimeout(ms), `URL does not contain "${fragment}"`);
}

// Rate-limit pause between user actions. Never use this to wait for the page.
export async function pause(driver) {
    if (config.actionDelayMs > 0) await driver.sleep(config.actionDelayMs);
}
