import { By } from "selenium-webdriver";

export const registerLocators = Object.freeze({
    // Navbar (halaman beranda)
    goToRegister: By.css('button[data-testid="navbarRegister"]'),

    // Form langkah 1: hanya email dan checkbox syarat. Nama lengkap dan password tidak ada lagi.
    form: By.css("form:has(input[data-testid='inputEmail'])"),
    emailInput: By.css("input[data-testid='inputEmail']"),
    termsCheckbox: By.css("button[data-testid='checkboxTerms']"),

    // Tombol Daftar: data-testid berubah saat aktif (registerButtonEnabled/Disabled), jadi cari lewat type=submit.
    submitButton: By.css("form button[type='submit']"),
});
