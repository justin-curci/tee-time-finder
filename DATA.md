# Data in Tee Time Finder: what's real and what's sample

The app has no backend and makes no network calls except loading two Google Fonts. Every value it shows comes from the files below.

## Real (but hardcoded)

| What | Where | Notes |
|---|---|---|
| 10 starting locations (Downtown SLC, Sandy, Draper, Lehi, etc.) | `src/data.js` → `PLACES` | Coordinates are approximate city centers. |
| 16 golf course names and cities | `src/data.js` → `COURSES` | Real Salt Lake–area public courses. |
| Course coordinates | `COURSES[].lat`, `.lng` | Approximate, not verified against an official source. Distances are straight-line miles. |
| 9-hole-only courses (Forest Dale, Nibley Park) | `COURSES[].nineOnly` | Based on general knowledge; verify before launch. |
| Booking links for Mountain View and South Mountain | `COURSES[].url` | Their real Chronogolf club pages. |

## Sample (generated or estimated)

| What | Where | How it's made |
|---|---|---|
| Tee times | `src/app.js` → `teeSheet()` | Generated every 8–10 minutes from about 7:00 AM to 3:30 PM, using a fixed random seed per course and date, so the same search always shows the same times. |
| Open spots per time | `teeSheet()` | Random, with fewer spots on weekends and from 8:00 to 11:30 AM. |
| Prices | `COURSES[].base` and `teeSheet()` | `base` is a sample weekday 18-hole fee. The app adds 12% on weekends, charges 55% for 9 holes and takes 30% off after 2:00 PM (twilight). |
| Walking allowed | `COURSES[].walk` | Estimated; verify with each course. |
| Drive time | `src/app.js` → `search()` | Estimated as distance × 1.9 + 5 minutes, not from a maps service. |
| Booking links for the other 14 courses | `src/data.js` → `SEARCH()` | A Google search for "<course> <city> tee times". No booking URLs are made up. |

## Stored on the user's device

| What | Where |
|---|---|
| The last search (location, distance, time slot, players, holes, sort, picked courses) | Browser `localStorage`, key `ttf-search`. It never leaves the browser. |

## Replacing sample data later

The swap point is `teeSheet(course, date)` in `src/app.js`. A real backend should return the same shape: an array of `{ min, open, holes, price, twilight }`, where `min` is minutes after midnight. The rest of the app (search, ranking, cards, booking sheet) can stay as it is.
