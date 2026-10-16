import { getActiveDriver } from "./driver.js";
import { saveScreenshot } from "./screenshot.js";

// Mocha root hooks: capture a screenshot whenever a test fails.
export const mochaHooks = {
    async afterEach() {
        if (this.currentTest?.state !== "failed") return;
        const driver = getActiveDriver();
        if (!driver) return;
        try {
            const file = await saveScreenshot(driver, this.currentTest.fullTitle());
            console.log(`    screenshot: ${file}`);
        } catch (error) {
            console.log(`    screenshot failed: ${error.message}`);
        }
    },
};
