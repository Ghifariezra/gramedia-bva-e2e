import { readFileSync } from "node:fs";
import { expect } from "chai";
import { makeEmail, makePassword } from "../../utilities/data.js";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle, runCases } from "../../utilities/shared.js";
import RegisterPage from "../pages/RegisterPage.js";

const { fixed, emailCases, emailMinCases, fullNameCases, fullNameMinCases, passwordCases } = JSON.parse(
    readFileSync(new URL("../../data/bva/register.json", import.meta.url), "utf8"),
);

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

        runCases(emailMinCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({
                email: "a".repeat(c.length),
                fullName: fixed.fullName,
                password: makePassword(12),
            });
            await page.waitForSubmitEnabled(c.expectedSubmitEnabled);
        });
    });

    describe("Email max length (AUTH-BVA-E)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(emailCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({
                email: makeEmail(c.length),
                fullName: fixed.fullName,
                password: makePassword(12),
            });
            expect((await page.emailValue()).length).to.equal(c.expectedLength);
            if (c.expect === "accepted") await page.waitForSubmitEnabled(true);
        });
    });

    describe("Full name min length (AUTH-BVA-N)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(fullNameMinCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({
                email: fixed.email,
                fullName: "a".repeat(c.length),
                password: makePassword(12),
            });
            await page.waitForSubmitEnabled(c.expectedSubmitEnabled);
        });
    });

    describe("Full name max length (AUTH-BVA-N)", () => {
        beforeEach(async () => {
            await ctx.page.openRegisterForm();
        });

        runCases(fullNameCases, async (c) => {
            const { page } = ctx;
            await page.fillValidForm({
                email: fixed.email,
                fullName: "a".repeat(c.length),
                password: makePassword(12),
            });
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
            await page.fillValidForm({
                email: fixed.email,
                fullName: fixed.fullName,
                password: makePassword(c.length),
            });
            expect((await page.passwordValue()).length).to.equal(c.length);
            await page.waitForSubmitEnabled(c.expectedSubmitEnabled);
        });
    });
});
