# Design guide

The approved sketches are in `design-reference/screens/` (open them in a browser; they are static mock-ups, so read their markup for layout and spacing — do not copy their code structure). Inspiration images are in `design-reference/inspiration/`.

Approved: Website Quick saver = QuickA; Website Full calculator = DetailedC; App = the five App* screens.

## Feel
Clean, calm, lots of white space (like `clean-split-layout.png`). One big number per screen. Red is rare and meaningful.

## Font
Glacial Indifference only, weights 400 and 700 (`assets/fonts/`, SIL Open Font License). Load with `@font-face`. Fallback: sans-serif. Bangla text falls back to the system Bangla font.
Small uppercase labels: 13px, letter-spacing 2px. Body 15–17px. Big result number 72–76px (web), 44–46px (app).

## Colours
| Token | Hex | Use |
|---|---|---|
| red | #D71920 | Main button, the saving amount, step badges, ticks |
| red-ribbon | #ED1C24 / dark fold #A8161C | Ribbon panel only (white bold text ≥ 24px) |
| ink | #1A1A1A | Text, active mode switch |
| grey-text | #4A4A4A / #6B6B6B | Secondary text (both pass AA on white) |
| line | #E2E2E2 | Hairlines and card borders |
| panel | #F4F3F1 | Soft grey input panel / receipt notes |

## Components
- **Mode switch**: rounded track (16px radius, 1.5px ink border, 4px padding); two options with a tiny uppercase name (QUICK SAVER / FULL CALCULATOR) above the question. Active = ink background, white text; inactive = white, grey text. Present on both web screens.
- **Red ribbon panel** (see `red-ribbon-panel.png`): full-width red band with slightly slanted top/bottom edges and darker folds at top-right and bottom-left. Build with two stacked layers and `clip-path` (see QuickA.html). White bold uppercase centred text.
- **Numbered product cards** (see `numbered-product-steps.png`): line icon on top (dark stroke with one red accent), bold title, then a thin-bordered callout box with a small notch pointing up and a red numbered circle overlapping its left edge.
- **Inputs**: 44–50px tall, 1px #DADADA border, no heavy shadows.
- **Ticks**: 18px red circle with white check.
- Rounded corners: 12–16px for cards and switches in the app; web inputs may stay square to match the clean reference.

## Copy rules
- Lead with what the user SAVES, not what they must invest.
- "You pay Tk 45,000 / if you don't invest" and "You pay Tk 21,000 / if you invest Tk 2,40,000".
- Plain words; every tax term gets an ⓘ explainer.
- Always show "Prototype · sample figures · Finance Act 2026" somewhere small.
