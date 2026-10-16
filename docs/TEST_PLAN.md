# Test Plan: Gramedia.com

Source: _Desain Test Strategi, Planning, Test Case dan Skenario Pada Gramedia.com_ (Tugas 04, Group 13: Human Error). This document mirrors the report. If the two ever differ, the report is authoritative.

## 1. Object Under Test

| Item                | Detail                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| Application         | Gramedia.com (<https://www.gramedia.com/>), web version                      |
| Type                | Dynamic e-commerce web application (online bookstore)                      |
| Observation         | From the outside, without access to source code                            |
| Test type           | Black-box, validation and system level                                     |
| Reference standards | ISO/IEC/IEEE 29119-2 and 29119-3, ISO/IEC 25010                            |
| Approach            | Risk-Based Testing (RBT): high-risk features are tested earlier and deeper |
| Authors             | Group 13: Human Error                                                      |
| Period              | 12 October to 6 November 2026                                              |

## 2. Test Strategy

**Test types**

1. Manual: exploratory and test-case-based on all in-scope modules.
2. Automated: regression of main flows (login, search, add to cart) with Selenium WebDriver.
3. Functional: catalog, product detail, promo, account, cart, checkout, customer service.
4. Non-functional: usability, compatibility (browsers and devices), performance (page load time), basic security (HTTPS, input validation).

**Test levels**

| Level       | Performed     | Note                                                                                   |
| ----------- | ------------- | -------------------------------------------------------------------------------------- |
| Unit        | No            | No source code access                                                                  |
| Integration | No (internal) | Only observed from the UI, e.g. payment gateway and courier options at checkout        |
| Validation  | Yes           | Features match e-commerce user needs: search, choose, buy books                        |
| System      | Yes           | End-to-end on the whole system: functional, compatibility, performance, basic security |

**Test design techniques** (ISO/IEC/IEEE 29119-4): Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition.

This repository covers **automated Standard BVA only**.

**Tools**

| Purpose            | Tool                                |
| ------------------ | ----------------------------------- |
| Test cases         | Google Sheets                       |
| Defect tracking    | Jira / Trello                       |
| Automation         | Selenium WebDriver                  |
| Performance        | Google Lighthouse, JMeter (light)   |
| API and inspection | Postman, Chrome DevTools            |
| Compatibility      | BrowserStack / DevTools Device Mode |

**Ethical limits:** testing runs on the production site, so there are no real payment transactions, no destructive load/stress tests, and no intrusive penetration testing.

## 3. Test Objectives

1. Find defects early in the main purchase flow (search, cart, checkout).
2. Verify that Gramedia.com functions match e-commerce user needs: find, choose, and buy books correctly.
3. Validate transactional data accuracy (price, discount, item count, total, shipping cost) across all pages.
4. Measure quality and user trust based on ISO/IEC 25010.
5. Prevent end-user failures such as checkout errors, failed login, or pages that do not load.
6. Produce test documentation (test plan, test cases, defect reports) per ISO/IEC/IEEE 29119-3.

## 4. Test Scope

### In-scope

| No  | Module                       | Test focus                                                                     |
| --- | ---------------------------- | ------------------------------------------------------------------------------ |
| 1   | Product Catalog & Categories | Category view, price, discount, filter, sorting, pagination                    |
| 2   | Product Detail               | Information completeness, format options, breadcrumb, images                   |
| 3   | Promo & Campaign             | Promo banners, discount price accuracy, promo page links                       |
| 4   | Store Locator                | Branch location search and display                                             |
| 6   | Content / Blog               | Article display and navigation                                                 |
| 7   | Customer Service             | "Hubungi Kami" form, WhatsApp link                                             |
| 10  | Account & Authentication     | Registration, login, logout, input validation, password reset                  |
| 11  | Cart & Checkout              | Add, change, remove items, total calculation, flow up to payment stage         |
| 12  | Payment & Shipping           | Payment method and courier options, shipping cost calculation (before payment) |
| –   | Non-functional               | Responsiveness, browser compatibility, performance, basic security             |

### Out-of-scope

| Item                                                 | Reason                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Real payment transactions                            | Incur real cost                                         |
| Internal payment gateway and courier systems         | Managed by third parties                                |
| Module 9: Mobile App Channel                         | Group focuses on the web version only                   |
| Module 5: Affiliate & Partnership                    | Requires an official partnership process                |
| Module 8: Social Media Integration                   | External platform content, only link opening is checked |
| Large-scale load/stress and deep penetration testing | Risks disrupting the production site                    |
| Server, database, source code                        | No access (black-box)                                   |

### BVA curation status

All in-scope modules are currently BVA candidates. Deciding which of them have bounded inputs is a separate curation step and is **pending**.

## 5. Entry, Exit, and Suspend/Resume

**Entry criteria**

1. Gramedia.com is accessible and stable.
2. All 12 modules are identified.
3. Test cases are reviewed by the group.
4. Test accounts and environment are ready.

**Exit criteria**

1. 100% of high-priority test cases executed.
2. At least 90% of all test cases executed.
3. No open Critical defect without documentation.
4. Test report completed.

**Suspend/resume:** testing is paused when the site is down or under maintenance and resumed once it returns to normal.

## 6. Risk Allocation (ISO/IEC 25010)

| Quality characteristic | Risk area                             | Effort |
| ---------------------- | ------------------------------------- | ------ |
| Functional suitability | Checkout, price, discount, account    | High   |
| Security               | Login, input validation, HTTPS        | High   |
| Performance efficiency | Catalog page load time                | Medium |
| Compatibility          | Different browsers and devices        | Medium |
| Usability              | Navigation, search, responsive layout | Medium |

## 7. Resources

| Role                     | Person                | Responsibility                                    |
| ------------------------ | --------------------- | ------------------------------------------------- |
| Test Manager             | Rakha Hafidz Fauzan   | Plan, schedule, coordination, final report        |
| QA Engineer              | Muhammad Hilmi        | Design and execute manual test cases, log defects |
| Automation Tester        | Ghifari Ezra Ramadhan | Selenium automation scripts                       |
| Security Auditor (basic) | Ghifari Ezra Ramadhan | HTTPS and input validation checks                 |

**Hardware and software:** laptop (Windows 11 / macOS), Android and iOS smartphones; Chrome, Firefox, Edge, Safari (latest versions); stable WiFi and Fast 3G simulation.

## 8. Schedule

| Phase                | Activity                                               | Start       | End         |
| -------------------- | ------------------------------------------------------ | ----------- | ----------- |
| 1. Planning          | Observe site, identify modules, strategy and test plan | 12 Oct 2026 | 16 Oct 2026 |
| 2. Test design       | Test scenarios and test cases                          | 19 Oct 2026 | 23 Oct 2026 |
| 3. Environment setup | Test accounts, browsers, tools, automation scripts     | 19 Oct 2026 | 23 Oct 2026 |
| 4. Execution         | Manual and automated execution, defect logging         | 26 Oct 2026 | 3 Nov 2026  |
| 5. Reporting         | Result recap, defect analysis, final report            | 4 Nov 2026  | 6 Nov 2026  |

**Milestones**

- **M1:** Test Plan done (16 Oct)
- **M2:** all test cases reviewed (23 Oct)
- **M3:** execution done (3 Nov)
- **M4:** final report submitted (6 Nov)

**Dependencies**

- Execution starts after test cases are reviewed.
- Checkout and Payment tests start only after Account and Cart tests pass (sequential).
- Automation scripts are written after the manual flow is validated.

## 9. Test Environment

| Component   | Specification                                                        |
| ----------- | -------------------------------------------------------------------- |
| Application | Gramedia.com, production                                             |
| Client      | Laptop (Chrome, Firefox, Edge, Safari), Android/iOS smartphone       |
| Resolution  | Desktop 1920x1080 and 1366x768, tablet 768px, mobile 375px           |
| Network     | Normal WiFi                                                          |
| Test data   | Dedicated team test account, sample products from several categories |

**Environment rules**

1. Use a separate browser profile (incognito or fresh profile) without extensions or cache, so results are stable and isolated.
2. Testers use a dedicated test account, never a personal account.
3. Checkout stops before final payment.
4. All results are documented with screenshots and screen recordings.

## 10. Risks

| ID  | Category  | Risk                                            | Impact | Likelihood | Mitigation                           | Contingency                             |
| --- | --------- | ----------------------------------------------- | ------ | ---------- | ------------------------------------ | --------------------------------------- |
| R1  | Project   | Schedule clashes with midterm/final exams       | High   | Medium     | Schedule set early                   | Reduce coverage of low-priority modules |
| R2  | Project   | Limited team (3 people)                         | Medium | Medium     | Clear roles, weekly check-ins        | Reassign tasks between members          |
| R3  | Project   | No budget for paid tools                        | Medium | High       | Use free/open-source tools           | Fall back to manual testing             |
| R4  | Technical | Site UI/features change during testing          | High   | Medium     | Dated screenshots, short test period | Update test cases                       |
| R5  | Technical | Anti-bot (captcha/rate limit) blocks automation | Medium | High       | Limit access frequency, add delays   | Test manually                           |
| R6  | Technical | Payment flow cannot be fully tested             | High   | High       | Stop at payment method selection     | Record as a limitation                  |
| R7  | Technical | Site slow or down during promotions             | Medium | Medium     | Test at different hours              | Re-run at another time                  |
| R8  | Technical | Results differ across browsers/devices          | Medium | Medium     | Test several combinations            | Log as a compatibility defect           |

Risk management steps: (1) identify risks, (2) analyze impact and likelihood, (3) mitigate, (4) contingency plan.
