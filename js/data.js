/* =========================================================================
   data.js  —  The 2023 Summer Workout Packet, as data
   =========================================================================

   A DAY is made of BLOCKS (segments). Block types the engine understands:

     { type:"timed",   section, name, work(sec), notes, restAfter }
     { type:"single",  section, name, sets, mode:"reps"|"time", reps|work,
                        rest(between sets), weight, notes, restAfter }
     { type:"circuit", section, name, rounds,
                        restBetweenExercises, restAfterRound, restAfter,
                        exercises:[ {name, mode, reps|work, weight, notes} ] }
     { type:"interval",section, name, restBetweenSets, notes,
                        sets:[ {label, reps, interRepRest, restAfter, target, notes} ] }

   Sections: Warm-up · Stretch · Run · Strength · Core · Cool-down

   Circuit rests use safe defaults (see engine.js) unless a number is given
   here. Everything is easy to tweak — that's the point of keeping it as data.
   ========================================================================= */

/* ---------------- Reusable pieces (used on many days) ---------------- */

// Dynamic warm-up (Hip ROM) — every day, at the start.
function warmup() {
  return {
    type: "circuit", section: "Warm-up", name: "Dynamic Hip ROM", rounds: 2,
    restBetweenExercises: 10, restAfterRound: 20, restAfter: 30,
    exercises: [
      { name: "Side to side squat", mode: "reps", reps: "20", weight: "bodyweight",
        notes: "Slow & controlled. Lean from hips (not spine), rear back then down. Hips low & level, feet under wrists, toes slightly out." },
      { name: "Lunge matrix", mode: "reps", reps: "9 each side", weight: "bodyweight",
        notes: "Hands on hips, torso vertical. Step/lunge straight (0°), diagonal (45°), then lateral (180°)." },
      { name: "Rotational T", mode: "reps", reps: "5 each side", weight: "bodyweight",
        notes: "Rotate hip into a forward T, to a lateral T, finish upright, then rotate back the way you came." }
    ]
  };
}

// Static stretch (hold ~5 breaths). Used at start (Stretch) and end (Cool-down).
function stretch(section) {
  return {
    type: "circuit", section: section, name: "Static Stretch", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: section === "Stretch" ? 20 : 0,
    exercises: [
      { name: "Band seated calf stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths." },
      { name: "Band supine hamstring stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths." },
      { name: "Band supine groin stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths." },
      { name: "Band supine glute stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths." },
      { name: "Supine torso crossover", mode: "time", work: 30, weight: "bodyweight", notes: "Hold ~5 slow breaths." },
      { name: "Supine superman stretch", mode: "time", work: 30, weight: "bodyweight", notes: "Hold ~5 slow breaths." }
    ]
  };
}

// Hip-ROM strength (Forward/Lateral/Rotational Ts) — functional-power days.
function hipRomTs(weight) {
  return {
    type: "circuit", section: "Strength", name: "Hip ROM Strength (Ts)", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 60,
    exercises: [
      { name: "Forward Ts", mode: "reps", reps: "8 (1R 1L)", weight: weight, notes: "Do one leg at a time; core tight, posture tall." },
      { name: "Lateral Ts", mode: "reps", reps: "8 (1R 1L)", weight: weight, notes: "Do one leg at a time." },
      { name: "Rotational Ts", mode: "reps", reps: "5 (1R 1L)", weight: weight, notes: "Do one leg at a time." }
    ]
  };
}

/* ---------------- Reusable STRENGTH blocks ---------------- */

// Workout #1 — Functional Strength: Structure / Function / Realization
function strengthW1() {
  return [
    { type: "circuit", section: "Strength", name: "Structure (Group 1)", rounds: 4,
      exercises: [
        { name: "Squat w/ dumbbell to ground", image: "images/ex/goblet-squat.jpg", mode: "time", work: 60, weight: "choose weight", notes: "Slow and controlled." },
        { name: "Tricep dips on bench", image: "images/ex/bench-dips.jpg", mode: "time", work: 60, weight: "choose weight", notes: "Bend knees to make easier; straight legs to make harder." }
      ] },
    { type: "circuit", section: "Strength", name: "Function (Group 2)", rounds: 4,
      exercises: [
        { name: "Skaters", mode: "time", work: 60, weight: "bodyweight", notes: "Perfect landing each rep." },
        { name: "Snow angel on single leg", mode: "time", work: 60, weight: "choose weight", notes: "Slow & controlled, keep back flat. Split time each leg." }
      ] },
    { type: "circuit", section: "Strength", name: "Realization (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "Rotational T w/ db at sternum", mode: "reps", reps: "5 (2R 2L)", weight: "choose weight", notes: "Hold dumbbell at sternum." },
        { name: "Lateral squat jumps", mode: "time", work: 60, weight: "bodyweight", notes: "Jump out to the side then back; don't let knees dive in." }
      ] }
  ];
}

// Workout #3 — Functional Strength: Base / Build / Explode
function strengthW3() {
  return [
    { type: "circuit", section: "Strength", name: "Base (Group 1)", rounds: 4,
      exercises: [
        { name: "Sumo squat w/ extension", image: "images/ex/plie-squat.jpg", mode: "reps", reps: "10 (5R 5L)", weight: "2 dumbbells", notes: "Slow & controlled. Abduct leg from heel at top, press directly over spine." },
        { name: "Break dancin' pushups", mode: "reps", reps: "10", weight: "2 dumbbells", notes: "Hips up even with spine, elbows in, exhale up, look at up hand, bring opposite leg through." }
      ] },
    { type: "circuit", section: "Strength", name: "Build (Group 2)", rounds: 4,
      exercises: [
        { name: "Walking lunge", image: "images/ex/walking-lunge.jpg", mode: "reps", reps: "20 (10R 10L)", weight: "1 dumbbell", notes: "2 sets twist toward lead leg, 2 sets twist away. Hold db at sternum, press through lead heel, twist 45°." },
        { name: 'SL "L"-shaped shoulder flys', mode: "reps", reps: "10 (2R 2L)", weight: "2 dumbbells", notes: "Knee even with/above hip. One arm out front, other out to side; switch arms each rep." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "SL RDL curl to press (opposite side)", mode: "reps", reps: "5 (2R 2L)", weight: "1 dumbbell", notes: "Initiate with trail leg, rotate at hip. Palm forward at start, faces you mid, away at top." },
        { name: "Squat jump", image: "images/ex/jump-squat.jpg", mode: "reps", reps: "20", weight: "bodyweight", notes: "Arms up when down, at sides in the air. Jump high, land soft." }
      ] }
  ];
}

// Workout #5 — Functional Strength: Base / Build / Explode
function strengthW5() {
  return [
    { type: "circuit", section: "Strength", name: "Base (Group 1)", rounds: 4,
      exercises: [
        { name: "Side to side squat w/ db at sternum", mode: "reps", reps: "20 (10R 10L)", weight: "1 dumbbell", notes: "Hold weight at sternum, hips low & level." },
        { name: "Uneven bench press", mode: "reps", reps: "20 (10 each side)", weight: "2 dumbbells", notes: "R hand up / R leg out; L hand up / L leg out. Switch weights halfway." }
      ] },
    { type: "circuit", section: "Strength", name: "Build (Group 2)", rounds: 4,
      exercises: [
        { name: "Running lunges", image: "images/ex/walking-lunge.jpg", mode: "time", work: 30, perSide: true, weight: "2 dumbbells", notes: "Forward lunge into reverse lunge; keep the planted leg still." },
        { name: "Bicep curl to press on single leg", mode: "time", work: 30, perSide: true, weight: "2 dumbbells", notes: "Chest up, curl into a shoulder press." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "John Travoltas – lateral", mode: "time", work: 30, perSide: true, weight: "1 dumbbell", notes: "Opposite elbow to knee; kick leg & arm out to side; turn hand up at finish." },
        { name: "Lunge jump", mode: "time", work: 60, weight: "bodyweight", notes: "Switch legs in the air; jump high, land soft." }
      ] }
  ];
}

// Workout #10 & #15 — Functional Strength: Base / Build / Explode
function strengthW10() {
  return [
    { type: "circuit", section: "Strength", name: "Base (Group 1)", rounds: 4,
      exercises: [
        { name: "Side to side squat", mode: "time", work: 60, weight: "your choice", notes: "Hold db at sternum, lean from hips, hips low & level." },
        { name: "Chin up w/ alternating knee up", image: "images/ex/chin-up.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "If too hard, do supine pulls. Squeeze shoulder blades, neck neutral." }
      ] },
    { type: "circuit", section: "Strength", name: "Build (Group 2)", rounds: 4,
      exercises: [
        { name: "Biomechanically-correct lunge w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "time", work: 60, weight: "your choice", notes: "Split time each leg. Hold db opposite the down leg, touch db to ground beside foot, press through lead heel." },
        { name: "Shoulder press on single leg", image: "images/ex/shoulder-press-1arm.jpg", mode: "time", work: 60, weight: "your choice", notes: "Split time each leg. Knee even/above hip, chest up, press over spine." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "Rotational Ts", mode: "reps", reps: "5 (2R 2L)", weight: "bodyweight", notes: "Hold db same hand as down leg, rotate at hip, initiate with up leg." },
        { name: "Lunge jump", mode: "time", work: 60, weight: "bodyweight", notes: "Switch legs in the air; jump high, land soft." }
      ] }
  ];
}

// Workout #6 & #11 — Functional Power (2 rounds + hip ROM + ab/core)
function powerBig() {
  return [
    { type: "circuit", section: "Strength", name: "Round 1 · Group 1", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 0,
      exercises: [
        { name: "Squat w/ db between legs", image: "images/ex/dumbbell-squat.jpg", mode: "reps", reps: "12", weight: "choose weight", notes: "Use your core to stabilize; proper posture every rep." },
        { name: "Jump squats", image: "images/ex/jump-squat.jpg", mode: "reps", reps: "20", weight: "bodyweight" },
        { name: "Lunge w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "reps", reps: "8R 8L", weight: "choose weight" },
        { name: "Hamstring curls on ball", image: "images/ex/ball-leg-curl.jpg", mode: "reps", reps: "20", weight: "bodyweight" }
      ] },
    { type: "circuit", section: "Strength", name: "Round 1 · Group 2", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 120,
      exercises: [
        { name: "Pushups", image: "images/ex/pushups.jpg", mode: "reps", reps: "15", weight: "bodyweight", notes: "No rest between groups 1 & 2." },
        { name: "Shoulder press", image: "images/ex/shoulder-press.jpg", mode: "reps", reps: "12", weight: "choose weight", notes: "Half on left leg, half on right." },
        { name: "Snow angels", mode: "reps", reps: "12", weight: "choose weight", notes: "Half on left leg, half on right." },
        { name: "Tricep dips on bench", image: "images/ex/bench-dips.jpg", mode: "reps", reps: "20", weight: "bodyweight" }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2 · Group 3", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 0,
      exercises: [
        { name: "Side to side squats", mode: "reps", reps: "20", weight: "choose weight" },
        { name: "Lunge jumps", mode: "reps", reps: "20", weight: "bodyweight" },
        { name: "Ham curls on ball – single leg", image: "images/ex/ball-leg-curl.jpg", mode: "reps", reps: "24 (12R 12L)", weight: "bodyweight" },
        { name: "Fwd Ts w/ db in opposite hand as down leg", mode: "reps", reps: "12", weight: "choose weight", notes: "Keep to a weight you can control." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2 · Group 4", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 90,
      exercises: [
        { name: "Stayin' alive pushups", mode: "reps", reps: "16 (8R 8L)", weight: "choose weight", notes: "No rest between groups 3 & 4." },
        { name: "Alt. snow angels", mode: "reps", reps: "12 (6R 6L)", weight: "choose weight", notes: "Alternate each arm." },
        { name: "Arnold press", image: "images/ex/arnold-press.jpg", mode: "reps", reps: "12", weight: "choose weight", notes: "Half on left leg, half on right." },
        { name: "Pullups (underhand) with knee up", image: "images/ex/pullups.jpg", mode: "reps", reps: "6", weight: "bodyweight" }
      ] },
    hipRomTs("8 lb db at chest"),
    { type: "circuit", section: "Core", name: "Ab/Core", rounds: 2,
      restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
      exercises: [
        { name: "Single arm plank, right", image: "images/ex/side-plank.jpg", mode: "time", work: 25, weight: "bodyweight", notes: "No external hip rotation." },
        { name: "Single arm plank, left", image: "images/ex/side-plank.jpg", mode: "time", work: 25, weight: "bodyweight", notes: "No external hip rotation." },
        { name: "Bicycles", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Build up to 60 sec." },
        { name: "Prone plank on elbows", image: "images/ex/plank.jpg", mode: "time", work: 45, weight: "bodyweight", notes: "Build up to 60 sec." },
        { name: "Modified bicycles", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "V-sit position; up to 60 sec." },
        { name: "Lateral plank on right elbow", image: "images/ex/side-plank.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Up to 40 sec." },
        { name: "Lateral plank on left elbow", image: "images/ex/side-plank.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Up to 40 sec." },
        { name: "Scissors", image: "images/ex/scissor-kick.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Keep back flat, legs straight in air." }
      ] }
  ];
}

// Workout #8 & #13 — Functional Power (2 rounds, :45 / :15) + hip ROM
function power4515() {
  return [
    { type: "circuit", section: "Strength", name: "Round 1", rounds: 2,
      restBetweenExercises: 15, restAfterRound: 90, restAfter: 90,
      exercises: [
        { name: "Up/down prone plank", image: "images/ex/plank.jpg", mode: "time", work: 45, weight: "bodyweight", notes: "Use your core; proper posture every exercise." },
        { name: "Bicycle", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Single leg V-up", mode: "time", work: 45, weight: "bodyweight" },
        { name: "V-sit with med ball rotation", image: "images/ex/russian-twist.jpg", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Pushups (stayin' alive if you want)", image: "images/ex/pushups.jpg", mode: "time", work: 45, weight: "bw or dbs" },
        { name: "Jump squats", image: "images/ex/jump-squat.jpg", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Rows", image: "images/ex/row.jpg", mode: "time", work: 45, weight: "choose weight", notes: "In a forward T, alternate rows." },
        { name: "Sumo squats", image: "images/ex/plie-squat.jpg", mode: "time", work: 45, weight: "choose weight" },
        { name: "Squat and press", image: "images/ex/thruster.jpg", mode: "time", work: 45, weight: "2 dumbbells", notes: "Press when standing up after the squat." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2", rounds: 2,
      restBetweenExercises: 15, restAfterRound: 90, restAfter: 60,
      exercises: [
        { name: "Static bicycle", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 40, perSide: true, weight: "bodyweight" },
        { name: "Crunches with legs over bench", image: "images/ex/crunch.jpg", mode: "time", work: 60, weight: "db/med ball", notes: "Hold at sternum." },
        { name: "Lateral plank", image: "images/ex/side-plank.jpg", mode: "time", work: 40, perSide: true, weight: "bodyweight" },
        { name: "Scissors", image: "images/ex/scissor-kick.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Keep back flat." },
        { name: "Single leg shoulder press", image: "images/ex/shoulder-press-1arm.jpg", mode: "time", work: 45, weight: "2 dumbbells", notes: "Single-leg: 1 set right 45s, 1 set left 45s." },
        { name: "Lunge jumps", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Snow angels", mode: "time", work: 45, weight: "2 dumbbells" },
        { name: "Lunges w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "time", work: 45, weight: "1 dumbbell" },
        { name: "Curl to press on two legs", mode: "time", work: 45, weight: "2 dumbbells" }
      ] },
    hipRomTs("1 db at chest")
  ];
}

/* ---------------- Reusable CORE blocks ---------------- */

function coreW2() {
  return { type: "circuit", section: "Core", name: "Core (Group 1)", rounds: 2,
    exercises: [
      { name: "Single arm plank w/ med ball or db (armpit to 'stayin alive')", image: "images/ex/side-plank.jpg", mode: "time", work: 30, perSide: true, weight: "med ball / db", notes: "Slow & controlled, rotate through trunk, pelvis level start & end." },
      { name: "Opposite arm and leg V-up", mode: "time", work: 60, weight: "bodyweight", notes: "Neutral spine; bring leg & arm together, opposite hand to knee/ankle; control the way down." },
      { name: "Supine bridge w/ med ball or db, arm extension + leg touch", mode: "time", work: 30, perSide: true, weight: "med ball / db", notes: "Keep hips up, bring leg & arms up together, med ball to shin." },
      { name: "Lateral plank with ant/post leg move", image: "images/ex/side-plank.jpg", mode: "time", work: 30, perSide: true, weight: "med ball / db", notes: "No hip sag; move leg front then back." }
    ] };
}

function coreW4() {
  return { type: "circuit", section: "Core", name: "Core (Group 1)", rounds: 2,
    exercises: [
      { name: "Upright plank, right leg", image: "images/ex/plank.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Lift butt off ground, traps relaxed, pull shoulder blades together & down, spine neutral." },
      { name: "Toe touches", image: "images/ex/toe-touchers.jpg", mode: "time", work: 30, perSide: true, weight: "bodyweight", notes: "Low back on floor; lift one leg, opposite hand to touch." },
      { name: "Lateral plank with 'stayin alive'", image: "images/ex/side-plank.jpg", mode: "time", work: 30, perSide: true, weight: "med ball / db", notes: "No hip sag; ball/db from floor to chest, straight up." },
      { name: "FRAWG", mode: "time", work: 60, weight: "bodyweight", notes: "Twist at hips, bring knee to opposite elbow." }
    ] };
}

// Swiss-ball core — Workout #7 & #12
function coreSwiss() {
  return { type: "circuit", section: "Core", name: "Swiss-ball Core", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
    exercises: [
      { name: "Swiss ball sit up w/ feet anchored + db at sternum", image: "images/ex/ball-crunch.jpg", mode: "time", work: 60, weight: "10 lb", notes: "If no ball, substitute a bench. Anchor feet, lumbar flat." },
      { name: "Prone plank w/ elbows on ball", image: "images/ex/plank.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "If no ball, go regular. Anchor feet, no hyperextension." },
      { name: "Swiss ball crossover sit up w/ feet anchored + db at sternum", image: "images/ex/ball-crunch.jpg", mode: "time", work: 60, weight: "10 lb", notes: "If no ball, substitute a bench. Anchor feet, lumbar flat." },
      { name: "Prone plank w/ elbows on ball, alternating leg up/down", image: "images/ex/plank.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "If no ball, go regular. Anchor feet, no hyperextension." }
    ] };
}

// Crunch/plank core — Workout #9 & #14
function coreCrunch() {
  return { type: "circuit", section: "Core", name: "Core", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
    exercises: [
      { name: "Crunch w/ feet flat", image: "images/ex/crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Lumbar spine flat." },
      { name: "Lateral plank, right side", image: "images/ex/side-plank.jpg", mode: "time", work: 45, weight: "bodyweight" },
      { name: "Crunch w/ feet up", image: "images/ex/crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Lumbar spine flat." },
      { name: "Lateral plank, left side", image: "images/ex/side-plank.jpg", mode: "time", work: 45, weight: "bodyweight" },
      { name: "Crossover crunch, right", image: "images/ex/crossover-crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Opposite elbow to knee." },
      { name: "Prone plank w/ leg in and out to side", image: "images/ex/plank.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Alternate leg in and out." },
      { name: "Crossover crunch, left", image: "images/ex/crossover-crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Opposite elbow to knee." }
    ] };
}

/* ---------------- RUN blocks (one per day) ---------------- */

const RUN = {
  w1: { type: "interval", section: "Run", name: "Super Shuttles", restBetweenSets: 180,
        notes: "Total 900 yds · rest:work 3:1", sets: [
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, target: "60 sec" } ] },

  w2: { type: "interval", section: "Run", name: "Fartlek", restBetweenSets: 240,
        notes: "Total 1320 yds · active recovery", sets: [
          { label: "2 Fartlek laps", reps: 1 },
          { label: "2 Fartlek laps", reps: 1 },
          { label: "2 Fartlek laps", reps: 1 } ] },

  w3: { type: "interval", section: "Run", name: "Down & Backs / Sprints", restBetweenSets: 120,
        notes: "Total 1200 yds · rest:work 2:1", sets: [
          { label: "20-yard Down & Back", reps: 10, interRepRest: 12 },
          { label: "40-yard Sprint", reps: 10, interRepRest: 10 },
          { label: "20-yard Down & Back", reps: 10, interRepRest: 12 },
          { label: "40-yard Sprint", reps: 10, interRepRest: 10 } ] },

  w4: { type: "timed", section: "Run", name: "Cooper Run", work: 720, notes: "Go to a track and run as far as you can for 12 minutes." },

  w5: { type: "interval", section: "Run", name: "50-yard Sprints", restBetweenSets: 120,
        notes: "Total 1100 yds · rest:work 1:1", sets: [
          { label: "50-yard Sprint", reps: 5, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 5, interRepRest: 7 } ] },

  w6: { type: "interval", section: "Run", name: "Super Shuttles", restBetweenSets: 180,
        notes: "Total 1200 yds · rest:work 3:1", sets: [
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, target: "60 sec" } ] },

  w7: { type: "interval", section: "Run", name: "Sprints / Down & Backs", restBetweenSets: 120,
        notes: "Total 1500 yds · rest:work 3:1", sets: [
          { label: "50-yard Sprint", reps: 10, interRepRest: 18, restAfter: 120 },
          { label: "25-yard Down & Back", reps: 10, interRepRest: 21, restAfter: 180 },
          { label: "50-yard Sprint", reps: 10, interRepRest: 18 } ] },

  w8: { type: "interval", section: "Run", name: "Fartlek", restBetweenSets: 480,
        notes: "Total 1400 yds · active recovery", sets: [
          { label: "4 Fartlek laps", reps: 1 },
          { label: "3 Fartlek laps", reps: 1 } ] },

  w9: { type: "timed", section: "Run", name: "Cooper Run", work: 720, notes: "Go to a track and run as far as you can for 12 minutes." },

  w10: { type: "interval", section: "Run", name: "50-yard Sprints", restBetweenSets: 120,
        notes: "Total ~1300 yds · rest:work 1:1", sets: [
          { label: "50-yard Sprint", reps: 4, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 4, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, interRepRest: 7 },
          { label: "50-yard Sprint", reps: 4, interRepRest: 7 } ] },

  w11: { type: "interval", section: "Run", name: "200-yard Sprints", restBetweenSets: 240,
        notes: "Total 1200 yds · active recovery · sprint ½ lap, jog back, then next", sets: [
          { label: "200-yard sprint", reps: 3, interRepRest: 0, notes: "Sprint half a lap, jog back to start, then go again." },
          { label: "200-yard sprint", reps: 3, interRepRest: 0, notes: "Sprint half a lap, jog back to start, then go again." } ] },

  w12: { type: "interval", section: "Run", name: "Shuttles / Sprints", restBetweenSets: 120,
        notes: "Total 1600 yds · rest:work 3:1", sets: [
          { label: "40-yard Shuttle", reps: 5, interRepRest: 54, restAfter: 120 },
          { label: "40-yard Sprint", reps: 10, interRepRest: 15, restAfter: 180 },
          { label: "40-yard Shuttle", reps: 5, interRepRest: 54 } ] },

  w13: { type: "interval", section: "Run", name: "Sprints / Down & Backs", restBetweenSets: 120,
        notes: "Total 1500 yds · rest:work 2:1", sets: [
          { label: "50-yard Sprint", reps: 10, interRepRest: 12 },
          { label: "50-yard Down & Back", reps: 5, interRepRest: 30 },
          { label: "50-yard Sprint", reps: 10, interRepRest: 12 } ] },

  w14: { type: "interval", section: "Run", name: "Timed Mile Runs", restBetweenSets: 540,
        notes: "Goal: run a mile in 6:05 or less", sets: [
          { label: "Timed Mile Run", reps: 1, stopwatch: true, targetSec: 365, target: "6:05" },
          { label: "Timed Mile Run", reps: 1 } ] },

  w15: { type: "interval", section: "Run", name: "Dongers", restBetweenSets: 0,
        notes: "Total 1400 yds · rest:work 1:1", sets: [
          { label: "Donger", reps: 4, interRepRest: 180 } ] }
};

/* ---------------- Assemble the 15 days ---------------- */

function day(n, runBlock, middleBlocks) {
  // Every day: warm-up + stretch, then the run, then strength/core,
  // then cool-down stretch.
  return {
    name: "Workout #" + n,
    blocks: [ warmup(), stretch("Stretch"), runBlock ]
      .concat(middleBlocks)
      .concat([ stretch("Cool-down") ])
  };
}

const SUMMER_PROGRAM = {
  name: "2023 Summer Workout Packet",
  days: [
    day(1,  RUN.w1,  strengthW1()),
    day(2,  RUN.w2,  [ coreW2() ]),
    day(3,  RUN.w3,  strengthW3()),
    day(4,  RUN.w4,  [ coreW4() ]),
    day(5,  RUN.w5,  strengthW5()),
    day(6,  RUN.w6,  powerBig()),
    day(7,  RUN.w7,  [ coreSwiss() ]),
    day(8,  RUN.w8,  power4515()),
    day(9,  RUN.w9,  [ coreCrunch() ]),
    day(10, RUN.w10, strengthW10()),
    day(11, RUN.w11, powerBig()),
    day(12, RUN.w12, [ coreSwiss() ]),
    day(13, RUN.w13, power4515()),
    day(14, RUN.w14, [ coreCrunch() ]),
    day(15, RUN.w15, strengthW10())
  ]
};

// The app looks for SAMPLE_PROGRAM as the built-in default (see storage.js).
const SAMPLE_PROGRAM = SUMMER_PROGRAM;

/* ---------------- Plain-English drill descriptions ----------------
   Used by the "Need a reminder" button. Longer keys are checked first so
   "Super Shuttle" wins over "Shuttle". */
const RUN_TERMS = [
  ["Super Shuttle", "Two cones 30 yds apart. Sprint A→B→A = 1 lap; do 5 laps (10 lengths) = 300 yds. Target 60 sec."],
  ["Down & Back", "Sprint from cone A to cone B, then back to A."],
  ["Shuttle", "Sprint A→B, B→A, then A→B."],
  ["Fartlek", "On a field: sprint the sidelines, jog the endlines. Once around the field = 1 lap."],
  ["Donger", "From the endline: sprint to the near 6-yd line & back, to the top of the penalty area & back, to halfway & back, to the far endline & back."],
  ["Timed Mile", "Run one mile as fast as you can. Goal: 6:05 or less."],
  ["Cooper Run", "Run as far as you can in 12 minutes."],
  ["Sprint", "Sprint one length, from cone A to cone B."]
];

function runDescription(name) {
  for (let i = 0; i < RUN_TERMS.length; i++) {
    if (name && name.indexOf(RUN_TERMS[i][0]) !== -1) return RUN_TERMS[i][1];
  }
  return "";
}
