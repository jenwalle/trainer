# Trainer — personal gym training app

A simple, offline-friendly workout app: pick a training day and it guides you
through every set, running your work timers and rest countdowns so you never
have to touch the paper (or fumble with a stopwatch) mid-workout.

## How to open it (on your PC)

Just **double-click `index.html`** — it opens in your default browser and runs.
No installation, no tools, no internet needed.

> Tip: if double-clicking opens a code editor instead of a browser, right-click
> `index.html` → **Open with** → your browser (Chrome/Edge).

## How to use it

1. **Home** — tap a training day.
2. Tap **Start**. The app walks you through each set:
   - **Work** turns the card green. Timed exercises count down automatically;
     rep exercises wait for you to tap **Done set**.
   - **Rest** turns the card amber and counts your rest down, then beeps/buzzes.
3. **Pause/Resume**, **Skip**, and **Prev** are always there if you need them.
4. Finish, and the workout is saved to **History**.
5. **Settings** (gear icon) — turn Sound and Vibration on/off independently,
   and toggle keeping the screen awake.

## The files (what each part does)

| File | Its job |
|------|---------|
| `index.html` | The page structure — the four screens (Home, Workout, History, Settings). |
| `css/styles.css` | The look — colors, layout, the big countdown, the on/off switches. |
| `js/data.js` | **The workout data.** Defines the shape of a training day + sample days. This is where your real program goes. |
| `js/storage.js` | Saves settings + history onto the phone (nothing leaves the device). |
| `js/engine.js` | The brains — turns a day into a list of steps and runs the timers/rest. |
| `js/app.js` | The glue — screens, buttons, sound/vibration, saving workouts. |
| `manifest.webmanifest`, `sw.js`, `icons/` | Make it installable + offline once it's hosted online. |

## Exercise photos

Demo photos live in `images/ex/` and are wired to exercises in `js/data.js`
(the `image:` field). They come from the **free-exercise-db** open exercise
library (free to use). Custom, coach-named drills (Super Shuttles, Dongers,
FRAWG, John Travoltas, snow angels, etc.) have no stock photo — those show the
written description + a "Watch a demo" web-search link instead. To add your own
photo for any exercise, drop an image in `images/ex/` and set its `image:` path
in `js/data.js`.

## Later: putting it on your phone

To use it on your phone (and "install" it to the home screen so it works
fully offline), we'll upload this folder to free hosting — that gives a web
link you open on your phone, then tap **Add to Home Screen**. We'll do that
step together when the app is ready.
