import { readFileSync } from "node:fs";
import { expect } from "chai";
import addContext from "mochawesome/addContext.js";
import { makeEmail, makePassword } from "../../utilities/data.js";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle, runCases } from "../../utilities/shared.js";
import RegisterPage from "../pages/RegisterPage.js";

const { fixed, emailCases, emailMinCases, fullNameCases, fullNameMinCases, passwordCases } = JSON.parse(
    readFileSync(new URL("../../data/bva/register.json", import.meta.url), "utf8"),
);

const validForm = () => ({
    email: fixed.email,
    fullName: fixed.fullName,
    password: makePassword(12),
});

const replacers = {
    email: (page, value) => page.replaceEmail(value),
    fullName: (page, value) => page.replaceFullName(value),
    password: (page, value) => page.replacePassword(value),
};

// Kasus enabled: isi form dengan nilai batas, tombol harus berubah false -> true.
// Kasus disabled: isi form valid dulu (kontrol: tombol harus enabled), lalu ganti field uji ke nilai batas,
// tombol harus berubah true -> false. Tanpa kontrol ini, tombol yang disabled sejak awal
// membuat tes lolos tanpa membuktikan apa pun.
async function expectSubmitState(page, { field, value, expected }) {
    if (expected) {
        await page.fillValidForm({ ...validForm(), [field]: value });
        await page.waitForSubmitEnabled(true);
        return;
    }
    await page.fillValidForm(validForm());
    await page.waitForSubmitEnabled(true);
    await replacers[field](page, value);
    await page.waitForSubmitEnabled(false);
}

describe("Gramedia - Register Page", () => {
    const ctx = usePage(RegisterPage);

    itOpensAndShowsTitle(ctx);

    it("goes to the register page until the form is visible", async () => {
        const { page } = ctx;
        await page.open();
        await page.goToRegister();
        await page.waitForUrl("register");
        expect(await page.currentUrl()).to.include("register");
        expect(await page.isRegisterFormVisible()).to.equal(true);
        expect(await page.title()).to.match(/masuk ke akun gramedia/i);
    });

    describe("Email min length (AUTH-BVA-E)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(emailMinCases, async function (c) {
            await expectSubmitState(ctx.page, {
                field: "email",
                value: "a".repeat(c.length),
                expected: c.expectedSubmitEnabled,
            });
            if (c.expectedSubmitEnabled) {
                addContext(this, {
                    title: "Defect Candidate",
                    value: `Email "${"a".repeat(c.length)}" (no @) enables the Daftar button. No client-side email format validation observed. There is no specification, so the test asserts only the button state.`,
                });
            }
        });
    });

    describe("Email max length (AUTH-BVA-E)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(emailCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({ ...validForm(), email: makeEmail(c.length) });
            expect((await page.emailValue()).length).to.equal(c.expectedLength);
            if (c.expect === "accepted") await page.waitForSubmitEnabled(true);
        });
    });

    describe("Full name min length (AUTH-BVA-N)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(fullNameMinCases, async (c) => {
            await expectSubmitState(ctx.page, {
                field: "fullName",
                value: "a".repeat(c.length),
                expected: c.expectedSubmitEnabled,
            });
        });
    });

    describe("Full name max length (AUTH-BVA-N)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(fullNameCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({ ...validForm(), fullName: "a".repeat(c.length) });
            expect((await page.fullNameValue()).length).to.equal(c.expectedLength);
            if (c.expect === "accepted") await page.waitForSubmitEnabled(true);
        });
    });

    describe("Password length (AUTH-BVA-P)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(passwordCases, async (c) => {
            const { page } = ctx;
            await expectSubmitState(page, {
                field: "password",
                value: makePassword(c.length),
                expected: c.expectedSubmitEnabled,
            });
            expect((await page.passwordValue()).length).to.equal(c.length);
        });
    });

    // Checkbox syarat adalah prasyarat fixture, bukan boundary, jadi memakai prefix AUTH-PRE.
    // Kontrol positifnya ada di akhir: setelah dicentang, tombol harus enabled.
    describe("Terms checkbox precondition (AUTH-PRE)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        it("AUTH-PRE-01: Daftar stays disabled while terms are unchecked and becomes enabled after checking", async () => {
            const { page } = ctx;
            await page.fillValidForm({ ...validForm(), acceptTerms: false });
            expect(await page.isTermsChecked()).to.equal(false);
            await page.waitForSubmitEnabled(false);
            await page.checkTerms();
            await page.waitForSubmitEnabled(true);
        });
    });

    // Indikator aturan panjang minimal. State sukses diamati langsung di situs: data-testid "minCharSuccess".
    // Pada 7 karakter indikator tidak boleh sukses, pada 8 karakter harus sukses.
    // State 7 karakter dicatat ke report supaya nama state "belum terpenuhi" bisa dikunci setelah dilihat.
    describe("Password min rule indicator (AUTH-RULE)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        it("AUTH-RULE-01: min length indicator is satisfied at 8 characters but not at 7", async function () {
            const { page } = ctx;
            await page.setPassword(makePassword(7));
            const at7 = (await page.passwordRuleStates()).minLength;

            await page.replaceValue(page.locators.passwordInput, makePassword(8));
            await page.waitForMinRuleChange(at7);
            const at8 = (await page.passwordRuleStates()).minLength;

            addContext(this, { title: "Rule states", value: { at7, at8 } });
            expect(at7.testId).to.not.equal("minCharSuccess");
            expect(at8.testId).to.equal("minCharSuccess");
        });
    });
});
