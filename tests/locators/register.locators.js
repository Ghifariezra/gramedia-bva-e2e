import { By } from "selenium-webdriver";

export const registerLocators = Object.freeze({
    goToRegister: By.css('button[data-testid="navbarRegister"]'),
    form: By.css(".auth_authContent__vRVwz"),
});
