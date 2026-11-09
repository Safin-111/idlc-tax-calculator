# IDLC tax calculator prototype — project instructions

Read these before doing anything:
1. `docs/PLAN.md` — what to build, screen by screen
2. `docs/TAX-RULES.md` — every tax number and the order of calculation
3. `docs/TEST-CASES.md` — the answers the engine must reproduce
4. `docs/DESIGN.md` — fonts, colours, components; approved sketches in `design-reference/`

## About the owner
Safin is not a programmer. Explain what you did in plain language, one short paragraph, no jargon. Before any step that installs software or touches the internet (git, GitHub, npm), say what it does and ask first.

## Rules
- Plain HTML/CSS/JS. No frameworks, no build step. It must open by double-clicking `index.html`.
- Tax numbers only in `js/tax-rules.js`; maths only in `js/tax-engine.js` (pure functions). Never duplicate a number in screen code.
- After any change to the engine or rules, run the tests (`tests/run-tests.html`, or `node tests/run-tests.js` if Node exists) and report PASS/FAIL counts.
- Do not invent product names, rates or returns for IDLC products. Use the names in PLAN.md and mark them "to confirm".
- Do not change the design direction; if something in the sketches can't work, say so and propose the smallest change.
- Keep `design-reference/` and `docs/` read-only.
