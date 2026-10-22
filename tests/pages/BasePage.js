import { error } from "selenium-webdriver";
import config from "../../utilities/config.js";
import { pause, waitForClickable, waitForUrlContains, waitForVisible } from "../../utilities/wait.js";
import { commonLocators } from "../locators/common.locators.js";

export default class BasePage {
    // Di-override oleh subclass.
    path = "/";
    locators = {};
    // Elemen penanda halaman sudah render. null = tidak menunggu apa pun.
    readyLocator = null;

    constructor(driver) {
        this.driver = driver;
    }

    async open() {
        await this.navigate(`${config.baseUrl}${this.path}`);
    }

    // Buka URL dan tunggu readyLocator. Kalau timeout (render telat), ulangi navigasi.
    async navigate(url, attempts = 2) {
        for (let attempt = 1; ; attempt++) {
            try {
                await this.driver.get(url);
                if (this.readyLocator) await this.find(this.readyLocator);
                break;
            } catch (err) {
                if (!(err instanceof error.TimeoutError) || attempt >= attempts) throw err;
            }
        }
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
