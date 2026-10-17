import { registerLocators } from "../locators/register.locators.js";
import BasePage from "./BasePage.js";

export default class RegisterPage extends BasePage {
    path = "/";
    locators = registerLocators;

    async goToRegister() {
        await this.click(this.locators.goToRegister);
    }

    async isRegisterFormVisible() {
        return this.isVisible(this.locators.form, 10000);
    }
}
