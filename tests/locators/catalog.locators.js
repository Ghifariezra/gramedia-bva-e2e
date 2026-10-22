import { By } from "selenium-webdriver";

export const catalogLocators = Object.freeze({
    searchInput: By.css("input[data-testid='navbarSearchBox']"),
    toastSearch: By.xpath("//*[not(*)][contains(normalize-space(.), 'minimum 3 karakter')]"),
    priceFilter: By.css("[data-testid='productListFilterPrice']"),
    minPriceInput: By.css("input[data-testid='productListFilterMinPrice']"),
    maxPriceInput: By.css("input[data-testid='productListFilterMaxPrice']"),
});
