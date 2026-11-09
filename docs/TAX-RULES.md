# Tax rules — AY 2026-27 and AY 2027-28 (individuals, residents)

Every number the calculator uses lives in ONE file: `js/tax-rules.js`.
Nothing in this file may be hard-coded anywhere else.

Status key: ✅ confirmed in the Finance Act 2026 gazette (30 June 2026) or the Income Tax Act 2023 · 🟡 confirmed by secondary sources only.

## 1. Which year each mode uses

| Mode | Income year | Assessment year | Why |
|---|---|---|---|
| Quick saver | July 2026 – June 2027 | 2027-28 | Planning: the user can still invest before 30 June 2027 |
| Full calculator | July 2025 – June 2026 | 2026-27 | The return being filed now |

AY 2026-27 and AY 2027-28 share the same slabs, thresholds, minimum tax and surcharge (Finance Act 2026, Schedule 2, Part 1, Para-Ka), so one rules set covers both. Keep the year as a label/config value, not a separate rules table.

## 2. Tax-free threshold by category ✅ (FA 2026, Sch. 2, Part 1, Para-Ka, provisos ka–gha)

| Category (UI label) | Threshold (Tk) |
|---|---|
| General | 4,00,000 |
| Woman, or aged 65+ | 4,50,000 |
| Person with disability | 5,25,000 |
| Third gender | 5,25,000 |
| Gazetted war-wounded freedom fighter / gazetted July fighter | 5,50,000 |
| Parent or legal guardian of a person with disability | +50,000 per such child (only one parent claims) — Full calculator only |

## 3. Slabs (applied to income above the threshold) ✅

| Band | Rate |
|---|---|
| Next 3,00,000 | 10% |
| Next 4,00,000 | 15% |
| Next 5,00,000 | 20% |
| Next 20,00,000 | 25% |
| Rest | 30% |

## 4. Salary exemption 🟡

Exempt part of salary = the LOWER of (one-third of salary) or Tk 5,00,000.
Source: Finance Ordinance 2025 raised the cap from 4.5 lakh to 5 lakh (Daily Sun, rakibhassan.eu, NBR-based calculators). Our copy of the Income Tax Act (Sixth Schedule Part 1 para 27) still says 4.5 lakh because it predates the Ordinance. Keep the cap as one constant so it is easy to change.
Round the exempt amount to the nearest taka.

Taxable income = salary − salary exemption + other income (Full calculator only; no exemption on other income).

## 5. Minimum tax ✅ (FA 2026, Sch. 2, Para-Ka, proviso cha)

If taxable income is above the threshold: minimum tax = Tk 5,000; for a NEW taxpayer (first return) Tk 1,000. Location no longer matters.
If taxable income is at or below the threshold: tax = 0.
Final tax (before surcharge) can never fall below the minimum tax.

## 6. Investment rebate ✅ (ITA 2023 s.78, as amended by FA 2026)

Rebate = the LOWEST of:
- 3% of taxable income
- 10% of eligible investment
- Tk 7,50,000

and the rebate may not push tax below the minimum tax (rebate ≤ slab tax − minimum tax; never negative).

### Eligible investments (ITA 2023, Sixth Schedule Part 3; FA 2026 changes)

| Type (UI label) | Cap on the amount that counts |
|---|---|
| Sanchayapatra / government securities | 5,00,000 |
| DPS (bank or finance company — IDLC qualifies) | 1,20,000 |
| Mutual funds / unit funds / ETFs | No cap from FA 2026 (old 5 lakh cap removed) |
| Listed shares (new investment this year) | No cap |
| Life insurance premium | Up to 10% of sum assured (prototype: no cap; show the note) |
| Provident fund (employee + employer, recognised fund) | No cap |
| Universal Pension Scheme | No cap |
| Other eligible (donations to approved bodies, etc.) | No cap |

Investments must be made during the income year. Fixed deposits do NOT count.

## 7. Quick saver: the "optimum investment"

```
maxSaving       = max(0, min(0.03 × taxable, 7,50,000, slabTax − minimumTax))   [0 if taxable ≤ threshold]
investNeeded    = maxSaving ÷ 0.10
taxIfNoInvest   = max(slabTax, minimumTax)   [0 if taxable ≤ threshold]
taxIfInvest     = taxIfNoInvest − maxSaving
```
If maxSaving = 0, say plainly that investing won't lower this person's tax (either no tax, or already at the minimum).

## 8. Wealth surcharge ✅ (FA 2026, Sch. 2, Part 2, Para-Ka, page 20430)

Charged on the tax computed at the slab rates (before the rebate).

| Condition | Rate |
|---|---|
| Net wealth up to 4 crore | 0 |
| Net wealth over 4 crore up to 10 crore, OR more than one car in own name, OR total house property over 8,000 sq ft | 10% |
| Over 10 crore up to 20 crore | 20% |
| Over 20 crore up to 50 crore | 30% |
| Over 50 crore | 35% |

(Environmental surcharge on extra cars — Tk 25,000 to 3,50,000 per car by engine size — is collected at vehicle registration. Out of scope; mention in the explainer only.)

## 9. Filing-time adjustment ✅ table / 🟡 base (PwC summary of FA 2026)

| Filed in | Effect |
|---|---|
| 1 Jul – 30 Sep | 5% off the tax, max Tk 25,000 (already passed for 2026-27 — show greyed out) |
| 1 Oct – 31 Dec | No change |
| 1 Jan – 31 Mar | +2% of tax, minimum Tk 3,000 |
| 1 Apr – 30 Jun | +5% of tax, minimum Tk 5,000 |

Base used in this prototype: tax after rebate + surcharge. Apply only when that base is above 0. Mark this rule "to confirm" in the UI footnote.

## 10. Order of calculation (Full calculator)

1. Salary exemption → taxable income
2. Slab tax
3. Rebate (with caps and the minimum-tax limit)
4. Max(slab tax − rebate, minimum tax)
5. + wealth surcharge (on slab tax)
6. ± filing-time adjustment
7. = Tax to pay

## Sources
- Finance Act 2026, Bangladesh Gazette Extraordinary, 30 June 2026 — Schedule 2 (pp. 20424–20430)
- Income Tax Act 2023 (English text, SRO 404) — s.78, Sixth Schedule Parts 1 and 3
- PwC Bangladesh, "Finance Act 2026: Key Amendments" (July 2026)
