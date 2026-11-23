# Tee Time Finder

Find every open public tee time near you in one search. Pick your location, how far you'll drive, a day and a time slot, and see every open time, grouped by course. You can also search for and pick specific courses.

Built for IS 4496 (AI Product Management, University of Utah) by Justin Curci.

## Status

Working MVP for the Salt Lake Valley.

- **Real:** the 16 golf courses and their cities, plus booking links for two of them.
- **Sample:** tee times, open spots and prices are generated in the browser. There is no backend yet.

See [`docs/DATA.md`](docs/DATA.md) for exactly which values are real and which are sample.

## Features

- Location, driving distance (5–50 miles), day, time slot, players (1–4), 9 or 18 holes
- Search and pick specific courses (this turns the distance limit off)
- Results grouped by course, with distance, drive time, price, walking policy and spots left
- Sort by best fit (distance and price), earliest, closest or lowest price
- Booking details with the group total, handed off to the course's own booking page
- One-tap fixes when nothing is open (search farther, widen the time slot, fewer players)
- Works on phone and desktop, in light and dark mode

## Run it locally

No install needed. Any of these works:

```
npm start          # opens index.html in your browser (macOS)
npm run serve      # serves at http://localhost:8000 (needs python3)
```

Or double-click `index.html`.

## Tech

Plain HTML, CSS and JavaScript with no frameworks, packages or build step.

| File | What's in it |
|---|---|
| `index.html` | Page layout |
| `src/styles.css` | Styles, with color and font variables and a dark theme |
| `src/data.js` | Locations and courses |
| `src/app.js` | Sample tee sheets, search, ranking, rendering, booking details |
| `docs/DATA.md` | What's real and what's sample |
| `docs/ttf_jira_import.csv` | Product backlog (6 epics, 32 issues) |
| `CLAUDE.md` | Context for Claude Code |

## Work on it with Claude Code

```
cd ~/Documents/tee-time-finder
claude
```
