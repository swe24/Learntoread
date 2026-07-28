/* =====================================================================
   Audio engine: speech synthesis (works offline on iPad) + fun sound
   effects generated with WebAudio. iOS requires a user gesture before
   audio can play, so everything is unlocked on the first tap.
   ===================================================================== */

const AudioEngine = (() => {
  let ctx = null;
  let voice = null;
  let unlocked = false;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    // Prefer friendly, high-quality English voices found on iPads
    const prefer = ["Samantha", "Karen", "Daniel", "Moira", "Tessa"];
    voice =
      voices.find(v => prefer.some(p => v.name.includes(p)) && v.lang.startsWith("en")) ||
      voices.find(v => v.lang === "en-US" && v.localService) ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];
  }

  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ensureCtx();
    // Warm up speech synthesis inside the user gesture (iOS requirement)
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      speechSynthesis.speak(u);
    }
  }

  /** Speak text; returns a promise that resolves when finished. */
  function speak(text, { rate = 0.85, pitch = 1.15, interrupt = true } = {}) {
    return new Promise(resolve => {
      if (!("speechSynthesis" in window)) return resolve();
      if (interrupt) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = pitch;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      // Safety net: resolve even if onend never fires (an iOS quirk)
      const ms = Math.max(2500, text.length * 130);
      setTimeout(resolve, ms);
    });
  }

  /** Speak a list of chunks with a pause between each (for sounding out). */
  async function speakSeq(parts, { gap = 350, rate = 0.8, onEach = null } = {}) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    for (let i = 0; i < parts.length; i++) {
      if (onEach) onEach(i);
      await speak(parts[i], { rate, interrupt: false });
      await wait(gap);
    }
  }

  function stop() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // ---- Sound effects (small synthesised jingles) ----
  function tone(freq, t0, dur, type = "sine", gain = 0.18) {
    const c = ensureCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime + t0);
    g.gain.linearRampToValueAtTime(gain, c.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t0);
    o.stop(c.currentTime + t0 + dur + 0.05);
  }

  const sfx = {
    pop()     { tone(520, 0, 0.1, "triangle", 0.22); },
    ding()    { tone(880, 0, 0.18); tone(1318, 0.09, 0.25); },
    correct() { tone(523, 0, 0.12, "triangle"); tone(659, 0.1, 0.12, "triangle"); tone(784, 0.2, 0.28, "triangle"); },
    wrong()   { tone(220, 0, 0.2, "sine", 0.12); tone(185, 0.12, 0.3, "sine", 0.12); },
    fanfare() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, "triangle", 0.2));
      tone(1319, 0.5, 0.5, "triangle", 0.2);
    },
    whoosh()  { tone(300, 0, 0.08, "sawtooth", 0.05); tone(600, 0.05, 0.1, "sawtooth", 0.05); },
    pageTurn(){ tone(400, 0, 0.06, "triangle", 0.08); tone(500, 0.05, 0.08, "triangle", 0.08); },
  };

  return { unlock, speak, speakSeq, stop, sfx, wait };
})();
