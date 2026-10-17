import { expect } from "chai";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle } from "../../utilities/shared.js";
import RegisterPage from "../pages/RegisterPage.js";

describe("Gramedia - Register Page", () => {
    const ctx = usePage(RegisterPage);

    itOpensAndShowsTitle(ctx);

    it("goes to the register page until the form is visible", async () => {
        const { page } = ctx;
        await page.open();
        await page.goToRegister();
        await page.waitForUrl("register");
        expect(await page.currentUrl()).to.include("register");
        expect(await page.isRegisterFormVisible()).to.equal(true);
        expect(await page.title()).to.match(/masuk ke akun gramedia/i);
    });
});
