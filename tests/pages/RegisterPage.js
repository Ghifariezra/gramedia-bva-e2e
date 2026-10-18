import { Key } from "selenium-webdriver";
import { pause } from "../../utilities/wait.js";
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

    async setFullName(value) {
        if (value === "") return;
        await this.type(this.locators.fullNameInput, value);
    }

    async setPassword(value) {
        await this.type(this.locators.passwordInput, value);
    }

    async setConfirmPassword(value) {
        await this.type(this.locators.confirmPasswordInput, value);
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

    async replaceFullName(value) {
        await this.replaceValue(this.locators.fullNameInput, value);
    }

    // Password dan konfirmasi diganti bersamaan, supaya tombol tidak disabled karena keduanya tidak cocok.
    async replacePassword(value) {
        await this.replaceValue(this.locators.passwordInput, value);
        await this.replaceValue(this.locators.confirmPasswordInput, value);
    }

    async checkTerms() {
        if (await this.isTermsChecked()) return;
        await this.click(this.locators.termsCheckbox);
    }

    // Mengisi seluruh form dengan data valid. Konfirmasi password dibuat sama dengan password.
    // acceptTerms=false membiarkan checkbox syarat kosong, untuk menguji prasyarat checkbox.
    async fillValidForm({ email, fullName, password, acceptTerms = true }) {
        await this.setEmail(email);
        await this.setFullName(fullName);
        await this.setPassword(password);
        await this.setConfirmPassword(password);
        if (acceptTerms) await this.checkTerms();
    }

    async emailValue() {
        return this.getValue(this.locators.emailInput);
    }

    async fullNameValue() {
        return this.getValue(this.locators.fullNameInput);
    }

    async passwordValue() {
        return this.getValue(this.locators.passwordInput);
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

    async passwordRuleStates() {
        const read = async (locator) => {
            const element = await this.find(locator);
            return {
                testId: await element.getAttribute("data-testid"),
                className: await element.getAttribute("class"),
            };
        };
        return {
            minLength: await read(this.locators.passwordMinRule),
            characterMix: await read(this.locators.passwordMixRule),
        };
    }

    // Menunggu indikator aturan panjang minimal berubah dari state sebelumnya.
    async waitForMinRuleChange(previous, timeoutMs = 5000) {
        return this.driver.wait(
            async () => {
                const { minLength } = await this.passwordRuleStates();
                return minLength.testId !== previous.testId || minLength.className !== previous.className;
            },
            timeoutMs,
            "Min length rule indicator did not change",
        );
    }

    // Sengaja tidak ada method submit: tes berjalan di situs produksi dan tidak boleh membuat akun.
}
