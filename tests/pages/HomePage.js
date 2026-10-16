import BasePage from "./BasePage.js";

export default class HomePage extends BasePage {
    #locators;

    constructor(driver, locators) {
        super(driver);
        this.#locators = locators;
    }

    async open() {
        await super.open("/");
    }

    async isLoaded() {
        return this.isVisible(this.#locators.body, 10000);
    }

    async clickRegister() {
        await this.click(this.#locators.register);
    }
}
