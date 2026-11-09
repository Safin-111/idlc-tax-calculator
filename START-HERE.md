# START HERE — how to build the prototype with Claude Code

You'll paste five short messages, one per stage. Before each, pick the model shown. Each stage takes roughly 5–20 minutes; you can watch or step away.

## One-time setup (2 minutes)
1. Open the Claude desktop app and click the **Code** tab.
2. Under the message box, click the first control (the environment) and choose **Local**.
3. Click the folder control next to it → **Open folder…** → choose `Desktop\idlc-tax-calculator`.
4. If it asks whether you trust the folder, say yes.
5. The **model picker** is toward the right end of the same row. That's where you switch models.

When Claude Code asks permission to create or edit files, allow it. If it asks to install something, read what it says; for stages 1–4 nothing needs installing.

---

## Stage 1 — Tax engine and tests · model: **Opus**
Why Opus: the maths must be exactly right.

> Read CLAUDE.md and everything in docs/. Build only the tax engine: js/tax-rules.js, js/tax-engine.js, js/format.js, tests/test-cases.js and tests/run-tests.html (plus tests/run-tests.js if Node is available). Every case in docs/TEST-CASES.md must pass. Don't build any screens yet. When done, tell me in plain words what you built and the PASS/FAIL count.

Check: double-click `tests\run-tests.html` in your folder — every row should say PASS.

## Stage 2 — Website screens · model: **Sonnet**
Why Sonnet: fast and good at building pages from a design.

> Read CLAUDE.md, docs/PLAN.md and docs/DESIGN.md, and look at design-reference/screens/QuickA.html and DetailedC.html. Build index.html (start page), web/quick.html and web/full.html, using js/tax-engine.js for every number. Include the mode switch, the red ribbon, the numbered IDLC product cards, the ⓘ explainers, the callback form and Download PDF. Then list what I should click to test it.

Check: double-click `index.html` → Website tour. Try salary 12,00,000: you should see "Tk 24,000" in red.

## Stage 3 — App screens · model: **Sonnet**

> Now build app/index.html following the five App*.html sketches in design-reference/screens, in a phone frame on a laptop and full screen on a phone. Add the বাংলা toggle for the whole site using js/strings.js (draft the Bangla and mark it for my review), plus manifest.webmanifest and sw.js so it can be installed as an app. Reuse the engine and explainers.

## Stage 4 — Review · model: **Opus**
Why Opus: a careful second pair of eyes.

> Review the whole project against docs/PLAN.md, docs/DESIGN.md and docs/TEST-CASES.md. Run the tests, click through every journey, check the numbers on screen match the engine, check text contrast and button sizes, and fix what's wrong. Give me a short list of what you changed and anything I must decide.

## Small tweaks later · model: **Haiku**
For wording, colours or spacing, e.g.:
> Change the button text "Calculate tax" to "Show my saving".

## Stage 5 — Put it online (later, once you're happy) · model: **Sonnet**
This needs a free GitHub account and Git for Windows; Claude Code will walk you through it.

> I want to publish this folder as a website on GitHub Pages so I can share a link. I'm not a programmer: explain each step, ask before installing anything, and at the end give me the live link and a QR code image for my slide.

---

## Presenting
1. Slide: a "Live demo" slide with the GitHub Pages link as a button + the QR code.
2. Click it → start page → **Website tour** (Quick saver, then Full calculator) → back → **App tour**.
3. Invite people to scan the QR and try it on their phones.
4. Backup: double-click `index.html` from this folder if Wi-Fi fails; keep a 1-minute screen recording too.
