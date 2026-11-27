# Setup

Install, configure and run the suites.

## Prerequisites

- Node.js 22+
- Latest Google Chrome

## Install

```bash
git clone https://github.com/Ghifariezra/gramedia-bva-e2e.git
cd gramedia-bva-e2e
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

## Configuration

Edit `.env`:

```env
BASE_URL=https://www.gramedia.com
BROWSER=chrome
HEADLESS=false
ACTION_DELAY_MS=1000
EXPLICIT_WAIT_MS=15000
PAGE_LOAD_TIMEOUT_MS=30000
# Optional
CHROME_BIN=
CHROMEDRIVER_PATH=
NO_SANDBOX=false
```

| Variable               | Default                    | Purpose                                                  |
| ---------------------- | -------------------------- | -------------------------------------------------------- |
| `BASE_URL`             | `https://www.gramedia.com` | Site under test                                          |
| `BROWSER`              | `chrome`                   | Only Chrome is supported                                 |
| `HEADLESS`             | auto                       | Forced on when no display is available (for example CI)  |
| `ACTION_DELAY_MS`      | `1000`                     | Pause after each action to stay under rate limits        |
| `EXPLICIT_WAIT_MS`     | `15000`                    | Default explicit wait                                    |
| `PAGE_LOAD_TIMEOUT_MS` | `30000`                    | Page load timeout                                        |
| `CHROME_BIN`           | empty                      | Custom Chrome binary, must exist if set                  |
| `CHROMEDRIVER_PATH`    | empty                      | Custom chromedriver, must exist if set                   |
| `NO_SANDBOX`           | `false`                    | Adds `--no-sandbox` for containers and CI                |

## Running the tests

```bash
npm test                  # run everything
npm run test:headless     # run everything in headless Chrome
npm run test:parallel     # local parallel run with an HTML report
```

Run a single suite:

```bash
npm run test:catalog      # search keyword length
npm run test:price        # price filter
npm run test:register     # registration form
```

Add `:report` (for example `npm run test:register:report`) to write a timestamped Mochawesome HTML report to `reports/`.

For a spreadsheet report in the Test Case TDD format, see [TDD Report](TDD_REPORT.md).

## Code quality

```bash
npm run check             # Biome lint and format check
npm run check:fix         # apply the fixes
npm run verify            # biome ci, then the full test run
```

`verify` runs the whole suite against the production site, so it takes a few minutes.

## CI

In CI the suite runs serially (`npm run test:ci`) in headless mode with a 2 second action delay, because running three browsers in parallel triggers HTTP 429 from the site. The Mochawesome HTML report is generated as `reports/index.html` and deployed by the report workflow.
