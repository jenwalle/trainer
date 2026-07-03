/* =========================================================================
   storage.js  —  Saving things on your phone
   =========================================================================

   The browser gives every website a small private notebook called
   "localStorage". Whatever we write there stays on THIS device, even after
   you close the app. Nothing leaves your phone; there's no server involved.

   localStorage can only store text, so we use JSON.stringify to turn our
   data into text when saving, and JSON.parse to turn it back into data
   when loading. The helpers below hide that so the rest of the app can just
   say Storage.getSettings() / Storage.saveSettings(...).
   ========================================================================= */

const Storage = (function () {
  // Unique names so we don't collide with anything else on the device.
  const KEY_SETTINGS = "trainer.settings.v1";
  const KEY_HISTORY  = "trainer.history.v1";
  const KEY_PROGRAM  = "trainer.program.v1";

  // Read text from the notebook and turn it back into data.
  // If nothing is saved yet, return the fallback we pass in.
  function read(key, fallback) {
    try {
      const text = localStorage.getItem(key);
      return text ? JSON.parse(text) : fallback;
    } catch (e) {
      console.warn("Could not read", key, e);
      return fallback;
    }
  }

  // Turn data into text and write it to the notebook.
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save", key, e);
    }
  }

  // ----- Settings (the sound / vibration / screen-awake switches) -----
  const DEFAULT_SETTINGS = { sound: true, vibrate: true, keepAwake: true };

  function getSettings() {
    // Spread merges defaults with saved values, so adding a new setting
    // later won't break people who saved settings before it existed.
    return { ...DEFAULT_SETTINGS, ...read(KEY_SETTINGS, {}) };
  }
  function saveSettings(settings) {
    write(KEY_SETTINGS, settings);
  }

  // ----- Program (the training days) -----
  // For now we fall back to the SAMPLE_PROGRAM from data.js. Later, editing
  // your own program will just save here.
  function getProgram() {
    return read(KEY_PROGRAM, SAMPLE_PROGRAM);
  }
  function saveProgram(program) {
    write(KEY_PROGRAM, program);
  }

  // ----- Weights (what you chose for each "choose weight" exercise) -----
  // Stored as a map of exercise name -> the weight text you typed, so it
  // pre-fills next time and carries across workouts.
  const KEY_WEIGHTS = "trainer.weights.v1";
  function getWeights() { return read(KEY_WEIGHTS, {}); }
  function getWeight(name) { return getWeights()[name] || ""; }
  function saveWeight(name, value) {
    const all = getWeights();
    if (value) all[name] = value; else delete all[name];
    write(KEY_WEIGHTS, all);
  }

  // ----- History (a log of finished workouts) -----
  function getHistory() {
    return read(KEY_HISTORY, []);   // start with an empty list
  }
  function addHistoryEntry(entry) {
    const history = getHistory();
    history.unshift(entry);          // newest first
    write(KEY_HISTORY, history);
    return history;
  }
  function clearHistory() {
    write(KEY_HISTORY, []);
  }

  // Expose just these functions to the rest of the app.
  return {
    getSettings, saveSettings,
    getProgram, saveProgram,
    getWeights, getWeight, saveWeight,
    getHistory, addHistoryEntry, clearHistory
  };
})();
