import { usePage } from "../../utilities/fixtures.js";
import { itOpensAndShowsTitle } from "../../utilities/shared.js";
import CatalogPage from "../pages/CatalogPage.js";

describe("Gramedia - Catalog Page", () => {
    const ctx = usePage(CatalogPage);

    itOpensAndShowsTitle(ctx);
});
