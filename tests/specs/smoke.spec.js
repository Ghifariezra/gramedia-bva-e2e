import { expect } from "chai";
import { createDriver, quitDriver } from "../../utilities/driver.js";
import { GramediaLocators } from "../locators/index.js";
import HomePage from "../pages/HomePage.js";

describe("[Smoke] Gramedia home page", () => {
    let home;

    before(async () => {
        const driver = await createDriver();
        home = new HomePage(driver, GramediaLocators);
    });

    after(async () => {
        await quitDriver();
    });

    it("opens the home page and shows the Gramedia title", async () => {
        await home.open();
        expect(await home.isLoaded(), "body is visible").to.equal(true);
        expect(await home.title()).to.match(/gramedia/i);
    });

    it("clicks the register button and goes to the register page", async () => {
        await home.clickRegister();
        await home.waitForUrl("register");
        expect(await home.currentUrl()).to.include("register");
    });
});
