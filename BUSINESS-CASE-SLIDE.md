# Slide: Recommendation 1 — A tax and rebate calculator for IDLC's website and app

**Headline (slide title):** Turn tax season into IDLC's best lead source: a free calculator that shows customers their tax, and the IDLC product that cuts it.

## The opportunity (3 facts)
- About 13 million Bangladeshis hold a TIN, but only 4.96 million filed a return in FY2025-26: **38% filed, 62% did not**. [1]
- Income tax collection still rose 13% to Tk 1.46 lakh crore, so tax is a live, growing topic. [1]
- The law already rewards saving: the investment rebate is the lowest of **3% of taxable income, 10% of eligible investment, or Tk 7.5 lakh**. DPS, savings certificates and life insurance can qualify. [2]
- Many TIN holders think they need not file because they earn below the tax-free limit. [1] A calculator answers that question in seconds.

## The recommendation (what we built)
A free calculator for IDLC's website and phone app, in English and Bangla:
1. **Quick saver:** enter your salary, see your tax and how much an investment could save you.
2. **Full calculator:** five questions give your exact tax, with a step-by-step breakdown and a PDF.
3. **Product match:** the result points to the relevant IDLC product (names to be confirmed) and offers "Talk to an IDLC advisor", a callback request.
Live prototype: https://safin-111.github.io/idlc-tax-calculator/ (scan the QR code).

## Expected business impact
| Impact | How it comes about |
|---|---|
| **New leads** | Each callback request is a warm lead who has just seen a tax-saving gap. |
| **Deposit and investment inflow** | The gap between what a customer invested and what earns the full rebate is shown in taka, which pushes them toward a deposit or investment product. |
| **Brand and trust** | A free, plain-language tool in Bangla puts IDLC in front of first-time filers, the 62% who skip filing. |
| **Lower advisory workload** | Staff stop answering the same "how much tax do I owe?" questions by phone and branch visit. |
| **Low cost and fast to launch** | It is plain HTML, JavaScript and CSS with no server and no licence fee. The tax numbers sit in one file, so the yearly Finance Act update is a small edit. |

**Illustrative sizing (my assumptions, replace with IDLC's own figures):** 10,000 visits a month × 5% request a callback = 500 leads × 20% convert = 100 new customers × Tk 50,000 average deposit = **about Tk 50 lakh of new deposits a month**.

## Next steps
Confirm IDLC product names and rates, have the Compliance and Legal team approve the wording, add real contact-centre routing for callbacks, then pilot for the next filing season (the Jul–Sep window carries a 5% discount in the engine's rules).

## Sources
1. Daily Observer, "62pc of TIN holders skip tax return filing", 7 Aug 2026 (NBR data): https://observerbd.com/news/586786
2. PwC Worldwide Tax Summaries, Bangladesh, Individual deductions: https://taxsummaries.pwc.com/bangladesh/individual/deductions

*Notes for Safin: every number on this slide is from those two sources except the illustrative sizing, which is mine and must be labelled as an assumption when you present. The Jul–Sep discount comes from this project's own rules file (docs/TAX-RULES.md), not from the sources above; check it with Tax before you say it aloud.*
