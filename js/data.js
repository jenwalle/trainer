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
      { name: "Band seated calf stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths.", howto: "Sit tall with one leg straight out in front. Loop a band (or towel) around the ball of that foot and gently pull it toward you so your toes come back and you feel a stretch through your calf and Achilles. Keep the knee straight, breathe slowly, and ease a little deeper on each exhale." },
      { name: "Band supine hamstring stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths.", howto: "Lie on your back. Loop a band around one foot and raise that leg toward the ceiling, keeping the knee mostly straight, until you feel a stretch up the back of the thigh. Keep the other leg flat and relaxed; ease deeper on each exhale." },
      { name: "Band supine groin stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths.", howto: "Lie on your back with the band around one foot. Let that leg open out to the side (toward the floor) with a slight knee bend until you feel a stretch through the inner thigh/groin. Keep your hips flat and controlled." },
      { name: "Band supine glute stretch", mode: "time", work: 30, weight: "band", notes: "Hold ~5 slow breaths.", howto: "Lie on your back with the band around one foot. Pull that knee up and across your body toward the opposite shoulder until you feel a stretch deep in the glute. Keep your shoulders down on the floor." },
      { name: "Supine torso crossover", mode: "time", work: 30, weight: "bodyweight", notes: "Hold ~5 slow breaths.", howto: "Lie on your back, arms out in a T. Bring one knee up and let it fall across your body toward the floor on the opposite side, turning your head the other way. Keep both shoulders on the ground for a gentle spinal twist through your low back and obliques." },
      { name: "Supine superman stretch", mode: "time", work: 30, weight: "bodyweight", notes: "Hold ~5 slow breaths; breathe into the stretch.", howto: "Lie flat on your back and reach your arms straight overhead on the floor while pointing your toes away from you — like a 'superman' but face-up. Reach your hands and feet in opposite directions to lengthen your whole front body (shoulders, chest, abs, hip flexors). Keep your low back gently on the floor and breathe slowly, letting the stretch deepen on each exhale for about 5 breaths. Tap 'Watch a demo' for a visual." }
    ]
  };
}

// Cool-down = Hip ROM mobility + the flexibility stretches ("See Hip ROM & Flex").
// Every day ends with this.
function cooldown() {
  const s = stretch("Cool-down");
  s.name = "Hip ROM & Flexibility";
  s.rounds = 1;
  s.exercises = [
    { name: "Side to side squat", mode: "reps", reps: "10", weight: "bodyweight", howto: "Easy, controlled hip mobility: feet wide, shift side to side sitting into each hip. Lean from the hips (not the low back), keeping the chest tall — loosening the hips after your session." },
    { name: "Lunge matrix", mode: "reps", reps: "5 each direction", weight: "bodyweight", howto: "Step into a lunge straight ahead, then diagonally, then out to the side, returning to standing each time. Move slowly to open the hips in every direction." },
    { name: "Rotational T", mode: "reps", reps: "5 each side", weight: "bodyweight", howto: "Balance on one leg and hinge forward, opening your torso into a 'T' and rotating through the hip, then return upright. Gentle and controlled to finish mobilizing the hips." }
  ].concat(s.exercises);
  return s;
}

// Hip-ROM strength (Forward/Lateral/Rotational Ts) — functional-power days.
function hipRomTs(weight) {
  return {
    type: "circuit", section: "Strength", name: "Hip ROM Strength (Ts)", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 60,
    exercises: [
      { name: "Forward Ts", mode: "reps", reps: "8", sideByRound: true, fixedWeight: true, weight: weight, notes: "Set 1 right leg, set 2 left leg. Core tight, posture tall.", howto: "Balance on one leg, dumbbell held at your chest. Hinge forward at the hip reaching into a forward 'T' (torso and free leg forming a line), then return upright under control. Right leg for set 1, left leg for set 2." },
      { name: "Lateral Ts", mode: "reps", reps: "8", sideByRound: true, fixedWeight: true, weight: weight, notes: "Set 1 right leg, set 2 left leg.", howto: "Balance on one leg. Hinge and open your torso to the side into a lateral 'T', then return upright. Right leg for set 1, left leg for set 2." },
      { name: "Rotational Ts", mode: "reps", reps: "5", sideByRound: true, fixedWeight: true, weight: weight, notes: "Set 1 right leg, set 2 left leg.", howto: "Balance on one leg. Hinge forward and rotate your torso open into a 'T', then rotate back closed. Right leg for set 1, left leg for set 2." }
    ]
  };
}

/* ---------------- Reusable STRENGTH blocks ---------------- */

// Workout #1 — Functional Strength: Structure / Function / Realization
function strengthW1() {
  return [
    { type: "circuit", section: "Strength", name: "Structure (Group 1)", rounds: 4,
      exercises: [
        { name: "Squat w/ dumbbell to ground", mode: "time", work: 60, weight: "choose weight", notes: "Slow and controlled.", howto: "Hold a dumbbell in both hands at your chest. Sit your hips back and down until the dumbbell nearly touches the ground between your feet, chest tall and back flat, then drive up through your heels. Move slow and controlled — quality over speed." },
        { name: "Tricep dips on bench", mode: "time", work: 60, weight: "bodyweight", notes: "Bend knees to make easier; straight legs to make harder.", howto: "Hands on the edge of a bench behind you, fingers forward. Lower your body by bending your elbows straight back (not flaring out) until your upper arms are about parallel to the floor, then press back up. Bend your knees to make it easier, straighten your legs to make it harder." }
      ] },
    { type: "circuit", section: "Strength", name: "Function (Group 2)", rounds: 4,
      exercises: [
        { name: "Skaters", mode: "time", work: 60, weight: "bodyweight", notes: "Perfect landing each rep." },
        { name: "Snow angel on single leg", mode: "time", work: 60, sideByRound: true, weight: "choose weight", notes: "Right leg for rounds 1–2, left leg for rounds 3–4.", howto: "Balance on one leg holding light dumbbells at your sides. Sweep both arms out and up overhead like making a snow angel, then back down, staying tall and steady on the standing leg. Slow and controlled, back flat. Right leg the first two rounds, left leg the last two." }
      ] },
    { type: "circuit", section: "Strength", name: "Realization (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "Rotational T w/ db at sternum", mode: "reps", reps: "5", sideByRound: true, weight: "choose weight", notes: "Right leg for rounds 1–2, left leg for rounds 3–4.", howto: "Stand on one leg holding a dumbbell at your sternum. Hinge at the hips and rotate your torso, reaching into a 'T', then return to upright under control. Right leg the first two rounds (with squat jumps between), left leg the last two." },
        { name: "Lateral squat jumps", mode: "time", work: 60, weight: "bodyweight", notes: "Jump out to the side then back; don't let knees dive in.", howto: "From a quarter-squat, jump laterally to one side, land soft on the outside leg absorbing into a squat, then jump back to the other side. Keep your knees tracking over your toes — don't let them cave inward." }
      ] }
  ];
}

// Workout #3 — Functional Strength: Base / Build / Explode
function strengthW3() {
  return [
    { type: "circuit", section: "Strength", name: "Base (Group 1)", rounds: 4,
      exercises: [
        { name: "Sumo squat w/ extension", image: "images/ex/plie-squat.jpg", mode: "reps", reps: "5", sideByRound: true, weight: "2 dumbbells", notes: "One extension side per set.", howto: "Take a wide 'sumo' stance, toes turned slightly out, holding a dumbbell in each hand. Squat straight down keeping your back flat and knees tracking over your toes. As you stand, lift one leg out to the side (abduct from the heel), then return. One side per set — the app alternates the extension leg each set." },
        { name: "Break dancin' pushups", mode: "reps", reps: "10", weight: "2 dumbbells", notes: "Hips up even with spine, elbows in, exhale up, look at up hand, bring opposite leg through.", howto: "In a pushup position on dumbbells, lower your chest keeping elbows tucked. As you press up, rotate your hips and thread one leg underneath your body through to the other side (like a breakdance kick-through), looking at your top hand. Alternate sides each rep." }
      ] },
    { type: "circuit", section: "Strength", name: "Build (Group 2)", rounds: 4,
      exercises: [
        { name: "Walking lunge", image: "images/ex/dumbbell-lunges.jpg", mode: "reps", reps: "20 total (alternating)", weight: "1 dumbbell", notes: "Hold the db at your sternum. First 2 rounds twist toward the lead leg, last 2 rounds twist away.", howto: "Step forward into a lunge, both knees bending to about 90°, front heel planted and torso upright. As you lunge, rotate your torso 45° (toward the front leg for the first 2 rounds, away for the last 2). Push through the front heel to step directly into the next lunge. Alternate legs each step — 20 steps total." },
        { name: 'Single-leg "L" shoulder flys', image: "images/ex/shoulder-fly.jpg", mode: "reps", reps: "10", sideByRound: true, weight: "2 dumbbells", notes: "One balancing leg per set.", howto: "Balance on one leg with the other knee lifted to hip height. Holding light dumbbells, raise one arm straight out in front and the other straight out to the side (forming an 'L'), then lower and switch which arm goes front vs. side each rep. Stay tall and steady. One balancing leg per set — the app alternates it each set." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "Single-leg RDL to curl-press", image: "images/ex/rdl.jpg", mode: "reps", reps: "5", sideByRound: true, weight: "1 dumbbell", notes: "One standing leg per set.", howto: "Balance on one leg holding a dumbbell in the opposite hand. Hinge at the hip (single-leg Romanian deadlift), letting the free leg extend straight back, keeping your back flat. Stand back up and flow into a bicep curl then an overhead press: palm faces forward at the start, faces you at the middle, and away at the top. One standing leg per set — the app alternates it each set." },
        { name: "Squat jump", image: "images/ex/jump-squat.jpg", mode: "reps", reps: "20", weight: "bodyweight", notes: "Arms up when down, at sides in the air. Jump high, land soft.", howto: "Drop into a squat with your arms reaching up/overhead, then explode straight up as high as you can, bringing your arms down to your sides in the air. Land soft and quiet, absorbing straight back into the next squat." }
      ] }
  ];
}

// Workout #5 — Functional Strength: Base / Build / Explode
function strengthW5() {
  return [
    { type: "circuit", section: "Strength", name: "Base (Group 1)", rounds: 4,
      exercises: [
        { name: "Side to side squat", mode: "reps", reps: "20 total", weight: "1 dumbbell", notes: "Hold the db at your sternum; hips low & level.", howto: "Hold a dumbbell at your sternum in a wide stance. Shift your weight to one side, bending that knee into a side lunge while the other leg stays straight, then push back to center and go to the other side. Keep your hips low and level. 20 total, alternating sides." },
        { name: "Uneven bench press", mode: "reps", reps: "10", perSide: true, weight: "2 dumbbells", notes: "Keep your head and low back on the bench.", howto: "Lie on a bench with a dumbbell in each hand. Press unevenly: as your right hand presses up, extend your right leg out; then as your left hand presses up, extend your left leg out. The app runs 10 on the right, then 10 on the left." }
      ] },
    { type: "circuit", section: "Strength", name: "Build (Group 2)", rounds: 4,
      exercises: [
        { name: "Running lunges", image: "images/ex/dumbbell-lunges.jpg", mode: "time", work: 30, perSide: true, weight: "2 dumbbells", notes: "Keep the planted leg still the whole time.", howto: "Keep one leg planted the entire set. Drive the other knee up and forward into a forward lunge, then swing it back into a reverse lunge — like a controlled 'running' motion on one leg. Stay tall, arms moving opposite the legs. The app runs one leg, then the other." },
        { name: "Bicep curl to press on single leg", mode: "time", work: 30, perSide: true, weight: "2 dumbbells", notes: "Balance on one leg; do the curl-press with the opposite arm.", howto: "Balance on one leg, opposite knee lifted to hip height. With a dumbbell in each hand, curl to your shoulders then press overhead and lower back down, staying tall with your chest up. The app runs one balancing leg, then the other." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "John Travoltas – lateral", mode: "time", work: 30, perSide: true, weight: "1 dumbbell", notes: "Crunch opposite elbow to knee, then kick out to the side.", howto: "Named for the disco move. Holding a dumbbell, bring your opposite elbow and knee together in a crunch, then explosively kick that leg out to the side while the arm reaches out to the side too, turning your hand palm-up as you finish (the 'Travolta' point). Return and repeat. The app runs one side, then the other." },
        { name: "Lunge jump", mode: "time", work: 60, weight: "bodyweight", notes: "Switch legs in the air; jump high, land soft.", howto: "Drop into a lunge, then explode straight up and switch your legs in the air, landing softly in a lunge with the other leg forward. Keep your torso tall and absorb each landing." }
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
        { name: "Biomechanically-correct lunge w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "time", work: 60, sideByRound: true, weight: "your choice", notes: "Right leg for rounds 1–2, left leg for rounds 3–4.", howto: "Rear (trail) foot up on a bench, front foot planted ahead, dumbbell in the hand opposite the down leg. Lower straight down, touching the db toward the ground beside your foot, then press up through the front heel. Right leg the first two rounds, left leg the last two." },
        { name: "Shoulder press on single leg", image: "images/ex/shoulder-press-1arm.jpg", mode: "time", work: 60, sideByRound: true, weight: "your choice", notes: "Right leg for rounds 1–2, left leg for rounds 3–4.", howto: "Balance on one leg, other knee lifted toward hip height. Hold dumbbells at your shoulders, chest up, and press straight overhead over your spine, then lower under control. Right leg the first two rounds, left leg the last two." }
      ] },
    { type: "circuit", section: "Strength", name: "Explode (Group 3)", rounds: 4, restAfter: 60,
      exercises: [
        { name: "Rotational Ts", mode: "reps", reps: "5", sideByRound: true, weight: "bodyweight", notes: "Right leg for rounds 1–2, left leg for rounds 3–4.", howto: "Balance on one leg, torso hinged forward. Rotate your torso open into a 'T' driving from the up leg and hip, then rotate back closed under control. Right leg the first two rounds, left leg the last two." },
        { name: "Lunge jump", mode: "time", work: 60, weight: "bodyweight", notes: "Switch legs in the air; jump high, land soft.", howto: "Drop into a lunge, then explode straight up and switch your legs in the air, landing softly in a lunge with the other leg forward. Keep your torso tall and absorb each landing." }
      ] }
  ];
}

// Workout #6 & #11 — Functional Power (2 rounds + hip ROM + ab/core)
function powerBig() {
  return [
    { type: "circuit", section: "Strength", name: "Round 1 · Group 1", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 0,
      exercises: [
        { name: "Squat w/ db between legs", mode: "reps", reps: "12", weight: "choose weight", notes: "Use your core to stabilize; proper posture every rep.", howto: "Stand tall holding one dumbbell vertically with both hands, hanging down between your legs. Sit your hips back and squat down (the dumbbell lowers between your legs), keeping your chest up and back flat, then drive up through your heels." },
        { name: "Jump squats", image: "images/ex/jump-squat.jpg", mode: "reps", reps: "20", weight: "bodyweight" },
        { name: "Lunge w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "reps", reps: "8", perSide: true, weight: "choose weight", howto: "Rear foot up on a bench, front foot planted ahead. Lower straight down into a lunge (front knee over ankle, torso tall), then drive up through the front heel. The app runs one leg, then the other." },
        { name: "Hamstring curls on ball", image: "images/ex/ball-leg-curl.jpg", mode: "reps", reps: "20", weight: "bodyweight", howto: "Lie on your back with both heels on top of a stability ball and your hips lifted into a bridge. Bend your knees to roll the ball in toward your butt using your hamstrings, then straighten your legs to roll it back out. Keep your hips up the whole time." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 1 · Group 2", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 120,
      exercises: [
        { name: "Pushups", image: "images/ex/pushups.jpg", mode: "reps", reps: "15", weight: "bodyweight", notes: "No rest between groups 1 & 2." },
        { name: "Shoulder press (single leg)", mode: "reps", reps: "6", perSide: true, weight: "choose weight", notes: "Standing, balanced on one leg.", howto: "Stand balanced on one leg holding a dumbbell in each hand at your shoulders. Press the weights overhead and lower under control, staying tall and steady on that leg. The app runs 6 on the right leg, then 6 on the left." },
        { name: "Snow angels", mode: "reps", reps: "6", perSide: true, weight: "choose weight", notes: "Standing, balanced on one leg.", howto: "Standing balanced on one leg, hold light dumbbells at your sides. Sweep both arms out and up overhead (like making a snow angel) and back down, keeping your core tight and shoulders down. The app runs 6 on the right leg, then 6 on the left. Tap 'Watch a demo' for a visual." },
        { name: "Tricep dips on bench", mode: "reps", reps: "20", weight: "bodyweight", howto: "Hands on the edge of a bench behind you, fingers forward, legs out in front. Bend your elbows straight back (not flaring out) to lower your hips toward the floor, then press back up. Bend your knees to make it easier, straighten your legs to make it harder." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2 · Group 3", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 0,
      exercises: [
        { name: "Side to side squats", mode: "reps", reps: "20", weight: "choose weight" },
        { name: "Lunge jumps", mode: "reps", reps: "20", weight: "bodyweight" },
        { name: "Ham curls on ball – single leg", image: "images/ex/ball-leg-curl.jpg", mode: "reps", reps: "12", perSide: true, weight: "bodyweight", howto: "Lie on your back, heels on a stability ball, hips lifted. With one leg (other lifted off the ball), curl the ball toward your butt using your hamstring, then extend back out. Keep your hips up the whole time. The app runs one leg, then the other." },
        { name: "Forward T with weight", mode: "reps", reps: "6", sideByRound: true, weight: "choose weight", notes: "Dumbbell in the opposite hand as the down (standing) leg. One leg per set.", howto: "Balance on one leg, holding a dumbbell in the hand opposite that standing leg. Hinge forward at the hip, reaching into a forward 'T' (torso and free leg forming a straight line), then return upright under control. One leg per set — the app alternates the side each set." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2 · Group 4", rounds: 3,
      restBetweenExercises: 10, restAfterRound: 30, restAfter: 90,
      exercises: [
        { name: "Stayin' alive pushups", mode: "reps", reps: "8", perSide: true, weight: "choose weight", notes: "No rest between groups 3 & 4.", howto: "Do a pushup, then at the top rotate into a side plank reaching one arm to the ceiling ('stayin' alive'). Return, do a pushup, and rotate to the other side. The app runs 8 on the right, then 8 on the left." },
        { name: "Snow angels", mode: "reps", reps: "12", weight: "choose weight", notes: "Alternate each arm.", howto: "Standing tall with light dumbbells at your sides, sweep the arms out and overhead like a snow angel, alternating which arm leads each rep. Keep your core braced and shoulders down. Tap 'Watch a demo' for a visual." },
        { name: "Arnold press", image: "images/ex/standing-press.jpg", mode: "reps", reps: "12", weight: "choose weight", notes: "Standing. Half on left leg, half on right.", howto: "Done standing (photo shows a standing press). Start with dumbbells in front of your shoulders, palms facing you. As you press overhead, rotate your palms to face forward, then reverse the rotation as you lower. Do half the reps balanced on your left leg, half on your right." },
        { name: "Underhand pull-ups", image: "images/ex/chin-up.jpg", mode: "reps", reps: "6", weight: "bodyweight", notes: "With a knee driven up.", howto: "Hang from a bar with an underhand (palms-toward-you) grip. Pull your chin over the bar while driving one knee up toward your chest, then lower under control. If too hard, do supine pulls (bodyweight rows) instead." }
      ] },
    hipRomTs("8 lb db at chest"),
    { type: "circuit", section: "Core", name: "Ab/Core", rounds: 3,
      restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
      exercises: [
        { name: "Single arm plank", mode: "time", work: 25, perSide: true, weight: "bodyweight", notes: "2–3 rounds — do the optional 3rd if you're feeling good. No external hip rotation.", howto: "Hold a front (prone) plank but on ONE forearm, the other arm off the floor. Keep your hips square to the ground — don't let them rotate or sag. The app runs one arm, then the other. This section is 2–3 rounds; build the holds toward the longer times shown as you get stronger." },
        { name: "Bicycles", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Build up to 60 sec.", howto: "On your back, hands behind your head, shoulders off the floor. Bring one elbow toward the opposite knee while extending the other leg, then switch in a smooth pedaling motion." },
        { name: "Prone plank on elbows", mode: "time", work: 45, weight: "bodyweight", notes: "Build up to 60 sec.", howto: "Forearms on the floor, elbows under shoulders, body in a straight line from head to heels. Brace your abs and squeeze your glutes; don't let your hips sag or pike up." },
        { name: "Modified bicycles", mode: "time", work: 30, weight: "bodyweight", notes: "V-sit position; up to 60 sec.", howto: "Sit balanced in a V-sit (torso and legs both lifted, leaning back on your tailbone). From there do the bicycle motion — opposite elbow toward opposite knee — keeping your feet off the floor the whole time." },
        { name: "Lateral plank on elbow", mode: "time", work: 30, perSide: true, weight: "bodyweight", notes: "Up to 40 sec.", howto: "Side plank on one forearm, elbow under your shoulder, body in a straight line, hips lifted and stacked. Hold steady without letting your hips drop. The app runs one side, then the other." },
        { name: "Scissors", image: "images/ex/scissor-kick.jpg", mode: "time", work: 30, weight: "bodyweight", notes: "Keep back flat, legs straight in air.", howto: "On your back, low back pressed flat, legs straight and lifted. Lower one leg toward the floor while keeping the other up, then switch in a scissoring motion. Keep the movement controlled." }
      ] }
  ];
}

// Workout #8 & #13 — Functional Power (2 rounds, :45 / :15) + hip ROM
function power4515() {
  return [
    { type: "circuit", section: "Strength", name: "Round 1", rounds: 2,
      restBetweenExercises: 15, restAfterRound: 90, restAfter: 90,
      exercises: [
        { name: "Up/down prone plank", mode: "time", work: 45, weight: "bodyweight", notes: "Alternate which arm leads (right, then left).", howto: "Start in a forearm plank. Press up onto one hand, then the other, coming to a full push-up-position plank, then lower back down onto one forearm, then the other. Keep your hips level (don't rock side to side) and alternate which arm leads." },
        { name: "Bicycle", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Single leg V-up", mode: "time", work: 45, sideByRound: true, weight: "bodyweight", notes: "Set 1 right leg, set 2 left leg.", howto: "Lie on your back. Lift your torso and ONE straight leg to meet in a 'V', reaching your hands toward that foot, then lower under control. Right leg on set 1, left leg on set 2." },
        { name: "V-sit with med ball rotation", mode: "time", work: 45, weight: "med ball", notes: "Hold the med ball at your chest.", howto: "Sit in a V-sit (torso and feet lifted, balancing on your tailbone) holding a med ball at your chest. Rotate your torso to tap the ball toward the floor on one side, then the other, keeping your feet off the ground the whole time." },
        { name: "Pushups", image: "images/ex/pushups.jpg", mode: "time", work: 45, weight: "bw or dbs", notes: "Harder variation: 'stayin' alive' — rotate into a side plank at the top, one arm at a time.", howto: "Standard push-ups: hands under shoulders, body in a straight line, lower your chest and press up. For a harder variation, at the top of each rep rotate into a side plank reaching one arm to the ceiling ('stayin' alive'), alternating one arm at a time." },
        { name: "Jump squats", image: "images/ex/jump-squat.jpg", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Rows", image: "images/ex/row.jpg", mode: "time", work: 45, weight: "choose weight", notes: "In a forward T, alternate rows." },
        { name: "Sumo squats", image: "images/ex/plie-squat.jpg", mode: "time", work: 45, weight: "choose weight", howto: "Wide 'sumo' stance, toes turned out, holding a dumbbell (or two) at your chest or hanging between your legs. Squat straight down keeping your chest tall and knees tracking over your toes, then drive up through your heels." },
        { name: "Squat and press", image: "images/ex/thruster.jpg", mode: "time", work: 45, weight: "2 dumbbells", notes: "Press when standing up after the squat." }
      ] },
    { type: "circuit", section: "Strength", name: "Round 2", rounds: 2,
      restBetweenExercises: 15, restAfterRound: 90, restAfter: 60,
      exercises: [
        { name: "Static bicycle", image: "images/ex/bicycle-crunch.jpg", mode: "time", work: 40, weight: "bodyweight", notes: "Both legs work the whole round.", howto: "On your back, hands behind your head, shoulders off the floor and both legs extended and lifted. Bring one elbow to the opposite knee while the other leg extends out, then switch — a slow, controlled bicycle. Both legs work continuously each round." },
        { name: "Crunches with legs over bench", image: "images/ex/crunch.jpg", mode: "time", work: 60, weight: "db/med ball", notes: "Hold the weight at your sternum.", howto: "Lie on your back with your lower legs resting up over a bench (hips and knees bent to 90°). Hold a dumbbell or med ball at your sternum and crunch up, lifting your shoulder blades off the floor, then lower under control." },
        { name: "Lateral plank", image: "images/ex/side-plank.jpg", mode: "time", work: 40, sideByRound: true, weight: "bodyweight", notes: "Set 1 right side, set 2 left side." },
        { name: "Scissors", image: "images/ex/scissor-kick.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Keep back flat." },
        { name: "Single leg shoulder press", image: "images/ex/shoulder-press-1arm.jpg", mode: "time", work: 45, sideByRound: true, weight: "2 dumbbells", notes: "Set 1 right leg, set 2 left leg.", howto: "Balance on one leg holding dumbbells at your shoulders. Press overhead and lower under control, staying tall and steady. Right leg for set 1, left leg for set 2." },
        { name: "Lunge jumps", mode: "time", work: 45, weight: "bodyweight" },
        { name: "Snow angels", mode: "time", work: 45, weight: "2 dumbbells", notes: "Standing.", howto: "Standing tall with light dumbbells at your sides, sweep both arms out and up overhead like a snow angel and back down, keeping your core braced and shoulders down. Tap 'Watch a demo' for a visual." },
        { name: "Lunges w/ trail leg on bench", image: "images/ex/split-squat.jpg", mode: "time", work: 45, weight: "1 dumbbell", howto: "Rear foot up on a bench, front foot planted ahead, dumbbell in hand. Lower straight down into a lunge (front knee over ankle, torso tall), then drive up through the front heel." },
        { name: "Curl to press on two legs", mode: "time", work: 45, weight: "2 dumbbells", notes: "Standing on both legs.", howto: "Standing tall with a dumbbell in each hand, curl the weights to your shoulders, then press them overhead and lower back down under control." }
      ] },
    hipRomTs("1 db at chest")
  ];
}

/* ---------------- Reusable CORE blocks ---------------- */

function coreW2() {
  return { type: "circuit", section: "Core", name: "Core (Group 1)", rounds: 2,
    exercises: [
      { name: "Single arm plank", image: "images/ex/side-plank.jpg", mode: "time", work: 30, perSide: true, weight: "med ball / dumbbell", notes: "Slow & controlled; keep your pelvis level.", howto: "Hold a side plank on one forearm. With the top hand, hold a med ball or dumbbell and move it in an up-and-down movement — from your armpit up to fully overhead and back down — rotating slightly through your trunk while keeping your hips level start to finish. The app runs one side, then the other." },
      { name: "Opposite arm and leg V-up", mode: "time", work: 60, weight: "bodyweight", notes: "Neutral spine; control the way down.", howto: "Lie on your back. Simultaneously lift one leg and the opposite arm to meet over your body (hand toward knee or ankle), using your abs to lift your shoulder blades off the floor, then lower under control. Alternate sides." },
      { name: "Supine bridge with arm & leg reach", mode: "time", work: 30, perSide: true, weight: "med ball / dumbbell", notes: "Keep your hips up the whole time.", howto: "Lie on your back in a glute bridge, hips lifted, holding a med ball or dumbbell with arms extended toward the ceiling. Bring one leg and the weight up together, touching the weight toward your shin, then lower. Keep your hips up and core braced. The app runs one side, then the other." },
      { name: "Lateral plank with front/back leg move", mode: "time", work: 30, perSide: true, weight: "med ball / dumbbell", notes: "No hip sag; hold the weight in your top hand.", howto: "Hold a side plank with a med ball or dumbbell in your top hand (arm reaching up). Keeping your hips high and steady, move your top leg forward and then back without letting your hips sag. The app runs one side, then the other." }
    ] };
}

function coreW4() {
  return { type: "circuit", section: "Core", name: "Core (Group 1)", rounds: 2,
    exercises: [
      { name: "Upright (reverse) plank", mode: "time", work: 60, weight: "bodyweight", notes: "Tap 'Need a reminder' for a demo — this one's easy to picture wrong.", howto: "Sit with legs extended and hands on the floor behind you, fingers pointing toward your feet. Press through your hands and heels to lift your hips up so your body forms a straight line facing the ceiling (a reverse plank). Keep your shoulder blades pulled together and down and your neck neutral. Watch the demo video if unsure." },
      { name: "Toe touches", mode: "time", work: 30, perSide: true, weight: "bodyweight", notes: "Keep your low back on the floor.", howto: "Lie on your back and lift one leg toward the ceiling. Reach the opposite hand up to touch that toe, lifting just your shoulder blade off the floor, then lower. Keep your low back pressed down. The app runs one side, then the other." },
      { name: "Lateral plank with 'stayin alive'", image: "images/ex/side-plank.jpg", mode: "time", work: 30, perSide: true, weight: "med ball / dumbbell", notes: "No hip sag; hold the weight in your top hand.", howto: "Hold a side plank. With a med ball or dumbbell in your top hand, bring it from the floor in to your chest and then press it straight up toward the ceiling (the 'stayin alive' point), then reverse. Keep your hips high. The app runs one side, then the other." },
      { name: "Mountain climbers", image: "images/ex/mountain-climbers.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "Slow & controlled; keep your lumbar spine flat.", howto: "In a pushup position, drive one knee toward the opposite elbow, twisting slightly at the hips, then switch legs. Keep your hips low and your back flat — controlled, not frantic." }
    ] };
}

// Swiss-ball core — Workout #7 & #12
function coreSwiss() {
  return { type: "circuit", section: "Core", name: "Swiss-ball Core", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
    exercises: [
      { name: "Swiss ball sit up (db at sternum)", image: "images/ex/ball-crunch.jpg", mode: "time", work: 60, weight: "10 lb", fixedWeight: true, notes: "If no ball, substitute a bench.", howto: "Sit on a stability ball and walk your feet out so your low back is supported on the ball, feet anchored. Hold a 10 lb dumbbell at your sternum and crunch up, then lower back over the ball. Keep your lumbar spine flat." },
      { name: "Prone plank w/ elbows on ball", mode: "time", work: 60, weight: "bodyweight", notes: "If no ball, do a regular forearm plank.", howto: "Place your forearms on a stability ball, feet anchored on the floor, body in a straight line. Brace hard to keep the ball still — no sagging or hyperextending. If you don't have a ball, do a regular forearm plank on the floor." },
      { name: "Swiss ball crossover sit up (db at sternum)", image: "images/ex/ball-crunch.jpg", mode: "time", work: 60, weight: "10 lb", fixedWeight: true, notes: "If no ball, substitute a bench.", howto: "Same setup as the ball sit-up, holding a 10 lb dumbbell at your sternum. As you crunch up, rotate your torso to bring a shoulder toward the opposite side, alternating each rep. Keep your lumbar spine flat." },
      { name: "Prone plank w/ elbows on ball, alternating leg up/down", mode: "time", work: 60, weight: "bodyweight", notes: "If no ball, do it on the floor.", howto: "Forearm plank with elbows on a stability ball. Hold the ball steady while lifting one leg a few inches off the floor and lowering it, then the other — alternating. Don't let your hips rock. Regular floor plank if no ball." }
    ] };
}

// Crunch/plank core — Workout #9 & #14
function coreCrunch() {
  return { type: "circuit", section: "Core", name: "Core", rounds: 2,
    restBetweenExercises: 0, restAfterRound: 0, restAfter: 0,
    exercises: [
      { name: "Crunch w/ feet flat", image: "images/ex/crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "As many good reps as you can in the time. Lumbar spine flat." },
      { name: "Lateral plank, right side", image: "images/ex/side-plank.jpg", mode: "time", work: 45, weight: "bodyweight" },
      { name: "Crunch w/ feet up", mode: "time", work: 60, weight: "bodyweight", notes: "As many good reps as you can in the time. Feet up, lumbar spine flat.", howto: "Lie on your back with your feet lifted and knees bent to 90° directly over your hips (shins parallel to the floor). Crunch up, lifting your shoulder blades off the floor, keeping your low back down. As many reps as you can in the time." },
      { name: "Lateral plank, left side", image: "images/ex/side-plank.jpg", mode: "time", work: 45, weight: "bodyweight" },
      { name: "Crossover crunch, right", image: "images/ex/crossover-crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "As many good reps as you can in the time. Opposite elbow to knee." },
      { name: "Prone plank w/ leg out and in", mode: "time", work: 60, weight: "bodyweight", notes: "Legs go out wide, then back in — alternating.", howto: "Hold a forearm (or high) plank. Keeping your hips level and core braced, step one leg out wide to the side and back in, then the other leg — alternating. Don't let your hips pike up or sag." },
      { name: "Crossover crunch, left", image: "images/ex/crossover-crunch.jpg", mode: "time", work: 60, weight: "bodyweight", notes: "As many good reps as you can in the time. Opposite elbow to knee." }
    ] };
}

/* ---------------- RUN blocks (one per day) ---------------- */

const RUN = {
  w1: { type: "interval", section: "Run", name: "Super Shuttles", restBetweenSets: 180,
        notes: "Total 900 yds · target 60 sec · recovery = 3× your time", sets: [
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec", restRatio: 3 },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec", restRatio: 3 },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec", restRatio: 3 } ] },

  w2: { type: "interval", section: "Run", name: "Fartlek", restBetweenSets: 240,
        notes: "Total 1320 yds · start the timer, sprint the sidelines, jog the endlines", sets: [
          { label: "2 Fartlek laps", reps: 1, stopwatch: true },
          { label: "2 Fartlek laps", reps: 1, stopwatch: true },
          { label: "2 Fartlek laps", reps: 1, stopwatch: true } ] },

  w3: { type: "interval", section: "Run", name: "Down & Backs / Sprints", restBetweenSets: 120,
        notes: "Total 1200 yds · auto timer · 12/10 sec between reps", sets: [
          { label: "20-yard Down & Back", reps: 10, stopwatch: true, autoStart: true, interRepRest: 12 },
          { label: "40-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 10 },
          { label: "20-yard Down & Back", reps: 10, stopwatch: true, autoStart: true, interRepRest: 12 },
          { label: "40-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 10 } ] },

  w4: { type: "timed", section: "Run", name: "Cooper Run", work: 720, manualStart: true, notes: "Tap Go, then run as far as you can for 12 minutes." },

  w5: { type: "interval", section: "Run", name: "50-yard Sprints", restBetweenSets: 120,
        notes: "Total 1100 yds · recovery = your rep time (1:1)", sets: [
          { label: "50-yard Sprint", reps: 5, stopwatch: true, autoStart: true, restRatio: 1 },
          { label: "50-yard Sprint", reps: 6, stopwatch: true, autoStart: true, restRatio: 1 },
          { label: "50-yard Sprint", reps: 6, stopwatch: true, autoStart: true, restRatio: 1 },
          { label: "50-yard Sprint", reps: 5, stopwatch: true, autoStart: true, restRatio: 1 } ] },

  w6: { type: "interval", section: "Run", name: "Super Shuttles", restBetweenSets: 180,
        notes: "Total 1200 yds · rest:work 3:1", sets: [
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, stopwatch: true, targetSec: 60, target: "60 sec" },
          { label: "300-yard Super Shuttle", reps: 1, target: "60 sec" } ] },

  w7: { type: "interval", section: "Run", name: "Sprints / Down & Backs", restBetweenSets: 120,
        notes: "Total 1500 yds · auto timer · 18/21/18 sec between reps", sets: [
          { label: "50-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 18, restAfter: 120 },
          { label: "25-yard Down & Back", reps: 10, stopwatch: true, autoStart: true, interRepRest: 21, restAfter: 180 },
          { label: "50-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 18 } ] },

  w8: { type: "interval", section: "Run", name: "Fartlek", restBetweenSets: 480,
        notes: "Total 1400 yds · start the timer, sprint the sidelines, jog the endlines", sets: [
          { label: "4 Fartlek laps", reps: 1, stopwatch: true },
          { label: "3 Fartlek laps", reps: 1, stopwatch: true } ] },

  w9: { type: "timed", section: "Run", name: "Cooper Run", work: 720, manualStart: true, notes: "Tap Go, then run as far as you can for 12 minutes." },

  w10: { type: "interval", section: "Run", name: "50-yard Sprints", restBetweenSets: 120,
        notes: "Total ~1300 yds · target 7 sec/rep · 7 sec between reps · 2 min between sets", sets: [
          { label: "50-yard Sprint", reps: 4, stopwatch: true, autoStart: true, targetSec: 7, target: "7 sec", interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, stopwatch: true, autoStart: true, targetSec: 7, target: "7 sec", interRepRest: 7 },
          { label: "50-yard Sprint", reps: 4, stopwatch: true, autoStart: true, targetSec: 7, target: "7 sec", interRepRest: 7 },
          { label: "50-yard Sprint", reps: 6, stopwatch: true, autoStart: true, targetSec: 7, target: "7 sec", interRepRest: 7 },
          { label: "50-yard Sprint", reps: 4, stopwatch: true, autoStart: true, targetSec: 7, target: "7 sec", interRepRest: 7 } ] },

  w11: { type: "interval", section: "Run", name: "200-yard Sprints", restBetweenSets: 240,
        notes: "Total 1200 yds · active recovery · sprint ½ lap, jog back, then next", sets: [
          { label: "200-yard sprint", reps: 3, stopwatch: true, autoStart: true, interRepRest: 0, notes: "Sprint half a lap; jog back to start (that's your recovery), then go again." },
          { label: "200-yard sprint", reps: 3, stopwatch: true, autoStart: true, interRepRest: 0, notes: "Sprint half a lap; jog back to start (that's your recovery), then go again." } ] },

  w12: { type: "interval", section: "Run", name: "Shuttles / Sprints", restBetweenSets: 120,
        notes: "Total 1600 yds · auto timer per rep", sets: [
          { label: "40-yard Shuttle", reps: 5, stopwatch: true, autoStart: true, interRepRest: 54, restAfter: 120 },
          { label: "40-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 15, restAfter: 180 },
          { label: "40-yard Shuttle", reps: 5, stopwatch: true, autoStart: true, interRepRest: 54 } ] },

  w13: { type: "interval", section: "Run", name: "Sprints / Down & Backs", restBetweenSets: 120,
        notes: "Total 1500 yds · auto timer per rep", sets: [
          { label: "50-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 12 },
          { label: "50-yard Down & Back", reps: 5, stopwatch: true, autoStart: true, interRepRest: 30 },
          { label: "50-yard Sprint", reps: 10, stopwatch: true, autoStart: true, interRepRest: 12 } ] },

  w14: { type: "interval", section: "Run", name: "Timed Mile Runs", restBetweenSets: 540,
        notes: "Goal: run a mile in 6:05 or less", sets: [
          { label: "Timed Mile Run", reps: 1, stopwatch: true, targetSec: 365, target: "6:05" },
          { label: "Timed Mile Run", reps: 1 } ] },

  w15: { type: "interval", section: "Run", name: "Dongers", restBetweenSets: 0,
        notes: "Total 1400 yds · auto timer · 3 min rest between reps", sets: [
          { label: "Donger", reps: 4, stopwatch: true, autoStart: true, interRepRest: 180 } ] }
};

/* ---------------- Assemble the 15 days ---------------- */

function day(n, runBlock, middleBlocks) {
  // Every day: warm-up + stretch, then the run, then strength/core,
  // then cool-down stretch.
  return {
    name: "Workout #" + n,
    blocks: [ warmup(), stretch("Stretch"), runBlock ]
      .concat(middleBlocks)
      .concat([ cooldown() ])
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
