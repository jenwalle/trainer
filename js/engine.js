/* =========================================================================
   engine.js  —  The workout "engine" (v2: circuits, runs, sections)
   =========================================================================

   Your packet isn't a flat list of exercises — each day is built from
   SEGMENTS (Warm-up, Stretch, Run, Strength, Core, Cool-down), and inside
   those are different SHAPES of work:

     • single    – one exercise for a number of sets (rest between sets)
     • circuit   – a "group" of exercises done back-to-back, repeated for
                   several rounds (this is the "group 1 / group 2" superset idea)
     • interval  – a run: several sets, each set = N reps of a sprint with a
                   short rest between reps, and a longer rest between sets
     • timed     – a single timed effort (e.g. Cooper run = 12 min)

   Just like before, the engine flattens ALL of that into one flat list of
   STEPS the moment a workout starts, then walks the list. Each step is
   either "work" (do something) or "rest" (count down).

   SMART REST: some rests should flow straight into the next effort (the
   short rests inside a run or a fast circuit). Others are real recovery and
   should NOT shove you into the next round before you're ready — those are
   marked hold:true, so when they hit zero the app beeps and waits for you
   to tap "Start next". This is the safety behavior we agreed on.
   ========================================================================= */

/* ---- Rest defaults for circuits when the sheet leaves rest blank ---- */
const REST_DEFAULTS = {
  betweenExercises: 15,   // switching stations inside a group
  afterRound: 60,         // after finishing a full round of a group
  betweenGroups: 100      // moving from one group to the next
};

function buildSteps(day) {
  const steps = [];

  // Helper to push a work step.
  function work(opts) {
    steps.push(Object.assign({ kind: "work" }, opts));
  }
  // Helper to push a rest step (skips zero-length rests).
  function rest(seconds, opts) {
    if (!seconds || seconds <= 0) return;
    steps.push(Object.assign({ kind: "rest", seconds: seconds }, opts || {}));
  }

  // Emit the work step(s) for one exercise. If it's a TIMED "each side"
  // exercise, split it into a Right timer then a Left timer.
  function emitExerciseWork(ex, section, blockName, roundInfo, roundNum, roundTotal) {
    const timed = ex.mode === "time";
    const base = {
      section: section, blockName: blockName || "", mode: ex.mode,
      reps: ex.reps || "", weight: ex.weight || "", notes: ex.notes || "",
      howto: ex.howto || "", image: ex.image || "", roundInfo: roundInfo,
      fixedWeight: !!ex.fixedWeight,
      timed: timed, seconds: timed ? ex.work : 0
    };
    if (ex.sideByRound && roundNum) {
      // One side PER ROUND: first half of rounds = Right, second half = Left
      // (e.g. 4 rounds -> R,R,L,L; 2 rounds -> R,L).
      const side = roundNum <= Math.ceil(roundTotal / 2) ? "Right" : "Left";
      work(Object.assign({}, base, { name: ex.name + " — " + side }));
    } else if (ex.perSide) {
      // BOTH sides within the round: Right, then Left (no "2R 2L" jargon).
      work(Object.assign({}, base, { name: ex.name + " — Right" }));
      work(Object.assign({}, base, { name: ex.name + " — Left" }));
    } else {
      work(Object.assign({}, base, { name: ex.name }));
    }
  }

  day.blocks.forEach(function (block) {
    const section = block.section || "";

    if (block.type === "timed") {
      // One timed effort (warm-up, cooper run, ball work…).
      work({
        section: section, name: block.name, mode: "time",
        timed: true, seconds: block.work,
        weight: block.weight || "", notes: block.notes || "",
        howto: block.howto || "", image: block.image || "", roundInfo: block.roundInfo || ""
      });
      rest(block.restAfter, { section: section, name: "Rest", hold: true, upcoming: "" });

    } else if (block.type === "single") {
      const sets = block.sets || 1;
      for (let s = 1; s <= sets; s++) {
        work({
          section: section, name: block.name,
          mode: block.mode,
          timed: block.mode === "time",
          seconds: block.mode === "time" ? block.work : 0,
          reps: block.reps || "", weight: block.weight || "",
          notes: block.notes || "", howto: block.howto || "", image: block.image || "",
          roundInfo: sets > 1 ? ("Set " + s + " of " + sets) : ""
        });
        if (s < sets) rest(block.rest, { section: section, name: "Rest", hold: block.rest >= 60 });
      }
      rest(block.restAfter, { section: section, name: "Rest", hold: true });

    } else if (block.type === "circuit") {
      const rounds = block.rounds || 1;
      const exs = block.exercises;
      const rBetween = block.restBetweenExercises != null ? block.restBetweenExercises : REST_DEFAULTS.betweenExercises;
      const rRound = block.restAfterRound != null ? block.restAfterRound : REST_DEFAULTS.afterRound;
      for (let r = 1; r <= rounds; r++) {
        exs.forEach(function (ex, i) {
          const roundInfo = (block.name ? block.name + " · " : "") + "Round " + r + " of " + rounds;
          emitExerciseWork(ex, section, block.name, roundInfo, r, rounds);
          if (i < exs.length - 1) rest(rBetween, { section: section, name: "Switch", hold: false });
        });
        if (r < rounds) rest(rRound, { section: section, name: "Rest", hold: true });
      }
      // Rest before the next block/group (default betweenGroups).
      const after = block.restAfter != null ? block.restAfter : REST_DEFAULTS.betweenGroups;
      rest(after, { section: section, name: "Rest", hold: true });

    } else if (block.type === "interval") {
      // A run. Each "set" repeats a sprint some number of reps.
      block.sets.forEach(function (set, si) {
        const reps = set.reps || 1;
        for (let rep = 1; rep <= reps; rep++) {
          work({
            section: section, name: set.label,
            mode: set.stopwatch ? "stopwatch" : "reps",
            timed: false, stopwatch: !!set.stopwatch, targetSec: set.targetSec || null,
            autoStart: !!set.autoStart, restRatio: set.restRatio || null,
            seconds: 0,
            reps: reps > 1 ? ("Rep " + rep + " of " + reps) : "",
            weight: "", notes: set.notes || (block.notes || ""),
            roundInfo: "Set " + (si + 1) + " of " + block.sets.length + (set.target ? (" · target " + set.target) : "")
          });
          if (rep < reps) {
            // A dynamic rest (restRatio) gets its length from your sprint time
            // at runtime; give it a placeholder so it isn't skipped as zero.
            const irr = set.restRatio ? (set.interRepRest || 5) : set.interRepRest;
            rest(irr, { section: section, name: "Rest", hold: false, dynamic: !!set.restRatio });
          }
        }
        if (si < block.sets.length - 1) {
          const between = set.restAfter != null ? set.restAfter : block.restBetweenSets;
          // Auto-advance between sets so the next sprint's timer starts on its own.
          rest(between, { section: section, name: "Rest", hold: false });
        }
      });
      rest(block.restAfter, { section: section, name: "Rest", hold: true });
    }
  });

  return steps;
}

function WorkoutEngine(day, hooks) {
  const onUpdate = hooks.onUpdate || function () {};
  const onCue    = hooks.onCue    || function () {};

  const steps = buildSteps(day);

  let stepIndex = -1;
  let remaining = 0;
  let running = false;      // a countdown is actively ticking
  let paused = false;
  let awaiting = false;     // a hold-rest finished; waiting for user to continue
  let finished = false;
  let startedAt = null;
  let endsAt = null;
  let ticker = null;

  // Stopwatch state (count-UP timing, e.g. the 300 Super Shuttle vs a target).
  let swActive = false;     // the stopwatch is counting up
  let swElapsed = 0;        // seconds counted so far
  let swStartAt = null;     // timestamp the count began (adjusted on resume)
  let swTargetHit = false;  // have we crossed the target time yet

  function currentStep() {
    return stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
  }

  function enterStep(index) {
    stepIndex = index;
    paused = false;
    awaiting = false;
    swActive = false; swElapsed = 0; swTargetHit = false;

    if (index >= steps.length) {
      finished = true; running = false; stopTicker();
      onCue("finish"); emit(); return;
    }

    const step = steps[index];
    if (step.kind === "rest") {
      remaining = step.seconds; beginCountdown();
    } else if (step.stopwatch) {
      if (step.autoStart) {                            // sprints: start timing immediately
        swActive = true; swElapsed = 0; swTargetHit = false;
        swStartAt = Date.now(); startTicker();
      } else {
        running = false; remaining = 0; stopTicker();   // wait for "Go" (e.g. Super Shuttle)
      }
    } else if (step.timed) {
      remaining = step.seconds; beginCountdown();
    } else {
      running = false; remaining = 0; stopTicker();   // reps: wait for the user
    }
    emit();
  }

  function beginCountdown() {
    running = true;
    endsAt = Date.now() + remaining * 1000;
    startTicker();
  }
  function startTicker() { stopTicker(); ticker = setInterval(tick, 200); }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

  function tick() {
    if (paused) return;

    // Stopwatch: count UP, flag when the target is passed, never auto-stop.
    if (swActive) {
      swElapsed = (Date.now() - swStartAt) / 1000;
      const s = currentStep();
      if (s && s.targetSec && !swTargetHit && swElapsed >= s.targetSec) {
        swTargetHit = true;
        onCue("target");
      }
      emit();
      return;
    }

    if (!running) return;
    const msLeft = endsAt - Date.now();
    remaining = Math.max(0, Math.ceil(msLeft / 1000));
    if (msLeft <= 0) {
      running = false; stopTicker();
      const step = currentStep();
      if (step.kind === "rest") {
        onCue("restEnd");
        if (step.hold) { awaiting = true; emit(); return; }   // wait for tap
      } else {
        onCue("workEnd");
      }
      enterStep(stepIndex + 1);
      return;
    }
    emit();
  }

  function emit() { onUpdate(snapshot()); }

  function snapshot() {
    const step = currentStep();
    let upNext = "";
    const next = steps[stepIndex + 1];
    if (!finished && next) {
      upNext = next.kind === "rest" ? "then rest" : ("Next: " + next.name);
    } else if (!finished && step) {
      upNext = "Last one — finish strong!";
    }
    const isSw = step && step.stopwatch;
    return {
      phase: finished ? "done" : (step ? step.kind : "idle"),
      finished: finished, paused: paused, running: running, awaiting: awaiting,
      remaining: remaining,
      step: step,
      section: step ? step.section : "",
      upNext: upNext,
      stepNumber: stepIndex + 1,
      stepTotal: steps.length,
      // stopwatch view
      stopwatch: !!isSw,
      swActive: swActive,
      swElapsed: swElapsed,
      target: isSw ? step.targetSec : null,
      overTarget: isSw && step.targetSec ? swElapsed >= step.targetSec : false,
      totalElapsed: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
    };
  }

  // ---------- Public actions ----------
  function start() { if (stepIndex !== -1) return; startedAt = Date.now(); enterStep(0); }

  function togglePause() {
    const step = currentStep();
    // Pause / resume a running stopwatch (so you can read where you landed).
    if (step && step.stopwatch && swActive) {
      if (paused) { paused = false; swStartAt = Date.now() - swElapsed * 1000; startTicker(); }
      else { paused = true; stopTicker(); }
      emit(); return;
    }
    if (!running && !paused) return;
    if (paused) { paused = false; endsAt = Date.now() + remaining * 1000; startTicker(); }
    else { paused = true; stopTicker(); }
    emit();
  }

  // Main action: start/stop a stopwatch, finish a reps set, or continue after a hold-rest.
  function advance() {
    const step = currentStep();
    if (awaiting) { enterStep(stepIndex + 1); return; }
    if (step && step.stopwatch) {
      if (!swActive) {                       // "Go" — start counting up
        swActive = true; swElapsed = 0; swTargetHit = false; paused = false;
        swStartAt = Date.now(); startTicker(); emit();
      } else {                               // "Done" — stop and move on
        swActive = false; stopTicker(); onCue("workEnd");
        // Performance-based recovery: set the next rest from how long that took.
        if (step.restRatio) {
          const nxt = steps[stepIndex + 1];
          if (nxt && nxt.kind === "rest" && nxt.dynamic) {
            nxt.seconds = Math.max(3, Math.round(swElapsed * step.restRatio));
          }
        }
        enterStep(stepIndex + 1);
      }
      return;
    }
    if (step && step.kind === "work" && !step.timed) { onCue("workEnd"); enterStep(stepIndex + 1); }
  }

  function addTime(sec) {
    if (!running && !paused) return;
    remaining += sec;
    if (!paused) endsAt = Date.now() + remaining * 1000;
    emit();
  }

  function next() { if (finished) return; stopTicker(); running = false; swActive = false; enterStep(stepIndex + 1); }
  function prev() {
    if (stepIndex <= 0) { enterStep(0); return; }
    stopTicker(); running = false; swActive = false; finished = false; enterStep(stepIndex - 1);
  }
  function goTo(i) {
    if (i < 0 || i >= steps.length) return;
    stopTicker(); running = false; swActive = false; finished = false;
    if (startedAt === null) startedAt = Date.now();
    enterStep(i);
  }
  // Jump past the rest of the current section to the next one.
  function skipSection() {
    if (finished) return;
    const curSection = stepIndex >= 0 && steps[stepIndex]
      ? steps[stepIndex].section
      : (steps[0] ? steps[0].section : "");
    let i = stepIndex < 0 ? 0 : stepIndex + 1;
    while (i < steps.length && steps[i].section === curSection) i++;
    stopTicker(); running = false; swActive = false; finished = false;
    if (startedAt === null) startedAt = Date.now();
    enterStep(i);   // i may equal steps.length -> finishes the workout
  }
  function getSteps() {
    return steps.map(function (s, i) {
      return { index: i, kind: s.kind, name: s.name, section: s.section, roundInfo: s.roundInfo || "", stopwatch: !!s.stopwatch };
    });
  }
  function stop() { stopTicker(); running = false; swActive = false; }

  return {
    start: start, togglePause: togglePause, advance: advance, addTime: addTime,
    next: next, prev: prev, goTo: goTo, skipSection: skipSection, getSteps: getSteps, stop: stop, snapshot: snapshot,
    hasSteps: function () { return steps.length > 0; }
  };
}
