# Test Plan

Scope, rules and limits of the automation. The full test strategy is in the report _Desain Test Strategi, Planning, Test Case dan Skenario Pada Gramedia.com_ (Assignment 04, Group 13).

## Modules under test

| No  | Module                       | Bounded variables                              | ID prefix  | Status      |
| --- | ---------------------------- | ---------------------------------------------- | ---------- | ----------- |
| 10  | Account & Authentication     | Email length                                   | `AUTH-BVA` | Implemented |
| 1   | Product Catalog & Categories | Search keyword length, price filter (min, max) | `CAT-BVA`  | Implemented |
| 11  | Cart & Checkout              | Item quantity (min 1, max = stock)             | `CART-BVA` | Planned     |
| 7   | Customer Service             | Message field length in "Hubungi Kami" form    | `CS-BVA`   | Planned     |

Modules 2, 3, 4 and 6 have no bounded inputs and are covered by non-BVA smoke tests. Modules 5, 8, 9 and real payment transactions are **out of scope**.

See [Test Suites](TEST_SUITES.md) for the implemented cases.

## Testing ethics and rules

Tests run against the **production site**, so:

1. **No real payment transactions.** Checkout stops before final payment.
2. No load or stress testing and no intrusive penetration testing.
3. Use a clean browser profile (the driver starts Chrome in incognito with no extensions).
4. Keep a delay between actions (`ACTION_DELAY_MS`) to avoid anti-bot and rate limits.
5. Use explicit waits for page readiness. `pause()` is only a rate-limit delay between user actions.
6. Registration tests only fill the form and never click Daftar. A submit would send a real OTP email, and the site allows only 3 attempts per day for each email.
7. Document results with screenshots and screen recordings. Review failure screenshots before publishing a report, since they may show a rate-limit page or form input.

## Limitations

- The site UI can change at any time, which may break selectors. The register form already changed once: it now asks only for email and terms in the first step.
- The **OTP verification page** and anything after it are not automated, because reaching them needs a real submit (see rule 6).
- Captcha or anti-bot protection may block automation.
- The site rate-limits by IP (HTTP 429), so results on shared CI runners can be flaky.
- The payment flow cannot be tested end to end.
- Cart & Checkout and Customer Service suites are not implemented yet.
