import { readFileSync } from "node:fs";
import { expect } from "chai";
import addContext from "mochawesome/addContext.js";
import { parsePrice } from "../../utilities/data.js";
import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle, runCases } from "../../utilities/shared.js";
import StoreCatalogPage from "../pages/StoreCatalogPage.js";

const { minCases, maxCases, rangeCases } = JSON.parse(
    readFileSync(new URL("../../data/bva/price.json", import.meta.url), "utf8"),
);

describe("Gramedia - Product Catalog Price Filter (BVA)", () => {
    const ctx = usePage(StoreCatalogPage);

    itOpensAndShowsTitle(ctx);

    describe("Min price field (CAT-BVA-M)", () => {
        beforeEach(async () => {
            await ctx.page.open();
        });

        runCases(minCases, async function (c) {
            const { page } = ctx;
            if (c.channel === "type") {
                await page.setMinPrice(c.value);
                if (c.expectedParam !== null) {
                    await page.waitForAppliedParam("min_price", c.expectedParam);
                }
                const params = await page.appliedParams();
                if (c.expectedParam === null) {
                    expect(params.has("min_price")).to.equal(false);
                } else {
                    expect(params.get("min_price")).to.equal(c.expectedParam);
                }
                const val = await page.minPriceValue();
                expect(parsePrice(val)).to.equal(c.expectedInput);
            } else if (c.channel === "url") {
                await page.openWithQuery({ min_price: c.value });
                const val = await page.minPriceValue();
                expect(parsePrice(val)).to.equal(c.expectedInput);
                if (c.id === "CAT-BVA-M07") {
                    addContext(this, {
                        title: "Defect Candidate",
                        value: "Over-limit min_price (?min_price=10000000000001) is retained in the URL query while the UI input is empty. URL state and UI state disagree.",
                    });
                }
            }
        });
    });

    describe("Max price field (CAT-BVA-X)", () => {
        beforeEach(async () => {
            await ctx.page.open();
        });

        runCases(maxCases, async (c) => {
            const { page } = ctx;
            if (c.channel === "type") {
                await page.setMaxPrice(c.value);
                if (c.expectedParam !== null) {
                    await page.waitForAppliedParam("max_price", c.expectedParam);
                }
                const params = await page.appliedParams();
                if (c.expectedParam === null) {
                    expect(params.has("max_price")).to.equal(false);
                } else {
                    expect(params.get("max_price")).to.equal(c.expectedParam);
                }
                const val = await page.maxPriceValue();
                expect(parsePrice(val)).to.equal(c.expectedInput);
            } else if (c.channel === "url") {
                await page.openWithQuery({ max_price: c.value });
                const val = await page.maxPriceValue();
                expect(parsePrice(val)).to.equal(c.expectedInput);
                if (c.expectedParam === null) {
                    await page.waitForParamAbsent("max_price");
                    const params = await page.appliedParams();
                    expect(params.has("max_price")).to.equal(false);
                }
            }
        });
    });

    describe("Range ordering (CAT-BVA-R)", () => {
        beforeEach(async () => {
            await ctx.page.open();
        });

        runCases(rangeCases, async (c) => {
            const { page } = ctx;
            await page.setMinPrice(c.min);
            await page.setMaxPrice(c.max);
            await page.waitForAppliedParam("min_price", c.expectedMinParam);
            await page.waitForAppliedParam("max_price", c.expectedMaxParam);

            const params = await page.appliedParams();
            expect(params.get("min_price")).to.equal(c.expectedMinParam);
            expect(params.get("max_price")).to.equal(c.expectedMaxParam);

            const minVal = await page.minPriceValue();
            const maxVal = await page.maxPriceValue();
            expect(parsePrice(minVal)).to.equal(c.expectedMinInput);
            expect(parsePrice(maxVal)).to.equal(c.expectedMaxInput);
        });
    });
});
