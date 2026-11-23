# Tee Time Finder

Class project for IS 4496 (AI Product Management, University of Utah). Solo project, owner: Justin Curci.

## What it is
A golfer enters a location, how far they'll drive, a day and a time slot, and sees every open public tee time nearby. They can also pick specific courses. Booking hands off to the course's own system; we never take payment or charge a fee.

Beachhead: Salt Lake Valley, then statewide Utah, then national.
Primary users: the "Window Golfer" (fixed free window, flexible on course) and the "Group Organizer" (needs 2–4 spots together).

## How to run
No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Keep it that way unless a task truly needs a framework. Scripts are plain `<script>` tags with globals (not ES modules) so the page also works from `file://`.

## Files
- `index.html`: markup only.
- `src/styles.css`: all styles. Colors and fonts are CSS variables in `:root`, with a dark theme.
- `src/data.js`: `PLACES` (search origins) and `COURSES` (16 real Salt Lake–area courses with coordinates, sample base price, walking flag, optional verified booking `url`).
- `src/app.js`: sample tee-sheet generator, search, ranking, rendering, booking sheet.
- `docs/ttf_jira_import.csv`: the product backlog (6 epics, 32 issues) for Jira. Use it to see what's planned.

## Data rules (do not break these)
- **Tee times and prices are sample data.** `teeSheet()` generates them deterministically from course id + date, so the same search always shows the same times. The UI must keep saying this is sample data until real tee-sheet data is connected.
- **Never invent a booking URL.** Only Mountain View and South Mountain have verified Chronogolf links. Other courses fall back to a Google search for their booking page.
- **The AI must never generate a time, price or spot count.** Anything AI-written (parsed filters, the "best fit" reason line) may only use values that exist in a tee-time record or the user's filters.
- Course coordinates are approximate. Fix them if you can verify better ones, and say what changed.

## How ranking works
"Best fit" = 0.5 × distance (scaled to the radius, or to the farthest picked course) + 0.5 × price per 18-hole equivalent (scaled across results), with a small boost for courses with more open times. It's deterministic on purpose: the AI may explain the ranking, but it doesn't do the ranking.

## Next up (from the backlog)
1. **TTF-21: typed search.** A text box that turns "Saturday morning, under $45, walking, 3 of us" into the existing filters, then shows the parsed filters so the golfer can correct them. If a request is ambiguous, ask one question; don't guess.
2. **TTF-29/30: eval set.** 50 real phrasings with correct filters; ship bar is 90%+ fully correct.
3. **TTF-32: guardrail.** An automated check that every displayed time and price traces to a tee-sheet record.
4. **TTF-24: group message.** Draft a text with the top 2–3 options; the golfer edits and sends it.
5. A price cap filter and a walking-only filter in the sidebar.

## Working style
- Keep the UI simple: the core flow is location → distance → day → time slot → results.
- Test on a phone-width viewport (390px) as well as desktop.
- Plain, specific UI copy. No em-dashes in user-facing text.
