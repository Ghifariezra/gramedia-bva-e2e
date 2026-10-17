import addContext from "mochawesome/addContext.js";
import { getActiveDriver } from "./driver.js";
import { saveScreenshot } from "./screenshot.js";

export const mochaHooks = {
    async afterEach() {
        if (this.currentTest?.state !== "failed") return;
        const driver = getActiveDriver();
        if (!driver) return;
        try {
            const file = await saveScreenshot(driver, this.currentTest.fullTitle());
            console.log(`    screenshot: ${file}`);
            addContext(this, { title: "Screenshot", value: file });
        } catch (error) {
            console.log(`    screenshot failed: ${error.message}`);
        }
    },
};
