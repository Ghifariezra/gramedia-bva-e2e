import config from "../../utilities/config.js";
import {
  waitForVisible,
  waitForClickable,
  pause,
} from "../../utilities/wait.js";

export default class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(urlPath = "/") {
    await this.driver.get(`${config.baseUrl}${urlPath}`);
    await pause(this.driver);
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

  async title() {
    return this.driver.getTitle();
  }

  async currentUrl() {
    return this.driver.getCurrentUrl();
  }
}
