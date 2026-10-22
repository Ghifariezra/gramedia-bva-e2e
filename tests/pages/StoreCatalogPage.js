import { Key } from "selenium-webdriver";
import config from "../../utilities/config.js";
import { pause } from "../../utilities/wait.js";
import { catalogLocators } from "../locators/catalog.locators.js";
import BasePage from "./BasePage.js";

export default class StoreCatalogPage extends BasePage {
    path = "/store/gramedia-balikpapan";
    locators = catalogLocators;
    readyLocator = catalogLocators.priceFilter;

    async openWithQuery(params = {}) {
        const query =
            params instanceof URLSearchParams
                ? params.toString()
                : typeof params === "string"
                  ? params.replace(/^\?/, "")
                  : new URLSearchParams(params).toString();
        await this.navigate(`${config.baseUrl}${this.path}${query ? `?${query}` : ""}`);
    }

    async clearAndTypeDelimited(locator, text) {
        await this.withPromoGuard(async () => {
            const element = await this.find(locator);
            const selectAll = process.platform === "darwin" ? Key.COMMAND : Key.CONTROL;
            await element.sendKeys(selectAll, "a");
            await element.sendKeys(Key.BACK_SPACE);
            if (text !== undefined && text !== null && text !== "") {
                await element.sendKeys(String(text));
            }
        });
        await pause(this.driver);
    }

    async setMinPrice(value) {
        await this.clearAndTypeDelimited(this.locators.minPriceInput, value);
    }

    async setMaxPrice(value) {
        await this.clearAndTypeDelimited(this.locators.maxPriceInput, value);
    }

    async minPriceValue() {
        return this.getValue(this.locators.minPriceInput);
    }

    async maxPriceValue() {
        return this.getValue(this.locators.maxPriceInput);
    }

    async appliedParams() {
        const url = await this.currentUrl();
        const searchParams = new URL(url).searchParams;
        for (const [key, val] of searchParams.entries()) {
            searchParams[key] = val;
        }
        return searchParams;
    }

    async waitForAppliedParam(name, expectedValue, timeoutMs = 5000) {
        return this.driver.wait(
            async () => {
                const params = await this.appliedParams();
                return params.get(name) === String(expectedValue);
            },
            timeoutMs,
            `Expected URL parameter "${name}" to be "${expectedValue}"`,
        );
    }

    async waitForParamAbsent(name, timeoutMs = 5000) {
        return this.driver.wait(
            async () => {
                const params = await this.appliedParams();
                return !params.has(name);
            },
            timeoutMs,
            `Expected URL parameter "${name}" to be absent`,
        );
    }
}
