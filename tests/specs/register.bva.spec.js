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
});
