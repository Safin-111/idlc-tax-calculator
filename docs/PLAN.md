# Build plan — IDLC income tax & rebate calculator (prototype)

## Purpose
A clickable prototype for Safin's MT presentation at IDLC Finance. It tells a salaried person how much tax they pay, how much they can save by investing, and points them to IDLC products (DPS, IDLC Asset Management funds, IDLC Securities). Prototype only: sample/indicative figures, nothing is sent anywhere.

## Technology (keep it simple)
- Plain HTML, CSS and JavaScript. No frameworks, no build step, no npm install needed to run it.
- It must work by double-clicking `index.html` (offline backup for the presentation) AND when hosted on GitHub Pages.
- Installable as a PWA: `manifest.webmanifest` + a small service worker (registered only when served over http/https).
- All tax numbers in `js/tax-rules.js`; all maths in `js/tax-engine.js` (pure functions, no DOM). Screens only call the engine.
- All on-screen text in `js/strings.js` with `en` and `bn` objects so the বাংলা toggle swaps every label. Draft the Bangla; mark it "needs review by Safin".
- Number format: Bangladeshi grouping (12,00,000), prefix "Tk".

## Folder layout to create
```
index.html            Start page (presentation launcher)
web/quick.html        Website — Quick saver
web/full.html         Website — Full calculator
app/index.html        App — shown inside a phone frame on a laptop, full screen on a phone
css/                  shared styles (tokens.css, web.css, app.css)
js/tax-rules.js, js/tax-engine.js, js/strings.js, js/format.js, js/ui-*.js
tests/test-cases.js, tests/run-tests.html (and run-tests.js if Node is available)
assets/               fonts and logos (already provided)
manifest.webmanifest, sw.js
```

## Screens

### 0. Start page (`index.html`) — the presentation launcher
- IDLC logo, title "Income tax & rebate calculator", line "Prototype · sample figures · Finance Act 2026".
- Two big buttons: **Website tour** → `web/quick.html`; **App tour** → `app/index.html`.
- A QR code area (placeholder box until the live link exists) labelled "Scan to try it on your phone".

### 1. Website — Quick saver (follow `design-reference/screens/QuickA.html`)
Split screen like `design-reference/inspiration/clean-split-layout.png`.
- Left (soft grey panel): logo, "TOOLS / TAX", H1 "Tax calculator", the rounded two-option mode switch (Quick saver active | Full calculator), then inputs: yearly salary, "You are" (5 categories), "This is my first tax return" checkbox, red "Calculate tax" button. Results also update live as the user types.
- Right: nav (Loans, Deposits, Investments, বাংলা, Call 16409). Bold label "TAX YOU CAN SAVE THIS YEAR", the saving in large RED, then two columns: "You pay / Tk 45,000 / if you don't invest" and "You pay / Tk 21,000 / if you invest Tk 2,40,000". Three red-check bullets (invest by 30 June 2027; investing more won't lower tax further; link to full calculation).
- Below: red ribbon panel "WHERE TO INVEST WITH IDLC" (see DESIGN.md), then three numbered product cards (DPS, IDLC Asset Management funds, Shares via IDLC Securities) with the suggested split, then "Talk to an IDLC advisor".
- Suggested split rule: DPS first up to Tk 1,20,000, the rest to IDLC AML funds; shares shown as optional with Tk 0.
- Edge cases: no tax → "You pay no tax at this salary"; already at minimum tax → "Investing won't lower your tax — you already pay only the minimum Tk 5,000" (or Tk 1,000).

### 2. Website — Full calculator (follow `design-reference/screens/DetailedC.html`)
"Five questions. Then your tax." For the 2026-27 return (income July 2025 – June 2026).
- Rows 01–05, each one line with its answer control on the right:
  01 Who are you? (category chips + parent-of-child-with-disability option under "More")
  02 Yearly salary (+ optional "Other income" link that reveals one field)
  03 What did you invest? (one total field; "edit list" opens the itemised list with caps shown)
  04 Wealth: "Net wealth over Tk 4 crore, 2+ cars, or a home over 8,000 sq ft?" No/Yes + "What's this?" explainer. Yes reveals net wealth, number of cars, home size.
  05 When will you file? (Jul–Sep greyed as passed, Oct–Dec, Jan–Mar +2%, Apr–Jun +5%)
- Red ribbon with "YOUR TAX TO PAY Tk 31,800".
- Two columns: "How we got there" lines and "Slab by slab" table; grey note "You could have saved Tk X more … Plan next year" linking to Quick saver.
- Buttons: Download PDF (print stylesheet → browser Save as PDF), Talk to an IDLC advisor.

### 3. App (follow the five `design-reference/screens/App*.html` files)
One page app with five views: Start → Quick answer → Invest the gap → Callback; Start → Full calculator (step-by-step, 5 steps, one per view) with the wealth-surcharge bottom sheet.
- On a laptop: centred phone frame 390×844 with a small side panel "Controls (not part of the app)": বাংলা toggle, Back to start page.
- On a phone (width < 500px): no frame, full screen.

### 4. Term explainers (both web and app)
An ⓘ next to: taxable income, tax-free part of salary, tax-free limit, slab, rebate, eligible investment, minimum tax, wealth surcharge, net wealth. Tap/click opens a small card (web: popover; app: bottom sheet) with three parts: what it means, applies to you if…, one tiny example. Text in `js/strings.js`.

### 5. Callback form
Name, mobile, best time (morning/afternoon/evening), "share my calculation" checkbox. On submit: thank-you message. Nothing is sent (say so in small text).

## Definition of done
- `tests/run-tests.html` shows every case in docs/TEST-CASES.md as PASS.
- All links in the journeys work: start → quick → full → callback and back; app flows likewise.
- Works offline from double-click, looks right at 1366×768 (presentation laptop) and 390px wide (phone).
- Text contrast passes WCAG AA; buttons ≥ 44px tall.
