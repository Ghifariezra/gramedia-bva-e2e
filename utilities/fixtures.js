import { createDriver, quitDriver } from "./driver.js";

// Panggil di dalam describe(). Wadah `ctx` terisi setelah `before` jalan.
export function usePage(PageClass) {
    const ctx = {};

    before(async () => {
        ctx.page = new PageClass(await createDriver());
    });

    after(async () => {
        await quitDriver();
    });

    return ctx;
}
