import { By } from "selenium-webdriver";

export const registerLocators = Object.freeze({
    // Navbar (halaman beranda)
    goToRegister: By.css('button[data-testid="navbarRegister"]'),

    // Form
    form: By.css("form:has(input[data-testid='inputEmail'])"),
    emailInput: By.css("input[data-testid='inputEmail']"),
    fullNameInput: By.css("input[data-testid='inputFullName']"),
    passwordInput: By.css("input#inputPassword"),
    confirmPasswordInput: By.css("input#inputConfirmPassword"),
    termsCheckbox: By.css("button[data-testid='checkboxTerms']"),

    // Tombol Daftar: data-testid berubah saat aktif, jadi cari lewat type=submit.
    submitButton: By.css("form button[type='submit']"),
    submitButtonDisabled: By.css("button[data-testid='registerButtonDisabled']"),

    // Aturan password: pakai prefix agar state selain "Neutral" tetap terambil.
    passwordMinRule: By.css("[data-testid^='minChar']"),
    passwordMixRule: By.css("[data-testid^='withValidLetter']"),
});
