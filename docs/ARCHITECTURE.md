# Architecture

How the test code is organized and why. Each layer has one job, so a UI change only touches one place.

## Project structure

```
gramedia-bva-e2e/
├── .github/
│   └── workflows/               # CI, report deploy
├── data/
│   └── bva/
│       ├── catalog.json         # search keyword length
│       ├── price.json           # min price, max price, range order
│       └── register.json        # email length
├── docs/                        # this documentation
├── scripts/
│   └── generate-tdd-report.js   # Test Case TDD xlsx generator
├── tests/
│   ├── locators/
│   │   ├── catalog.locators.js
│   │   ├── common.locators.js
│   │   └── register.locators.js
│   ├── pages/
│   │   ├── BasePage.js          # navigation retry, 429 backoff, promo guard, click/type
│   │   ├── CatalogPage.js       # navbar search
│   │   ├── StoreCatalogPage.js  # price filter on a store page
│   │   └── RegisterPage.js      # register form (email + terms checkbox)
│   └── specs/
│       ├── catalog.bva.spec.js
│       ├── price.bva.spec.js
│       └── register.bva.spec.js
├── utilities/
│   ├── config.js                # env-driven settings
│   ├── data.js                  # makeKeyword, makeEmail, makePassword, parsePrice
│   ├── driver.js                # Chrome WebDriver setup
│   ├── fixtures.js              # usePage(): driver lifecycle per describe
│   ├── hooks.js                 # screenshot on failed test
│   ├── screenshot.js
│   ├── shared.js                # runCases, itOpensAndShowsTitle
│   └── wait.js                  # explicit waits, pause()
├── .env.example
├── .mocharc.json
├── biome.json
├── CONTRIBUTING.md
├── package.json
└── README.md
```

Generated and git-ignored: `reports/` (Mochawesome output and the TDD xlsx) and `screenshots/` (failure screenshots).

## Layers

| Layer     | Folder            | Responsibility                                                                                        |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| Data      | `data/bva/`       | Standard BVA values and expected results, no code                                                     |
| Locators  | `tests/locators/` | Selectors only, preferring `data-testid`. When Gramedia changes its UI, fix it here                   |
| Pages     | `tests/pages/`    | User actions on top of locators. `BasePage` adds navigation retry, 429 backoff and promo popup guard  |
| Specs     | `tests/specs/`    | Load data, call page actions, assert with Chai                                                        |
| Utilities | `utilities/`      | Config, driver, explicit waits, action delay, data generators, failure screenshots                    |

Flow: `spec` reads `data`, calls `page`, the page uses `locators` and `utilities`, and Selenium drives the browser.

## Utilities worth knowing

- **`usePage(PageClass)`** creates one Chrome driver per `describe` in `before` and quits it in `after`.
- **`runCases(cases, run)`** creates one Mocha test per data entry, titled `<id>: <description>`.
- **`wait.js`** looks the element up again on every poll, so an element replaced by a React re-render does not fail the test. `pause()` is only a rate-limit delay between user actions, never a wait for the page.
- **`driver.js`** starts Chrome in incognito with no extensions and `--headless=new` when `HEADLESS=true` or no display is available.
- **`hooks.js`** saves a screenshot for every failed test and attaches its path to the Mochawesome report.
- **`data.js`** generates inputs of an exact length: `makeKeyword`, `makeEmail` (a valid email with a total length of exactly `length`, respecting the RFC 5321 limits), `makePassword`.

## Test design notes

**Disabled-state cases.** For cases that expect the Daftar button to be disabled, the test first fills a valid form and asserts the button is enabled, then swaps the field under test to the boundary value and asserts the button becomes disabled. Without that control step, a button that is disabled from the start would pass without proving anything.

**Rate limiting (HTTP 429).** The site answers "Too Many Requests" when the runner IP sends too much traffic. The suite handles it in three ways:

- `ACTION_DELAY_MS` pauses after every click and keystroke action.
- `BasePage.navigate()` allows 3 attempts. When a timeout happens and the page says "Too Many Requests", it waits `20s x attempt` (20s, then 40s) before retrying.
- Every failed navigation attempt logs the URL, title and rate-limit flag, and saves a screenshot.

**Reports.** Specs use Mochawesome. A failed test saves a screenshot and attaches its path to the report. The same JSON feeds the [TDD report](TDD_REPORT.md).
