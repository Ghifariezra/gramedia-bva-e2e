import { expect } from "chai";
import { createDriver, quitDriver } from "../../utilities/driver.js";
import HomePage from "../pages/HomePage.js";

describe("Smoke: Gramedia home page", function () {
  let home;

  before(async function () {
    const driver = await createDriver();
    home = new HomePage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  it("opens the home page and shows the Gramedia title", async function () {
    await home.open();
    expect(await home.isLoaded(), "body is visible").to.equal(true);
    expect(await home.title()).to.match(/gramedia/i);
  });
});
