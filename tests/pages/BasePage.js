import { error } from "selenium-webdriver";
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

    async dismissPromo() {
        const locator = commonLocators.promoOverlay;
        const [overlay] = await this.driver.findElements(locator);
        if (!overlay) return false;

        // close-on-click="true": klik lewat JS agar tidak dicegat elemen lain.
        await this.driver.executeScript("arguments[0].click()", overlay);

        const isGone = async () => {
            const [el] = await this.driver.findElements(locator);
            if (!el) return true;
            try {
                return !(await el.isDisplayed());
            } catch {
                return true; // stale: elemen sudah dihapus
            }
        };
        await this.driver.wait(isGone, 5000, "Promo overlay did not close");
        return true;
    }

    // Jalankan aksi; kalau dicegat popup, tutup popup lalu ulangi sekali.
    async withPromoGuard(action) {
        try {
            return await action();
        } catch (err) {
            const blocked =
                err instanceof error.ElementClickInterceptedError || err instanceof error.ElementNotInteractableError;
            if (!blocked || !(await this.dismissPromo())) throw err;
            return action();
        }
    }

    async click(locator) {
        await this.withPromoGuard(async () => {
            const element = await waitForClickable(this.driver, locator);
            await element.click();
        });
        await pause(this.driver);
    }

    async type(locator, text) {
        await this.withPromoGuard(async () => {
            const element = await this.find(locator);
            await element.clear();
            await element.sendKeys(String(text));
        });
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
