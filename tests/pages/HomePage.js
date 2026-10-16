import BasePage from "./BasePage.js";
import locators from "../locators/home.locators.js";

export default class HomePage extends BasePage {
  async open() {
    await super.open("/");
  }

  async isLoaded() {
    return this.isVisible(locators.body, 10000);
  }
}
