import { error, until } from "selenium-webdriver";
import config from "./config.js";

const resolveTimeout = (ms) => ms ?? config.timeouts.explicit;

const isTransient = (err) => err instanceof error.NoSuchElementError || err instanceof error.StaleElementReferenceError;

// Cari ulang elemen di setiap polling, jadi elemen yang diganti oleh re-render tidak membuat tes gagal.
async function waitForElement(driver, locator, ms, check, description) {
    return driver.wait(
        async () => {
            try {
                const element = await driver.findElement(locator);
                return (await check(element)) ? element : false;
            } catch (err) {
                if (isTransient(err)) return false;
                throw err;
            }
        },
        resolveTimeout(ms),
        `Element not ${description}: ${locator}`,
    );
}

export function waitForVisible(driver, locator, ms) {
    return waitForElement(driver, locator, ms, (element) => element.isDisplayed(), "visible");
}

export function waitForClickable(driver, locator, ms) {
    return waitForElement(
        driver,
        locator,
        ms,
        async (element) => (await element.isDisplayed()) && (await element.isEnabled()),
        "clickable",
    );
}

export async function waitForUrlContains(driver, fragment, ms) {
    return driver.wait(until.urlContains(fragment), resolveTimeout(ms), `URL does not contain "${fragment}"`);
}

// Rate-limit pause between user actions. Never use this to wait for the page.
export async function pause(driver) {
    if (config.actionDelayMs > 0) await driver.sleep(config.actionDelayMs);
}
