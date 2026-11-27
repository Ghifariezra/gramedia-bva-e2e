<div align="center">

# Analisis Nilai Batas (Boundary Value Analysis) pada Pengujian Black Box Gramedia.com

### Standard BVA test automation, based on the modules of Gramedia.com

![Technique](<https://img.shields.io/badge/technique-Standard%20BVA%20(Type%20A)-2ea44f>)
![Testing](https://img.shields.io/badge/testing-black--box%20E2E-blue)
![Selenium](https://img.shields.io/badge/Selenium-WebDriver-43B02A?logo=selenium&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-Chai-8D6748?logo=mocha&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)

_Bugs hide at the edges, not in the middle. So we test the edges._

</div>

> Academic project, Informatics Engineering, Universitas Pancasila (Software Testing & Validation course). Not affiliated with Gramedia.

---

## Overview

This repository automates **black-box, end-to-end tests** for [Gramedia.com](https://www.gramedia.com/) using **Standard Boundary Value Analysis (Type A)** with Selenium WebDriver, Mocha and Chai.

Test targets come from the report _Desain Test Strategi, Planning, Test Case dan Skenario Pada Gramedia.com_ (Assignment 04, Group 13, Human Error). Only modules with **bounded inputs** are covered by BVA.

| Suite                  | Module          | Variable under test               | BVA cases |
| ---------------------- | --------------- | --------------------------------- | --------- |
| `catalog.bva.spec.js`  | Product Catalog | Search keyword length             | 6         |
| `price.bva.spec.js`    | Product Catalog | Min price, max price, range order | 17        |
| `register.bva.spec.js` | Account & Auth  | Email length                      | 6         |

Total: **34 tests**, made of 29 BVA cases and 5 supporting checks (page opens, navigation to the register form, terms checkbox precondition). Details are in [Test Suites](docs/TEST_SUITES.md).

## Quick Start

Requirements: Node.js 22+ and the latest Google Chrome.

```bash
git clone https://github.com/Ghifariezra/gramedia-bva-e2e.git
cd gramedia-bva-e2e
npm install
cp .env.example .env
npm test
```

Environment variables are described in [Setup](docs/SETUP.md#configuration).

## Commands

| Command                                  | What it does                                                         |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `npm test`                               | Run every suite                                                      |
| `npm run test:register`                  | Run the register suite only (also `test:catalog`, `test:price`)      |
| `npm run test:headless`                  | Run every suite in headless Chrome                                   |
| `npm run test:ci`                        | Serial headless run with a Mochawesome HTML report (used in CI)      |
| `npm run test:parallel`                  | Local parallel run with a Mochawesome HTML report                    |
| `npm run test:tdd`, `npm run report:tdd` | Run the suites, then build the Test Case TDD `.xlsx` report          |
| `npm run check`, `npm run check:fix`     | Lint and format with Biome                                           |
| `npm run verify`                         | `biome ci` followed by the full test run                             |

## Documentation

| Document                                | What is inside                                                          |
| --------------------------------------- | ----------------------------------------------------------------------- |
| [BVA Method](docs/BVA_METHOD.md)        | Why BVA, the six Standard BVA points, expected result types, data flow  |
| [Test Suites](docs/TEST_SUITES.md)      | Case IDs, boundary table, example cases, defect candidates              |
| [Architecture](docs/ARCHITECTURE.md)    | Project structure, layers, test design notes (disabled states, 429)     |
| [Setup](docs/SETUP.md)                  | Install, `.env` settings, running tests, CI behavior                    |
| [TDD Report](docs/TDD_REPORT.md)        | Generating the Test Case TDD spreadsheet with charts and bug report     |
| [Test Plan](docs/TEST_PLAN.md)          | Modules in scope, testing ethics and rules, limitations                 |
| [Contributing](CONTRIBUTING.md)         | Claiming issues, branches, commits and pull requests                    |

## Testing Ethics

The tests run against the **production site**. The short version:

1. No real payment transactions, no load or stress testing.
2. Registration tests only fill the form and never click Daftar. A submit sends a real OTP email and the site allows only 3 attempts per day for each email.
3. Keep the delay between actions (`ACTION_DELAY_MS`) to stay under rate limits.

The full list is in [Test Plan](docs/TEST_PLAN.md#testing-ethics-and-rules).

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
