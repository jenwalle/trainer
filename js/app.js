/* =========================================================================
   app.js  —  Wiring everything together (the "glue")
   =========================================================================

   This file connects the pieces:
     - draws the screens and lets you move between them
     - starts the workout engine and shows what it reports
     - plays the sound / vibration cues (only if you have them switched on)
     - keeps the screen awake, and saves a workout to history when you finish
   ========================================================================= */

/* ---------- Tiny shortcuts so we don't type document.getElementById a lot ---------- */
function $(id) { return document.getElementById(id); }
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

/* ---------- Turn seconds into mm:ss for the display ---------- */
function fmt(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}

/* ---------- Count the exercises in a day (for the history summary) ---------- */
function countExercises(day) {
  let n = 0;
  day.blocks.forEach(function (b) {
    if (b.type === "circuit") n += b.exercises.length;
    else if (b.type === "interval") n += b.sets.length;
    else n += 1;
  });
  return n;
}

/* =========================================================================
   SCREENS — show one section at a time
   ========================================================================= */
const screens = {
  home:     $("screen-home"),
  run:      $("screen-run"),
  history:  $("screen-history"),
  settings: $("screen-settings")
};

function goto(name) {
  Object.keys(screens).forEach(function (key) {
    screens[key].classList.toggle("is-active", key === name);
  });
  if (name === "home") renderDayList();
  if (name === "history") renderHistory();
  if (name === "settings") loadSettingsIntoUI();
}

// Any button with data-goto="X" navigates to screen X.
document.querySelectorAll("[data-goto]").forEach(function (btn) {
  btn.addEventListener("click", function () { goto(btn.getAttribute("data-goto")); });
});

/* =========================================================================
   CUES — the beep and the buzz
   ========================================================================= */

// The browser only allows sound after the user taps something, so we create
// the audio system lazily the first time it's needed.
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

// Play a short tone. freq = pitch, ms = length.
function tone(freq, ms, delay) {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime + (delay || 0);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  // A gentle fade in/out so it doesn't click.
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000 + 0.02);
}

function buzz(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// The engine calls this with a "kind" of cue. We turn sound/vibration on or
// off here based on the user's settings.
function playCue(kind) {
  const s = Storage.getSettings();

  if (s.sound) {
    ensureAudio();
    if (kind === "workEnd")      { tone(880, 180); }                 // one bright beep
    else if (kind === "restEnd") { tone(660, 140); tone(990, 160, 0.18); } // "get ready, go!"
    else if (kind === "finish")  { tone(523, 150); tone(659, 150, 0.16); tone(784, 260, 0.32); } // little fanfare
    else if (kind === "target")  { tone(392, 260); tone(294, 320, 0.22); } // low "past target" warning
    else                         { tone(880, 150); }                 // generic / test
  }

  if (s.vibrate) {
    if (kind === "restEnd")     buzz([120, 60, 120]);
    else if (kind === "finish") buzz([200, 80, 200, 80, 200]);
    else if (kind === "target") buzz([300, 100, 300]);
    else                        buzz(200);
  }
}

/* =========================================================================
   KEEP SCREEN AWAKE (Wake Lock) — supported on most modern phones
   ========================================================================= */
let wakeLock = null;
async function requestWakeLock() {
  if (!Storage.getSettings().keepAwake) return;
  try {
    if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) { /* not critical if it fails */ }
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
}
// Phones drop the wake lock when you switch away; re-grab it when you return.
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && screens.run.classList.contains("is-active")) {
    requestWakeLock();
  }
});

/* =========================================================================
   HOME — list the training days
   ========================================================================= */
function renderDayList() {
  const program = Storage.getProgram();
  const list = $("day-list");
  list.innerHTML = "";

  program.days.forEach(function (day, index) {
    const card = document.createElement("button");
    card.className = "day-card";
    // Summarize the day: the run/fitness piece + how much strength/core work.
    const runBlock = day.blocks.filter(function (b) { return b.section === "Run"; })[0];
    const runName = runBlock ? runBlock.name : "";
    const exCount = countExercises(day);
    card.innerHTML =
      '<div class="day-card-name">' + day.name + "</div>" +
      '<div class="day-card-meta">' + (runName ? (runName + " · ") : "") + exCount + " exercises</div>";
    card.addEventListener("click", function () { startWorkout(index); });
    list.appendChild(card);
  });
}

/* =========================================================================
   THE WORKOUT RUNNER
   ========================================================================= */
let engine = null;      // the current WorkoutEngine
let state = null;       // the latest snapshot from the engine
let activeDay = null;   // the day we're running

function startWorkout(dayIndex) {
  const program = Storage.getProgram();
  activeDay = program.days[dayIndex];

  ensureAudio();          // "wake up" audio now, while we have a user tap
  requestWakeLock();

  engine = WorkoutEngine(activeDay, {
    onUpdate: renderRun,
    onCue: playCue,
    getSettings: Storage.getSettings
  });

  $("run-day-name").textContent = activeDay.name;
  lastStepKey = null;
  goto("run");
  renderRun(engine.snapshot());   // draw the initial "Get ready" state
}

// We split rendering in two:
//   • things that change every tick (clock, countdown, phase) — updated always
//   • things fixed for the whole step (exercise name, weight box, notes) —
//     rebuilt ONLY when the step changes, so the weight input you're typing
//     into isn't wiped out 5 times a second.
let lastStepKey = null;

function stepKeyOf(snap) {
  return snap.phase + "#" + snap.stepNumber + (snap.awaiting ? "#a" : "");
}

function renderRun(snap) {
  state = snap;
  const stage = $("run-stage");
  const step = snap.step;

  // ---- per-tick updates ----
  $("run-total-clock").textContent = fmt(snap.totalElapsed);

  stage.classList.remove("is-work", "is-rest", "is-done", "is-reps");
  if (snap.phase === "work") stage.classList.add("is-work");
  else if (snap.phase === "rest") stage.classList.add("is-rest");
  else if (snap.phase === "done") stage.classList.add("is-done");
  // Reps layout: the exercise NAME is the hero, the rep count is smaller.
  if (snap.phase === "work" && step && !step.timed && !step.stopwatch) stage.classList.add("is-reps");

  const phaseEl = $("run-phase"), timerEl = $("run-timer");
  timerEl.classList.remove("over");
  if (snap.phase === "idle") { phaseEl.textContent = "Get ready"; timerEl.textContent = "Tap Start"; }
  else if (snap.phase === "done") { phaseEl.textContent = "Done 🎉"; timerEl.textContent = fmt(snap.totalElapsed); }
  else if (snap.phase === "rest") {
    phaseEl.textContent = snap.awaiting ? "Rest — take your time" : (snap.paused ? "Rest (paused)" : "Rest");
    timerEl.textContent = snap.awaiting ? "Ready?" : fmt(snap.remaining);
  } else if (step.stopwatch) {
    // Count UP from Go; turn red once past the target, but keep running.
    phaseEl.textContent = snap.paused ? "Paused" : (snap.swActive ? "Go!" : "Ready");
    timerEl.textContent = snap.swActive ? fmt(snap.swElapsed) : "00:00";
    if (snap.overTarget) timerEl.classList.add("over");
  } else {
    phaseEl.textContent = snap.paused ? "Work (paused)" : "Work";
    timerEl.textContent = step.timed ? fmt(snap.remaining) : (step.reps ? step.reps : "Go!");
  }

  $("run-upnext").textContent = (snap.phase === "work") ? snap.upNext : "";

  // ---- per-step content (only when the step actually changes) ----
  const key = stepKeyOf(snap);
  if (key !== lastStepKey) {
    lastStepKey = key;
    renderStepContent(snap);
    hideReminder();
  }

  updateControls(snap);
}

// Fixed-for-the-step content: exercise name, set line, weight box, notes.
function renderStepContent(snap) {
  const sectionEl = $("run-section"), exEl = $("run-exercise"), setEl = $("run-set");
  const targetEl = $("run-target"), notesEl = $("run-notes"), reminderBtn = $("btn-reminder");
  const demoEl = $("run-demo");
  const step = snap.step;

  hide(reminderBtn);
  hide(demoEl); demoEl.removeAttribute("src");
  targetEl.innerHTML = "";
  notesEl.textContent = "";

  if (snap.phase === "idle") {
    sectionEl.textContent = activeDay.blocks[0] ? activeDay.blocks[0].section : "";
    exEl.textContent = "Ready when you are"; setEl.textContent = "";
  } else if (snap.phase === "done") {
    sectionEl.textContent = ""; exEl.textContent = "Workout complete";
    setEl.textContent = ""; targetEl.textContent = "Total time";
  } else if (snap.phase === "rest") {
    sectionEl.textContent = snap.section || "";
    exEl.textContent = (step && step.name === "Switch") ? "Switch exercises" : "Recover";
    setEl.textContent = snap.upNext;
  } else { // work
    sectionEl.textContent = snap.section || "";
    exEl.textContent = step.name;
    setEl.textContent = step.roundInfo || "";
    notesEl.textContent = step.notes || "";
    show(reminderBtn);
    renderWeight(step, targetEl);
    if (step.image) {
      demoEl.src = step.image;
      demoEl.alt = step.name;
      show(demoEl);
    }
  }
}

/* ---------- Weight box ---------- */
// Any exercise that uses external load gets an editable, remembered weight
// box. Pure bodyweight moves just show a label (no box).
function usesLoad(w) {
  if (!w) return false;
  const s = w.toLowerCase().trim();
  return !(s === "bodyweight" || s === "bw" || s === "body only");
}
function baseExerciseName(name) { return name.replace(/ — (Right|Left)$/, ""); }

function renderWeight(step, targetEl) {
  if (usesLoad(step.weight)) {
    const nm = baseExerciseName(step.name);
    const saved = Storage.getWeight(nm);
    targetEl.innerHTML =
      '🏋️ <input class="weight-input" id="weight-input" type="text" inputmode="decimal" ' +
      'placeholder="add weight" value="' + saved.replace(/"/g, "&quot;") + '"> ' +
      '<span class="subtle weight-hint">' + escapeHtml(step.weight) + '</span>';
    const input = $("weight-input");
    input.addEventListener("input", function () { Storage.saveWeight(nm, input.value.trim()); });
  } else if (step.weight) {
    targetEl.textContent = step.weight;   // "bodyweight" etc.
  }
}

/* ---------- "Need a reminder" panel ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function hideReminder() {
  const p = $("reminder-panel");
  hide(p); p.innerHTML = "";
  $("btn-reminder").textContent = "ℹ️ Need a reminder";
}
function toggleReminder() {
  const p = $("reminder-panel");
  if (!p.classList.contains("hidden")) { hideReminder(); return; }
  if (!state || !state.step || state.phase !== "work") return;
  const step = state.step;
  const nm = baseExerciseName(step.name);
  let html = '<div class="reminder-title">' + escapeHtml(step.name) + "</div>";
  if (step.image) html += '<img class="reminder-img" src="' + escapeHtml(step.image) + '" alt="' + escapeHtml(step.name) + '">';
  const desc = runDescription(step.name);
  if (desc) html += '<div class="reminder-desc">' + escapeHtml(desc) + "</div>";
  if (step.howto) html += '<div class="reminder-howto">' + escapeHtml(step.howto) + "</div>";
  if (step.notes) html += '<div class="reminder-cues">💡 ' + escapeHtml(step.notes) + "</div>";
  const q = encodeURIComponent(nm + " exercise how to");
  html += '<a class="reminder-link" href="https://www.youtube.com/results?search_query=' + q +
          '" target="_blank" rel="noopener">▶ Watch a demo (opens web search)</a>';
  p.innerHTML = html;
  show(p);
  $("btn-reminder").textContent = "✕ Hide reminder";
}
$("btn-reminder").addEventListener("click", toggleReminder);

/* ---------- Step selector (jump to any part of the workout) ---------- */
function openJump() {
  if (!engine) return;
  const list = $("jump-list");
  list.innerHTML = "";
  const steps = engine.getSteps();
  const current = state ? state.stepNumber - 1 : -1;
  const seen = {};
  let lastSection = null;

  steps.forEach(function (s) {
    if (s.kind !== "work") return;                    // jump targets are exercises
    // One entry per exercise: collapse its rounds and Right/Left into the first.
    const base = s.name.replace(/ — (Right|Left)$/, "");
    const roundless = (s.roundInfo || "").replace(/·?\s*Round \d+ of \d+/, "").trim();
    const key = s.section + "|" + base + "|" + roundless;
    if (seen[key]) return;
    seen[key] = true;

    if (s.section !== lastSection) {
      lastSection = s.section;
      const h = document.createElement("div");
      h.className = "jump-section";
      h.textContent = s.section;
      list.appendChild(h);
    }
    const btn = document.createElement("button");
    btn.className = "jump-item" + (s.index === current ? " current" : "");
    btn.innerHTML = '<span class="jump-name">' + escapeHtml(base) + "</span>";
    btn.addEventListener("click", function () { engine.goTo(s.index); closeJump(); });
    list.appendChild(btn);
  });

  show($("jump-overlay"));
}
function closeJump() { hide($("jump-overlay")); }
$("btn-jump").addEventListener("click", openJump);
$("jump-close").addEventListener("click", closeJump);
$("jump-overlay").addEventListener("click", function (e) {
  if (e.target === $("jump-overlay")) closeJump();   // tap the dimmed backdrop to close
});

// Set the button labels/enabled-state based on the phase.
function updateControls(snap) {
  const main = $("btn-main");
  const pauseBtn = $("btn-pause");
  const addBtn = $("btn-add");
  const prev = $("btn-prev");
  const skip = $("btn-skip");

  main.disabled = false;
  prev.disabled = (snap.phase === "idle");
  skip.disabled = (snap.phase === "idle" || snap.phase === "done");

  // "Skip the rest of this section" only during an active workout.
  const active = snap.phase === "work" || snap.phase === "rest";
  if (active) show($("btn-skip-section")); else hide($("btn-skip-section"));

  // Pause available during a countdown OR a running stopwatch.
  const swActiveNow = snap.stopwatch && snap.swActive;
  const hasCountdown = (snap.running || snap.paused) && !snap.awaiting;
  if (hasCountdown || swActiveNow) {
    show(pauseBtn);
    pauseBtn.textContent = snap.paused ? "▶ Resume" : "⏸ Pause";
  } else {
    hide(pauseBtn);
  }
  // +30s applies only to real rest/work countdowns, not the stopwatch.
  if (hasCountdown && !snap.stopwatch) show(addBtn); else hide(addBtn);

  const isReps = snap.phase === "work" && snap.step && !snap.step.timed && !snap.step.stopwatch;

  if (snap.phase === "idle") {
    main.textContent = "▶ Start"; main.className = "ctrl-btn primary";
  } else if (snap.phase === "done") {
    main.textContent = "✓ Save & finish"; main.className = "ctrl-btn primary";
  } else if (snap.awaiting) {
    main.textContent = "▶ Start next"; main.className = "ctrl-btn primary";
  } else if (snap.stopwatch) {
    main.textContent = snap.swActive ? "Done ✓" : "▶ Go";
    main.className = "ctrl-btn primary";
  } else if (isReps) {
    main.textContent = "Done ✓"; main.className = "ctrl-btn primary";
  } else if (snap.phase === "work") {
    main.textContent = "Working…"; main.className = "ctrl-btn primary muted"; main.disabled = true;
  } else { // rest counting down
    main.textContent = "Resting…"; main.className = "ctrl-btn primary muted"; main.disabled = true;
  }
}

// ----- Runner button handlers -----
$("btn-main").addEventListener("click", function () {
  if (!state) return;
  if (state.phase === "idle")       engine.start();
  else if (state.phase === "done")  finishWorkout();
  else if (state.awaiting)          engine.advance();   // continue after a hold-rest
  else if (state.phase === "work" && state.step && !state.step.timed) engine.advance();
});
$("btn-pause").addEventListener("click", function () { if (engine) engine.togglePause(); });
$("btn-add").addEventListener("click",   function () { if (engine) engine.addTime(30); });
$("btn-skip").addEventListener("click",  function () { if (engine) engine.next(); });
$("btn-prev").addEventListener("click",  function () { if (engine) engine.prev(); });
$("btn-skip-section").addEventListener("click", function () { if (engine) engine.skipSection(); });

$("run-quit").addEventListener("click", function () {
  const done = state && state.phase === "done";
  if (done || confirm("Quit this workout? Your progress won't be saved.")) {
    quitWorkout();
  }
});

function quitWorkout() {
  if (engine) engine.stop();
  engine = null; state = null; lastStepKey = null;
  hideReminder(); closeJump();
  releaseWakeLock();
  goto("home");
}

// Save the finished workout to history, then go home.
function finishWorkout() {
  if (engine) engine.stop();
  releaseWakeLock();

  const entry = {
    date: new Date().toISOString(),
    dayName: activeDay.name,
    durationSec: state ? state.totalElapsed : 0,
    exerciseCount: countExercises(activeDay)
  };
  Storage.addHistoryEntry(entry);

  engine = null; state = null;
  goto("history");
}

/* =========================================================================
   HISTORY
   ========================================================================= */
function renderHistory() {
  const list = $("history-list");
  const history = Storage.getHistory();
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = '<p class="subtle">No workouts logged yet. Finish one and it\'ll show up here.</p>';
    return;
  }

  history.forEach(function (entry) {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const timeStr = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML =
      '<div class="history-top">' +
        '<span class="history-day">' + entry.dayName + "</span>" +
        '<span class="history-dur">' + fmt(entry.durationSec) + "</span>" +
      "</div>" +
      '<div class="subtle">' + dateStr + " · " + timeStr + " · " + (entry.exerciseCount || (entry.exercises ? entry.exercises.length : 0)) + " exercises</div>";
    list.appendChild(card);
  });
}

/* =========================================================================
   SETTINGS
   ========================================================================= */
function loadSettingsIntoUI() {
  const s = Storage.getSettings();
  $("set-sound").checked = s.sound;
  $("set-vibe").checked  = s.vibrate;
  $("set-wake").checked  = s.keepAwake;
}

function wireSettingToggle(id, field) {
  $(id).addEventListener("change", function () {
    const s = Storage.getSettings();
    s[field] = $(id).checked;
    Storage.saveSettings(s);
  });
}
wireSettingToggle("set-sound", "sound");
wireSettingToggle("set-vibe", "vibrate");
wireSettingToggle("set-wake", "keepAwake");

$("btn-test-cue").addEventListener("click", function () {
  ensureAudio();
  playCue("test");
});

/* =========================================================================
   PWA service worker — only registers when the app is served over http(s),
   not when opened as a local file. Makes the app installable & offline later.
   ========================================================================= */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

/* ---------- First paint ---------- */
goto("home");
