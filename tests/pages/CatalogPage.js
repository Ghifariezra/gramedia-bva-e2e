import { catalogLocators } from "../locators/catalog.locators.js";
import BasePage from "./BasePage.js";

export default class CatalogPage extends BasePage {
    path = "/";
    locators = catalogLocators;
}
