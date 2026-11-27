import { readFileSync } from "node:fs";
import { expect } from "chai";
import addContext from "mochawesome/addContext.js";
import { makeEmail } from "../../utilities/data.js";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle, runCases } from "../../utilities/shared.js";
import RegisterPage from "../pages/RegisterPage.js";

const { fixed, emailCases, emailMinCases } = JSON.parse(
    readFileSync(new URL("../../data/bva/register.json", import.meta.url), "utf8"),
);

const validForm = () => ({ email: fixed.email });

// Kasus enabled: isi form dengan nilai batas, tombol harus berubah false -> true.
// Kasus disabled: isi form valid dulu (kontrol: tombol harus enabled), lalu ganti email ke nilai batas,
// tombol harus berubah true -> false. Tanpa kontrol ini, tombol yang disabled sejak awal
// membuat tes lolos tanpa membuktikan apa pun.
async function expectSubmitState(page, { value, expected }) {
    if (expected) {
        await page.fillValidForm({ email: value });
        await page.waitForSubmitEnabled(true);
        return;
    }
    await page.fillValidForm(validForm());
    await page.waitForSubmitEnabled(true);
    await page.replaceEmail(value);
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
            await page.fillValidForm({ email: makeEmail(c.length) });
            expect((await page.emailValue()).length).to.equal(c.expectedLength);
            if (c.expect === "accepted") await page.waitForSubmitEnabled(true);
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
});
