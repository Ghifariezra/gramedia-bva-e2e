# Test Suites

What is automated today, which values are tested, and what the site was observed to do. For the method behind the values, see [BVA Method](BVA_METHOD.md).

## Implemented suites

| Spec file              | Module          | Variable under test               | Case IDs                                               | BVA cases |
| ---------------------- | --------------- | --------------------------------- | ------------------------------------------------------ | --------- |
| `catalog.bva.spec.js`  | Product Catalog | Search keyword length             | `CAT-BVA-S01` to `S06`                                 | 6         |
| `price.bva.spec.js`    | Product Catalog | Min price, max price, range order | `CAT-BVA-M01` to `M07`, `X01` to `X07`, `R01` to `R03` | 17        |
| `register.bva.spec.js` | Account & Auth  | Email length                      | `AUTH-BVA-E01` to `E06`                                | 6         |

Total: **29 BVA cases**.

### Supporting checks (not BVA)

These are not boundary cases, so they have no BVA ID, except the terms checkbox:

| Spec                   | Check                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| every spec             | The page opens and shows the Gramedia title (3 tests)                                         |
| `register.bva.spec.js` | The register form opens from the navbar "Daftar" button                                       |
| `register.bva.spec.js` | `AUTH-PRE-01`: Daftar stays disabled while the terms checkbox is unchecked, enabled after it  |

Together with the BVA cases this gives **34 tests**.

## Boundary table

Values come from direct observation of the live site, not from assumptions.

| Variable                      | Min | Max                | Behavior at max+1                  | Source            |
| ----------------------------- | --- | ------------------ | ---------------------------------- | ----------------- |
| Search keyword length         | 3   | 50                 | Truncated to 50 characters         | Navbar search     |
| Price filter (min and max)    | 1   | 10,000,000,000,000 | Extra keystroke ignored            | Catalog filter    |
| Email length                  | 1   | 254                | Truncated to 254 characters        | Registration form |
| Item quantity                 | 1   | TBD (stock)        | Not tested yet                     | Cart page         |
| "Hubungi Kami" message length | TBD | TBD                | Not tested yet                     | Contact form      |

Searching with fewer than 3 characters shows a "minimum 3 karakter" toast and does not navigate.

> **Register form change.** The first step of the register form now has only the email field and the terms checkbox. The full name (1 to 150) and password (min 8) cases were removed together with their locators. Those fields, if they still exist, appear after the OTP step, which is not automated (see [Limitations](TEST_PLAN.md#limitations)).

## Example test cases

Catalog search keyword with `min = 3` and `max = 50` (`data/bva/catalog.json`):

| ID          | Input length | Class           | Expected result                                  |
| ----------- | ------------ | --------------- | ------------------------------------------------ |
| CAT-BVA-S01 | `2`          | Invalid (min-1) | Rejected: toast shown, URL does not go to search |
| CAT-BVA-S02 | `3`          | Valid (min)     | Accepted: search results page opens              |
| CAT-BVA-S03 | `4`          | Valid (min+1)   | Accepted                                         |
| CAT-BVA-S04 | `49`         | Valid (max-1)   | Accepted                                         |
| CAT-BVA-S05 | `50`         | Valid (max)     | Accepted                                         |
| CAT-BVA-S06 | `51`         | Invalid (max+1) | Truncated to 50 characters in the input          |

Register email length with `min = 1` and `max = 254` (`data/bva/register.json`):

| ID           | Input length | Class           | Expected result                                  |
| ------------ | ------------ | --------------- | ------------------------------------------------ |
| AUTH-BVA-E04 | `0`          | Invalid (min-1) | Rejected: Daftar button disabled                 |
| AUTH-BVA-E05 | `1`          | Valid (min)     | Accepted: Daftar button enabled                  |
| AUTH-BVA-E06 | `2`          | Valid (min+1)   | Accepted: Daftar button enabled                  |
| AUTH-BVA-E01 | `253`        | Valid (max-1)   | Accepted: all characters kept, button enabled    |
| AUTH-BVA-E02 | `254`        | Valid (max)     | Accepted: all characters kept, button enabled    |
| AUTH-BVA-E03 | `255`        | Invalid (max+1) | Truncated to 254 characters in the input         |

Each case records the variable, input, class (valid or invalid), expected result and actual result.

## Defect candidates

Findings recorded in the Mochawesome report as "Defect Candidate" context instead of failing the test. They also appear in the Notes column of the [TDD report](TDD_REPORT.md).

- `CAT-BVA-M07`: `?min_price=10000000000001` stays in the URL while the input is empty, so URL state and UI state disagree.
- `AUTH-BVA-E05` and `E06`: an email without `@` still enables the Daftar button. No client-side format validation was observed and there is no specification, so the test asserts only the observed behavior.
