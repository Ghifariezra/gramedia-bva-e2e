import { Key } from "selenium-webdriver";
import { pause } from "../../utilities/wait.js";
import { registerLocators } from "../locators/register.locators.js";
import BasePage from "./BasePage.js";

export default class RegisterPage extends BasePage {
    path = "/";
    locators = registerLocators;
    readyLocator = registerLocators.goToRegister;

    async goToRegister() {
        await this.click(this.locators.goToRegister);
    }

    async isRegisterFormVisible() {
        return this.isVisible(this.locators.form, 10000);
    }

    // URL register membawa state OAuth per sesi, jadi form dibuka lewat beranda, bukan path tetap.
    async openRegisterForm() {
        await this.open();
        await this.goToRegister();
        await this.waitForUrl("register");
        await this.find(this.locators.form);
    }

    async setEmail(value) {
        if (value === "") return;
        await this.type(this.locators.emailInput, value);
    }

    // Ctrl+A lalu Backspace supaya React menerima event input. element.clear() bisa tidak memicu onChange.
    async clearField(locator) {
        await this.withPromoGuard(async () => {
            const element = await this.find(locator);
            const selectAll = process.platform === "darwin" ? Key.COMMAND : Key.CONTROL;
            await element.sendKeys(selectAll, "a");
            await element.sendKeys(Key.BACK_SPACE);
        });
        await this.driver.wait(async () => (await this.getValue(locator)) === "", 5000, "Field was not cleared");
    }

    // Mengganti isi field yang sudah terisi. Nilai kosong hanya menghapus.
    async replaceValue(locator, value) {
        await this.clearField(locator);
        if (value !== "") {
            await this.withPromoGuard(async () => {
                const element = await this.find(locator);
                await element.sendKeys(String(value));
            });
        }
        await pause(this.driver);
    }

    async replaceEmail(value) {
        await this.replaceValue(this.locators.emailInput, value);
    }

    async checkTerms() {
        if (await this.isTermsChecked()) return;
        await this.click(this.locators.termsCheckbox);
    }

    // Mengisi form dengan data valid. acceptTerms=false membiarkan checkbox syarat kosong, untuk menguji prasyarat checkbox.
    async fillValidForm({ email, acceptTerms = true }) {
        await this.setEmail(email);
        if (acceptTerms) await this.checkTerms();
    }

    async emailValue() {
        return this.getValue(this.locators.emailInput);
    }

    async isTermsChecked() {
        const checkbox = await this.find(this.locators.termsCheckbox);
        return (await checkbox.getAttribute("aria-checked")) === "true";
    }

    async isSubmitEnabled() {
        const button = await this.find(this.locators.submitButton);
        return button.isEnabled();
    }

    // Menunggu state tombol Daftar sampai sesuai. Penting untuk kasus disabled:
    // membaca langsung bisa kebetulan false sebelum React memperbarui state.
    async waitForSubmitEnabled(expected, timeoutMs = 5000) {
        return this.driver.wait(
            async () => (await this.isSubmitEnabled()) === expected,
            timeoutMs,
            `Expected Daftar button enabled=${expected}`,
        );
    }

    // Sengaja tidak ada method submit: tes berjalan di situs produksi, klik Daftar mengirim email OTP sungguhan
    // dan menghabiskan kuota 3 kali sehari per email. Halaman kode verifikasi tidak diotomasi.
}
