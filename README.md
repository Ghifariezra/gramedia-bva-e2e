<div align="center">

# Analisis Nilai Batas (Boundary Value Analysis) pada Pengujian Black Box Gramedia.com

### Standard BVA test automation, based on the modules of Gramedia.com

![Technique](<https://img.shields.io/badge/technique-Standard%20BVA%20(Type%20A)-2ea44f>)
![Testing](https://img.shields.io/badge/testing-black--box%20E2E-blue)
![Selenium](https://img.shields.io/badge/Selenium-WebDriver-43B02A?logo=selenium&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-Chai-8D6748?logo=mocha&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)

_Bugs hide at the edges, not in the middle. So we test the edges._

</div>

> Academic project, Informatics Engineering, Universitas Pancasila (Software Testing & Validation course). Not affiliated with Gramedia.

---

## Table of Contents

- [Overview](#overview)
- [Why Boundary Value Analysis?](#why-boundary-value-analysis)
- [Standard BVA at a Glance](#standard-bva-at-a-glance)
- [Modules Under Test](#modules-under-test)
- [Boundary Table](#boundary-table)
- [Example Test Cases](#example-test-cases)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Architecture Layers](#architecture-layers)
- [Getting Started](#getting-started)
- [Running the Tests](#running-the-tests)
- [Testing Ethics & Rules](#testing-ethics--rules)
- [Limitations](#limitations)
- [Team](#team)
- [License](#license)

---

## Overview

This repository automates **black-box, end-to-end tests** for [Gramedia.com](https://www.gramedia.com/) using **Standard Boundary Value Analysis (Type A)**.

Test targets are taken from the modules identified in our report _Desain Test Strategi, Planning, Test Case dan Skenario Pada Gramedia.com_ (Assignment 04, Group 13, Human Error). Only modules with **bounded inputs** are covered by BVA.

## Why Boundary Value Analysis?

System errors tend to occur at the boundaries of an input range, not at the average values in the middle. BVA targets the most common causes:

| Root cause                  | Example                                               |
| --------------------------- | ----------------------------------------------------- |
| **Logic operator mistakes** | `<=` written as `<`, or `>=` swapped with `>`         |
| **Off-by-one errors**       | Loop or limit is one unit away from the real boundary |
| **Ambiguous requirements**  | The spec never states the exact limit                 |

Benefits: fewer test cases without losing bug-detection power, high precision on error-prone areas, and **automation-ready** by design.

## Standard BVA at a Glance

For every bounded input with range `[min, max]`, each boundary gets **three critical points**:

```
        invalid       valid                          valid       invalid
  ──────── │ ───────── │ ───────── ... ───────── │ ───────── │ ────────
        min-1         min   min+1          max-1   max        max+1
       (below)     (boundary)(above)      (below)(boundary)   (above)
```

| Point   | Meaning                       | Expected |
| ------- | ----------------------------- | -------- |
| `min-1` | Just below the lower boundary | Rejected |
| `min`   | Exactly on the lower boundary | Accepted |
| `min+1` | Just above the lower boundary | Accepted |
| `max-1` | Just below the upper boundary | Accepted |
| `max`   | Exactly on the upper boundary | Accepted |
| `max+1` | Just above the upper boundary | Rejected |

> **Out of scope:** Robustness BVA (Type B), which feeds extreme values far beyond the requirement to test error-handling resilience.

## Modules Under Test

| No  | Module                       | Bounded variables                           | ID prefix  |
| --- | ---------------------------- | ------------------------------------------- | ---------- |
| 10  | Account & Authentication     | Password length, name length, email length  | `AUTH-BVA` |
| 11  | Cart & Checkout              | Item quantity (min 1, max = stock)          | `CART-BVA` |
| 1   | Product Catalog & Categories | Price filter range, pagination page number  | `CAT-BVA`  |
| 7   | Customer Service             | Message field length in "Hubungi Kami" form | `CS-BVA`   |

Modules 2, 3, 4, and 6 have no bounded inputs and are covered by non-BVA smoke tests. Modules 5, 8, 9 and real payment transactions are **out of scope** (see Test Scope in the report).

## Boundary Table

Values are filled in from direct observation of the live site, not guessed.

| Variable                      | Min | Max         | Source            |
| ----------------------------- | --- | ----------- | ----------------- |
| Password length               | TBD | TBD         | Registration form |
| Item quantity                 | 1   | TBD (stock) | Cart page         |
| Price filter                  | 0   | TBD         | Catalog filter    |
| "Hubungi Kami" message length | TBD | TBD         | Contact form      |

## Example Test Cases

Cart quantity with `min = 1` and `max = stock` (shown as `S`):

| ID          | Input | Class           | Expected result                    |
| ----------- | ----- | --------------- | ---------------------------------- |
| CART-BVA-01 | `0`   | Invalid (min-1) | Rejected / cannot decrease below 1 |
| CART-BVA-02 | `1`   | Valid (min)     | Accepted                           |
| CART-BVA-03 | `2`   | Valid (min+1)   | Accepted                           |
| CART-BVA-04 | `S-1` | Valid (max-1)   | Accepted                           |
| CART-BVA-05 | `S`   | Valid (max)     | Accepted                           |
| CART-BVA-06 | `S+1` | Invalid (max+1) | Rejected / stock message shown     |

ID format: `<MODULE>-BVA-<number>`. Each case records the variable, input value, class (valid/invalid), expected result, and actual result.

## How It Works

```mermaid
flowchart LR
    A[Identify module] --> B[Find bounded inputs]
    B --> C[Observe min / max on live site]
    C --> D[Derive 6 Standard BVA values]
    D --> E[Store in data/bva/*.json]
    E --> F[Specs run each value via Selenium]
    F --> G[Compare actual vs expected]
    G --> H[Report pass / fail]
```

Test data is separated from test logic. Example `data/bva/cart.json`:

```json
{
  "variable": "quantity",
  "min": 1,
  "max": 10,
  "cases": [
    {
      "id": "CART-BVA-01",
      "value": 0,
      "class": "invalid",
      "expect": "rejected"
    },
    { "id": "CART-BVA-02", "value": 1, "class": "valid", "expect": "accepted" },
    { "id": "CART-BVA-03", "value": 2, "class": "valid", "expect": "accepted" },
    { "id": "CART-BVA-04", "value": 9, "class": "valid", "expect": "accepted" },
    {
      "id": "CART-BVA-05",
      "value": 10,
      "class": "valid",
      "expect": "accepted"
    },
    {
      "id": "CART-BVA-06",
      "value": 11,
      "class": "invalid",
      "expect": "rejected"
    }
  ]
}
```

> `max: 10` above is a placeholder. Replace it with the real observed limit.

## Project Structure

```
gramedia-bva-e2e/
├── data/
│   └── bva/                     # BVA test data per module (JSON)
├── tests/
│   ├── locators/                # element selectors per page
│   ├── pages/                   # Page Object Model
│   └── specs/                   # Mocha specs (one per module)
├── utilities/                   # WebDriver setup, wait helpers
├── .env.example
├── .mocharc.json
├── package.json
└── README.md
```

## Architecture Layers

Each layer has one job, so a UI change only touches one place.

| Layer     | Folder            | Responsibility                                                        |
| --------- | ----------------- | --------------------------------------------------------------------- |
| Data      | `data/bva/`       | Standard BVA values and expected results, no code                     |
| Locators  | `tests/locators/` | Selectors only (CSS/XPath). When Gramedia changes its UI, fix it here |
| Pages     | `tests/pages/`    | User actions built on locators (type, click, read message)            |
| Specs     | `tests/specs/`    | Loop over BVA data, call page actions, assert with Chai               |
| Utilities | `utilities/`      | Driver setup, explicit-wait helpers, delay, screenshot on failure     |

Flow: `spec` reads `data` → calls `page` → page uses `locators` and `utilities` → Selenium drives the browser.

## Getting Started

**Prerequisites**

- Node.js 20+
- Latest Google Chrome
- A dedicated test account (never a personal account)

**Install**

```bash
git clone https://github.com/<username>/gramedia-bva-e2e.git
cd gramedia-bva-e2e
npm install
cp .env.example .env
```

**Configure `.env`**

```env
BASE_URL=https://www.gramedia.com
TEST_EMAIL=
TEST_PASSWORD=
BROWSER=chrome
HEADLESS=false
ACTION_DELAY_MS=1000
```

## Running the Tests

```bash
npm test                  # run everything
npm run test:auth         # Account & Authentication
npm run test:cart         # Cart & Checkout
npm run test:catalog      # Product Catalog
npm run test:cs           # Customer Service
```

## Testing Ethics & Rules

Tests run against the **production site**, so:

1. **No real payment transactions.** Checkout stops before final payment.
2. No load/stress testing or intrusive penetration testing.
3. Use a clean browser profile (no extensions or cache) and a dedicated test account.
4. Keep a delay between actions (`ACTION_DELAY_MS`) to avoid anti-bot and rate limits.
5. Use explicit waits, never fixed `sleep`.
6. Document results with screenshots and screen recordings.

## Limitations

- The site UI can change at any time, which may break selectors.
- Captcha or anti-bot protection may block automation.
- The payment flow cannot be tested end to end.

## Team

**Group 13: Human Error**

| Name                  | Student ID | Role              |
| --------------------- | ---------- | ----------------- |
| Rakha Hafidz Fauzan   | 4524210082 | Test Manager      |
| Muhammad Hilmi        | 4524210066 | QA Engineer       |
| Ghifari Ezra Ramadhan | 4524210041 | Automation Tester |

Supervising lecturer: Dra. Sri Rezeki Candra N, M.Kom.

## License

MIT
