import { Key } from "selenium-webdriver";
import { catalogLocators } from "../locators/catalog.locators.js";
import BasePage from "./BasePage.js";

export default class CatalogPage extends BasePage {
    path = "/";
    locators = catalogLocators;
    readyLocator = catalogLocators.searchInput;

    // Hanya mengetik, tanpa ENTER. Dipakai untuk kasus yang menguji isi input.
    async typeSearch(keyword) {
        await this.type(this.locators.searchInput, keyword);
    }

    async search(keyword) {
        await this.typeSearch(keyword);
        const input = await this.find(this.locators.searchInput);
        await input.sendKeys(Key.ENTER);
    }

    async searchInputValue() {
        return this.getValue(this.locators.searchInput);
    }

    async waitForToastText(timeoutMs = 5000) {
        return this.driver.wait(
            async () => {
                const [el] = await this.driver.findElements(this.locators.toastSearch);
                if (!el) return false;
                const text = await el.getAttribute("textContent");
                return text || false;
            },
            timeoutMs,
            "Search toast did not appear",
        );
    }
}
