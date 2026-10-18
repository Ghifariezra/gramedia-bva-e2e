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

    async checkTerms() {
        if (await this.isTermsChecked()) return;
        await this.click(this.locators.termsCheckbox);
    }

    // Mengisi seluruh form dengan data valid. Konfirmasi password dibuat sama dengan password.
    async fillValidForm({ email, fullName, password }) {
        await this.setEmail(email);
        await this.setFullName(fullName);
        await this.setPassword(password);
        await this.setConfirmPassword(password);
        await this.checkTerms();
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

    // Sengaja tidak ada method submit: tes berjalan di situs produksi dan tidak boleh membuat akun.
}
