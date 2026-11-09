# Test cases

Worked out by hand and checked with a reference script. The tax engine must reproduce every number exactly (whole taka).
Put these in `tests/test-cases.js` and make `tests/run-tests.html` show PASS/FAIL for each.

## Quick saver (salary only, no investments entered)

| # | Input | Taxable | Tax if no invest | Invest needed | You save | Tax if invest |
|---|---|---|---|---|---|---|
| Q1 | Salary 12,00,000, General | 8,00,000 | 45,000 | 2,40,000 | 24,000 | 21,000 |
| Q2 | Salary 6,00,000, General | 4,00,000 | 0 | 0 | 0 | 0 → "You pay no tax" |
| Q3 | Salary 6,75,000, General | 4,50,000 | 5,000 | 0 | 0 | 5,000 → "Already at minimum tax" |
| Q4 | Salary 6,75,000, General, first return | 4,50,000 | 5,000 | 40,000 | 4,000 | 1,000 |
| Q5 | Salary 30,00,000, General | 25,00,000 | 4,15,000 | 7,50,000 | 75,000 | 3,40,000 |
| Q6 | Salary 12,00,000, Woman | 8,00,000 | 37,500 | 2,40,000 | 24,000 | 13,500 |
| Q7 | Salary 9,00,000, Third gender | 6,00,000 | 7,500 | 25,000 | 2,500 | 5,000 |
| Q8 | Salary 2,60,00,000, General | 2,55,00,000 | 72,60,000 | 75,00,000 | 7,50,000 (cap) | 65,10,000 |

Hand check for Q1: exempt = min(12,00,000 ÷ 3, 5,00,000) = 4,00,000 → taxable 8,00,000. Tax: first 4,00,000 at 0; next 3,00,000 at 10% = 30,000; last 1,00,000 at 15% = 15,000 → 45,000. Max rebate = 3% × 8,00,000 = 24,000 → invest 24,000 ÷ 10% = 2,40,000.

## Full calculator

| # | Input | Slab tax | Rebate | Surcharge | Filing adj. | Tax to pay |
|---|---|---|---|---|---|---|
| D1 | Salary 12,00,000, General; DPS 60,000 + PF 72,000; file Oct–Dec | 45,000 | 13,200 | 0 | 0 | 31,800 |
| D2 | Salary 12,00,000; DPS 2,00,000 (counts 1,20,000) + Sanchayapatra 7,00,000 (counts 5,00,000) | 45,000 | 24,000 (3% cap) | 0 | 0 | 21,000 |
| D3 | Salary 30,00,000; net wealth 6 crore; no investments | 4,15,000 | 0 | 41,500 | 0 | 4,56,500 |
| D4 | As D1, filed Jul–Sep | 45,000 | 13,200 | 0 | −1,590 | 30,210 |
| D5 | As D1, filed Jan–Mar | 45,000 | 13,200 | 0 | +3,000 (minimum) | 34,800 |
| D6 | Salary 12,00,000; 2 cars; net wealth 2 crore | 45,000 | 0 | 4,500 | 0 | 49,500 |
| D7 | Salary 10,00,000 + rent 3,00,000; parent of 1 child with disability | 62,500 | 0 | 0 | 0 | 62,500 |

D7 detail: exempt = 3,33,333 → taxable 9,66,667; threshold 4,00,000 + 50,000 = 4,50,000; 3,00,000 at 10% = 30,000; 2,16,667 at 15% = 32,500 → 62,500.

D1 also drives the "You could have saved Tk 10,800 more" line: the full rebate would be 24,000; the user got 13,200; the gap is 10,800, needing 1,08,000 more investment.
