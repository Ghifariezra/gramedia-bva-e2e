import { expect } from "chai";

export function itOpensAndShowsTitle(ctx, titlePattern = /gramedia/i) {
    it("opens the page and shows the Gramedia title", async () => {
        await ctx.page.open();
        expect(await ctx.page.isLoaded(), "body is visible").to.equal(true);
        expect(await ctx.page.title()).to.match(titlePattern);
    });
}

export function runCases(cases, run) {
    for (const c of cases) {
        const title = c.description ?? `${c.length} chars -> ${c.expect}`;
        it(`${c.id}: ${title}`, () => run(c));
    }
}
