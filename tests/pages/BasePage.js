import config from "../../utilities/config.js";
import { pause, waitForClickable, waitForUrlContains, waitForVisible } from "../../utilities/wait.js";
import { commonLocators } from "../locators/common.locators.js";

export default class BasePage {
    // Di-override oleh subclass.
    path = "/";
    locators = {};

    constructor(driver) {
        this.driver = driver;
    }

    async open() {
        await this.driver.get(`${config.baseUrl}${this.path}`);
        await pause(this.driver);
    }

    async isLoaded() {
        return this.isVisible(commonLocators.body, 10000);
    }

    async find(locator) {
        return waitForVisible(this.driver, locator);
    }

    async click(locator) {
        const element = await waitForClickable(this.driver, locator);
        await element.click();
        await pause(this.driver);
    }

    async type(locator, text) {
        const element = await this.find(locator);
        await element.clear();
        await element.sendKeys(String(text));
        await pause(this.driver);
    }

    async getText(locator) {
        return (await this.find(locator)).getText();
    }

    async getValue(locator) {
        return (await this.find(locator)).getAttribute("value");
    }

    async isVisible(locator, timeoutMs = 3000) {
        try {
            await waitForVisible(this.driver, locator, timeoutMs);
            return true;
        } catch {
            return false;
        }
    }

    async waitForUrl(fragment, timeoutMs) {
        return waitForUrlContains(this.driver, fragment, timeoutMs);
    }

    async title() {
        return this.driver.getTitle();
    }

    async currentUrl() {
        return this.driver.getCurrentUrl();
    }
}
