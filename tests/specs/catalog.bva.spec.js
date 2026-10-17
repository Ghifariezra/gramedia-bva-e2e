import { readFileSync } from "node:fs";
import { expect } from "chai";
import { makeKeyword } from "../../utilities/data.js";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle, runCases } from "../../utilities/shared.js";
import CatalogPage from "../pages/CatalogPage.js";

const { cases } = JSON.parse(readFileSync(new URL("../../data/bva/catalog.json", import.meta.url), "utf8"));

describe("Gramedia - Catalog search length (BVA)", () => {
    const ctx = usePage(CatalogPage);

    itOpensAndShowsTitle(ctx);

    beforeEach(async () => {
        await ctx.page.open();
    });

    runCases(cases, async (c) => {
        const { page } = ctx;
        const keyword = makeKeyword(c.length);
        await page.search(keyword);

        if (c.expect === "rejected") {
            expect(await page.waitForToastText()).to.match(/minimum 3 karakter/i);
            expect(await page.currentUrl()).to.not.include("/search");
        } else if (c.expect === "accepted") {
            await page.waitForUrl(`/search?q=${keyword}`);
            expect(await page.currentUrl()).to.include(`q=${keyword}`);
        } else if (c.expect === "truncated") {
            expect((await page.searchInputValue()).length).to.equal(50);
        }
    });
});
