/* =====================================================================
   Pip's Reading Adventure — main app
   Screen router + six activity types per stage + progress + rewards
   ===================================================================== */

const $app = () => document.getElementById("app");
const wait = AudioEngine.wait;

/* ------------------------- Progress storage ------------------------- */
const Progress = {
  KEY: "pip-progress-v1",
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { this.data = {}; }
    this.data.stages = this.data.stages || {};
    this.data.stickers = this.data.stickers || [];
    return this.data;
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  stage(id) { return (this.data.stages[id] = this.data.stages[id] || {}); },
  complete(stageId, activity) {
    const wasNew = !this.stage(stageId)[activity];
    this.stage(stageId)[activity] = true;
    const sticker = wasNew ? this.awardSticker() : null;
    this.save();
    return sticker;
  },
  awardSticker() {
    const next = STICKERS.find(s => !this.data.stickers.includes(s));
    if (next) this.data.stickers.push(next);
    return next || null;
  },
  stars(stageId) {
    const st = this.stage(stageId);
    return ACTIVITIES.filter(a => st[a.key]).length;
  },
  isStageUnlocked(index) {
    if (index === 0) return true;
    const prev = STAGES[index - 1];
    // Core activities (everything except the book) unlock the next stage
    return ACTIVITIES.filter(a => a.key !== "book")
      .every(a => this.stage(prev.id)[a.key]);
  },
};
Progress.load();

/* ----------------------------- Confetti ----------------------------- */
const Confetti = (() => {
  let canvas, ctx2d, parts = [], running = false;
  function init() {
    canvas = document.getElementById("confetti");
    ctx2d = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }
  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  }
  function burst(n = 80) {
    const colors = ["#f59e0b","#ef4444","#3b82f6","#22c55e","#a855f7","#ec4899","#facc15"];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 14 * devicePixelRatio,
        vy: (Math.random() * -12 - 4) * devicePixelRatio,
        s: (Math.random() * 8 + 5) * devicePixelRatio,
        c: colors[(Math.random() * colors.length) | 0],
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
    if (!running) { running = true; tick(); }
  }
  function tick() {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.35 * devicePixelRatio; p.r += p.vr;
      ctx2d.save();
      ctx2d.translate(p.x, p.y);
      ctx2d.rotate(p.r);
      ctx2d.fillStyle = p.c;
      ctx2d.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx2d.restore();
    });
    parts = parts.filter(p => p.y < canvas.height + 40);
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx2d.clearRect(0, 0, canvas.width, canvas.height); }
  }
  return { init, burst };
})();

/* --------------------------- Small helpers -------------------------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function setScreen(node, cls = "") {
  AudioEngine.stop();
  const app = $app();
  app.innerHTML = "";
  app.className = "screen " + cls;
  app.appendChild(node);
}
function backButton(onTap) {
  const b = el(`<button class="btn-back" aria-label="Back">←</button>`);
  b.addEventListener("click", () => { AudioEngine.sfx.pop(); onTap(); });
  return b;
}
function bigNext(label = "Next ➜") {
  return el(`<button class="btn-big btn-next">${label}</button>`);
}
function praise() {
  const lines = ["Great job!", "You did it!", "Super reading!", "Wow, amazing!", "Fantastic!", "You are a star!"];
  return lines[(Math.random() * lines.length) | 0];
}
function encourage() {
  const lines = ["Try again!", "Almost! Have another go!", "Not that one — you can do it!"];
  return lines[(Math.random() * lines.length) | 0];
}

/* A row of progress dots for multi-round activities */
function dotsRow(total) {
  const row = el(`<div class="dots"></div>`);
  for (let i = 0; i < total; i++) row.appendChild(el(`<span class="dot"></span>`));
  return {
    node: row,
    set(i) { [...row.children].forEach((d, k) => d.classList.toggle("done", k < i)); },
  };
}

/* Celebration overlay at the end of an activity */
async function celebrate(stageId, activityKey, onDone) {
  const sticker = Progress.complete(stageId, activityKey);
  const gotSticker = !!sticker;
  Confetti.burst(120);
  AudioEngine.sfx.fanfare();
  const overlay = el(`
    <div class="overlay">
      <div class="overlay-card pop-in">
        <div class="overlay-star">🌟</div>
        <h2>${praise()}</h2>
        ${gotSticker ? `<p class="sticker-won">You won a sticker! <span>${sticker}</span></p>` : ""}
        <button class="btn-big">OK!</button>
      </div>
    </div>`);
  overlay.querySelector("button").addEventListener("click", () => {
    overlay.remove();
    onDone();
  });
  document.body.appendChild(overlay);
  await AudioEngine.speak(praise() + (gotSticker ? " You won a sticker!" : ""));
}

/* =====================================================================
   SCREEN: Home — stage map
   ===================================================================== */
function showHome() {
  const node = el(`
    <div class="home">
      <header class="home-head">
        <div class="mascot bounce" id="mascot">🦊</div>
        <div>
          <h1>Pip's Reading Adventure</h1>
          <p class="subtitle">Tap a level and let's read!</p>
        </div>
      </header>
      <div class="stage-grid"></div>
      <footer class="home-foot">
        <button class="btn-chip" id="btn-stickers">🌟 My Stickers</button>
        <button class="btn-chip" id="btn-parents">👪 Grown-ups</button>
      </footer>
    </div>`);

  const grid = node.querySelector(".stage-grid");
  STAGES.forEach((stage, i) => {
    const unlocked = Progress.isStageUnlocked(i);
    const stars = Progress.stars(stage.id);
    const card = el(`
      <button class="stage-card ${unlocked ? "" : "locked"}" style="--c:${stage.color}">
        <span class="stage-icon">${unlocked ? stage.icon : "🔒"}</span>
        <span class="stage-num">Level ${i + 1}</span>
        <span class="stage-name">${stage.name}</span>
        <span class="stage-stars">${"⭐".repeat(stars)}${"☆".repeat(ACTIVITIES.length - stars)}</span>
      </button>`);
    card.addEventListener("click", () => {
      if (!unlocked) {
        AudioEngine.sfx.wrong();
        AudioEngine.speak("Finish the level before this one to unlock it!");
        card.classList.add("wiggle");
        setTimeout(() => card.classList.remove("wiggle"), 500);
        return;
      }
      AudioEngine.sfx.pop();
      showStage(i);
    });
    grid.appendChild(card);
  });

  node.querySelector("#mascot").addEventListener("click", () => {
    AudioEngine.sfx.ding();
    AudioEngine.speak("Hi! I'm Pip the fox. Let's learn to read together!");
  });
  node.querySelector("#btn-stickers").addEventListener("click", showStickers);
  node.querySelector("#btn-parents").addEventListener("click", showParents);
  setScreen(node, "screen-home");
}

/* =====================================================================
   SCREEN: Stage menu — list of activities
   ===================================================================== */
function showStage(index) {
  const stage = STAGES[index];
  const st = Progress.stage(stage.id);
  const node = el(`
    <div class="stage-menu" style="--c:${stage.color}">
      <header class="bar">
        <h2>${stage.icon} Level ${index + 1}: ${stage.name}</h2>
      </header>
      <div class="activity-list"></div>
    </div>`);
  node.querySelector(".bar").prepend(backButton(showHome));

  const list = node.querySelector(".activity-list");
  ACTIVITIES.forEach((act, i) => {
    // Activities unlock in order within a stage
    const prevDone = i === 0 || st[ACTIVITIES[i - 1].key];
    const done = !!st[act.key];
    const row = el(`
      <button class="activity-card ${done ? "done" : ""} ${prevDone ? "" : "locked"}">
        <span class="act-icon">${prevDone ? act.icon : "🔒"}</span>
        <span class="act-text"><b>${act.name}</b><small>${act.desc}</small></span>
        <span class="act-check">${done ? "✅" : ""}</span>
      </button>`);
    row.addEventListener("click", () => {
      if (!prevDone) {
        AudioEngine.sfx.wrong();
        AudioEngine.speak("Do the one before it first!");
        return;
      }
      AudioEngine.sfx.pop();
      startActivity(index, act.key);
    });
    list.appendChild(row);
  });
  setScreen(node, "screen-stage");
}

function startActivity(stageIndex, key) {
  const stage = STAGES[stageIndex];
  const back = () => showStage(stageIndex);
  const done = () => celebrate(stage.id, key, () => showStage(stageIndex));
  if (key === "video") return playSoundVideos(stage, back, done);
  if (key === "blend") return playBlend(stage, back, done);
  if (key === "build") return playBuild(stage, back, done);
  if (key === "tricky") return playTricky(stage, back, done);
  if (key === "read") return playRead(stage, back, done);
  if (key === "book") return playBook(stage, back, done);
}

/* =====================================================================
   ACTIVITY 1: Sound Videos — animated, narrated lesson per grapheme
   (a scripted animation timeline that plays like a little video)
   ===================================================================== */
function playSoundVideos(stage, onBack, onDone) {
  let i = 0;
  let cancelled = false;

  function showLesson() {
    const g = stage.graphemes[i];
    const info = SOUNDS[g];
    const label = graphemeLabel(g);
    const node = el(`
      <div class="video-lesson" style="--c:${stage.color}">
        <header class="bar">
          <div class="dots-holder"></div>
        </header>
        <div class="video-stage">
          <div class="big-letter" id="big-letter">${label}</div>
          <div class="cue-text" id="cue-text"></div>
          <div class="example-row" id="example-row"></div>
        </div>
        <div class="video-controls">
          <button class="btn-round" id="btn-replay" aria-label="Play again">🔁</button>
          <button class="btn-big" id="btn-onward">Next ➜</button>
        </div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(() => { cancelled = true; onBack(); }));
    const dots = dotsRow(stage.graphemes.length);
    dots.set(i);
    node.querySelector(".dots-holder").appendChild(dots.node);
    setScreen(node, "screen-video");

    const letterEl = node.querySelector("#big-letter");
    const cueEl = node.querySelector("#cue-text");
    const rowEl = node.querySelector("#example-row");

    async function playTimeline() {
      if (cancelled) return;
      AudioEngine.stop();
      rowEl.innerHTML = "";
      cueEl.textContent = "";
      letterEl.classList.remove("letter-in");
      void letterEl.offsetWidth; // restart animation
      letterEl.classList.add("letter-in");
      AudioEngine.sfx.whoosh();
      await wait(700); // let the letter land before talking
      await AudioEngine.speak(`This is ${label}.`, { rate: 0.75 });
      await wait(600);
      if (cancelled) return;

      letterEl.classList.add("pulse");
      await AudioEngine.speak(`${label} says:`, { rate: 0.7 });
      // repeat the sound three times, slowly, with room to echo
      await AudioEngine.speakSeq(
        [PHONEME_TTS[g], PHONEME_TTS[g], PHONEME_TTS[g]],
        { gap: 800, rate: 0.6 }
      );
      letterEl.classList.remove("pulse");
      await wait(500);
      if (cancelled) return;

      cueEl.textContent = info.cue;
      await AudioEngine.speak(info.cue, { rate: 0.78 });
      await wait(800);
      if (cancelled) return;

      for (const [word, emoji] of info.words) {
        if (cancelled) return;
        const chip = el(`<div class="example-chip pop-in"><span class="ex-emoji">${emoji}</span><span class="ex-word">${word}</span></div>`);
        rowEl.appendChild(chip);
        AudioEngine.sfx.pop();
        await wait(350); // let the picture appear before naming it
        await AudioEngine.speak(word, { rate: 0.7, interrupt: false });
        await wait(750); // time to look at the picture and repeat the word
      }
      if (cancelled) return;
      await wait(400);
      await AudioEngine.speak(`Can you say ${PHONEME_TTS[g]}?`, { rate: 0.7 });
      await wait(900); // pause so the child can have a go
      await AudioEngine.speak(`Say it with me: ${PHONEME_TTS[g]}!`, { rate: 0.65 });
    }

    node.querySelector("#btn-replay").addEventListener("click", () => { AudioEngine.sfx.pop(); playTimeline(); });
    node.querySelector("#btn-onward").addEventListener("click", () => {
      AudioEngine.sfx.pop();
      i++;
      if (i < stage.graphemes.length) showLesson();
      else onDone();
    });
    // Re-tapping the big letter replays just the sound
    letterEl.addEventListener("click", () => {
      AudioEngine.speak(`${PHONEME_TTS[g]}`, { rate: 0.6 });
      letterEl.classList.add("pulse");
      setTimeout(() => letterEl.classList.remove("pulse"), 600);
    });

    playTimeline();
  }
  showLesson();
}

/* =====================================================================
   ACTIVITY 2: Blend It! — tap sounds in order, blend, pick the picture
   ===================================================================== */
function playBlend(stage, onBack, onDone) {
  let round = 0;

  function showRound() {
    const [word, graphemes, correct, distractors] = stage.blend[round];
    let tapIndex = 0;

    const node = el(`
      <div class="game" style="--c:${stage.color}">
        <header class="bar"><div class="dots-holder"></div></header>
        <p class="game-prompt">Tap each sound, left to right!</p>
        <div class="tile-row" id="tiles"></div>
        <button class="btn-big hidden" id="btn-blend">🧲 Blend it!</button>
        <div class="pick-row hidden" id="pick"></div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(onBack));
    const dots = dotsRow(stage.blend.length);
    dots.set(round);
    node.querySelector(".dots-holder").appendChild(dots.node);
    setScreen(node, "screen-game");

    const tilesEl = node.querySelector("#tiles");
    graphemes.forEach((g, gi) => {
      const t = el(`<button class="tile">${graphemeLabel(g)}</button>`);
      t.addEventListener("click", async () => {
        if (gi !== tapIndex) {
          // Any tile can be tapped to hear it, but progress needs order
          AudioEngine.speak(PHONEME_TTS[g], { rate: 0.7 });
          return;
        }
        t.classList.add("lit");
        AudioEngine.sfx.pop();
        await AudioEngine.speak(PHONEME_TTS[g], { rate: 0.7 });
        tapIndex++;
        if (tapIndex === graphemes.length) {
          node.querySelector("#btn-blend").classList.remove("hidden");
          AudioEngine.speak("Now blend the sounds together!");
        }
      });
      tilesEl.appendChild(t);
    });
    AudioEngine.speak("Tap each sound, left to right!");

    node.querySelector("#btn-blend").addEventListener("click", async e => {
      e.target.classList.add("hidden");
      tilesEl.classList.add("blended");
      AudioEngine.sfx.whoosh();
      await AudioEngine.speakSeq(graphemes.map(g => PHONEME_TTS[g]), { gap: 150, rate: 0.7 });
      await AudioEngine.speak(word, { rate: 0.75 });
      await AudioEngine.speak(`${word}! Which picture is ${word}? Tap it!`);
      const pick = node.querySelector("#pick");
      pick.classList.remove("hidden");
      shuffle([correct, ...distractors]).forEach(em => {
        const b = el(`<button class="pick-card">${em}</button>`);
        b.addEventListener("click", async () => {
          if (em === correct) {
            b.classList.add("right");
            AudioEngine.sfx.correct();
            Confetti.burst(40);
            await AudioEngine.speak(`Yes! ${word}!`);
            round++;
            if (round < stage.blend.length) showRound();
            else onDone();
          } else {
            b.classList.add("wiggle");
            AudioEngine.sfx.wrong();
            AudioEngine.speak(encourage());
            setTimeout(() => b.classList.remove("wiggle"), 500);
          }
        });
        pick.appendChild(b);
      });
    });
  }
  showRound();
}

/* =====================================================================
   ACTIVITY 3: Word Builder — tap letter tiles to spell the picture
   ===================================================================== */
function playBuild(stage, onBack, onDone) {
  let round = 0;

  function showRound() {
    const [word, graphemes, emoji, extra] = stage.build[round];
    let slotIndex = 0;

    const node = el(`
      <div class="game" style="--c:${stage.color}">
        <header class="bar"><div class="dots-holder"></div></header>
        <div class="build-picture">${emoji}</div>
        <p class="game-prompt">Build the word: <b>${word}</b></p>
        <div class="slot-row" id="slots"></div>
        <div class="bank-row" id="bank"></div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(onBack));
    const dots = dotsRow(stage.build.length);
    dots.set(round);
    node.querySelector(".dots-holder").appendChild(dots.node);
    setScreen(node, "screen-game");

    const slotsEl = node.querySelector("#slots");
    graphemes.forEach(() => slotsEl.appendChild(el(`<div class="slot"></div>`)));

    const bankEl = node.querySelector("#bank");
    shuffle([...graphemes, ...extra]).forEach(g => {
      const t = el(`<button class="tile tile-bank">${graphemeLabel(g)}</button>`);
      t.addEventListener("click", async () => {
        if (t.classList.contains("used")) return;
        if (g === graphemes[slotIndex]) {
          t.classList.add("used");
          const slot = slotsEl.children[slotIndex];
          slot.textContent = graphemeLabel(g);
          slot.classList.add("filled", "pop-in");
          slotIndex++;
          AudioEngine.sfx.pop();
          await AudioEngine.speak(PHONEME_TTS[g], { rate: 0.7 });
          if (slotIndex === graphemes.length) {
            AudioEngine.sfx.correct();
            Confetti.burst(40);
            await AudioEngine.speak(`You built it! ${word}! ${praise()}`);
            round++;
            if (round < stage.build.length) showRound();
            else onDone();
          }
        } else {
          t.classList.add("wiggle");
          AudioEngine.sfx.wrong();
          AudioEngine.speak(PHONEME_TTS[g] + ". Hmm, listen for the next sound!", { rate: 0.8 });
          setTimeout(() => t.classList.remove("wiggle"), 500);
        }
      });
      bankEl.appendChild(t);
    });

    AudioEngine.speakSeq(
      [`Build the word ${word}.`, ...graphemes.map(g => PHONEME_TTS[g]), word],
      { gap: 250, rate: 0.75 }
    );
    // Tap the picture to hear the word again
    node.querySelector(".build-picture").addEventListener("click", () => {
      AudioEngine.speakSeq([...graphemes.map(g => PHONEME_TTS[g]), word], { gap: 250, rate: 0.7 });
    });
  }
  showRound();
}

/* =====================================================================
   ACTIVITY 4: Heart Words — tricky words learned by sight
   ===================================================================== */
function playTricky(stage, onBack, onDone) {
  let i = 0;

  function showCard() {
    const word = stage.tricky[i];
    const node = el(`
      <div class="game" style="--c:${stage.color}">
        <header class="bar"><div class="dots-holder"></div></header>
        <p class="game-prompt">A heart word! We learn it by heart ❤️</p>
        <button class="heart-card pop-in" id="card">
          <span class="heart">❤️</span>
          <span class="heart-word">${word}</span>
        </button>
        <p class="game-prompt" id="quiz-prompt"></p>
        <div class="pick-row" id="quiz"></div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(onBack));
    const dots = dotsRow(stage.tricky.length);
    dots.set(i);
    node.querySelector(".dots-holder").appendChild(dots.node);
    setScreen(node, "screen-game");

    const card = node.querySelector("#card");
    card.addEventListener("click", () => {
      AudioEngine.sfx.ding();
      AudioEngine.speak(word, { rate: 0.7 });
    });

    (async () => {
      await AudioEngine.speak(`This word is: ${word}. It's a heart word — we just remember it! Say it with me: ${word}.`, { rate: 0.8 });
      await wait(400);
      // Mini quiz: find the word among others
      const others = shuffle(
        STAGES.flatMap(s => s.tricky).filter(w => w.toLowerCase() !== word.toLowerCase())
      ).slice(0, 2);
      node.querySelector("#quiz-prompt").textContent = `Now tap the word "${word}"!`;
      AudioEngine.speak(`Now, tap the word: ${word}!`);
      const quiz = node.querySelector("#quiz");
      shuffle([word, ...others]).forEach(w => {
        const b = el(`<button class="pick-card pick-word">${w}</button>`);
        b.addEventListener("click", async () => {
          if (w === word) {
            b.classList.add("right");
            AudioEngine.sfx.correct();
            await AudioEngine.speak(`Yes! ${word}!`);
            i++;
            if (i < stage.tricky.length) showCard();
            else onDone();
          } else {
            b.classList.add("wiggle");
            AudioEngine.sfx.wrong();
            AudioEngine.speak(encourage());
            setTimeout(() => b.classList.remove("wiggle"), 500);
          }
        });
        quiz.appendChild(b);
      });
    })();
  }
  showCard();
}

/* =====================================================================
   ACTIVITY 5: Read It! — read a sentence, then pick the matching picture
   ===================================================================== */
function playRead(stage, onBack, onDone) {
  let round = 0;

  function showRound() {
    const [sentence, correct, distractors] = stage.sentences[round];
    const words = sentence.split(" ");
    const tapped = new Set();

    const node = el(`
      <div class="game" style="--c:${stage.color}">
        <header class="bar"><div class="dots-holder"></div></header>
        <p class="game-prompt">Tap each word to hear it. Then read it out loud!</p>
        <div class="sentence-row" id="sentence"></div>
        <button class="btn-big hidden" id="btn-readme">🔊 Read with me</button>
        <p class="game-prompt hidden" id="pick-prompt">Which picture matches? Tap it!</p>
        <div class="pick-row hidden" id="pick"></div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(onBack));
    const dots = dotsRow(stage.sentences.length);
    dots.set(round);
    node.querySelector(".dots-holder").appendChild(dots.node);
    setScreen(node, "screen-game");

    const sentEl = node.querySelector("#sentence");
    const wordEls = words.map((w, wi) => {
      const b = el(`<button class="word-chip">${w}</button>`);
      b.addEventListener("click", async () => {
        b.classList.add("lit");
        AudioEngine.speak(w.replace(/[.,!?]/g, ""), { rate: 0.75 });
        tapped.add(wi);
        if (tapped.size === words.length) {
          node.querySelector("#btn-readme").classList.remove("hidden");
        }
      });
      sentEl.appendChild(b);
      return b;
    });
    AudioEngine.speak("Tap each word to hear it!");

    node.querySelector("#btn-readme").addEventListener("click", async e => {
      e.target.disabled = true;
      for (let wi = 0; wi < words.length; wi++) {
        wordEls[wi].classList.add("reading");
        await AudioEngine.speak(words[wi].replace(/[.,!?]/g, ""), { rate: 0.75, interrupt: false });
        wordEls[wi].classList.remove("reading");
      }
      await AudioEngine.speak(sentence, { rate: 0.85 });
      e.target.disabled = false;
      const pick = node.querySelector("#pick");
      if (pick.children.length) return; // already shown
      node.querySelector("#pick-prompt").classList.remove("hidden");
      pick.classList.remove("hidden");
      AudioEngine.speak("Which picture matches? Tap it!");
      shuffle([correct, ...distractors]).forEach(em => {
        const b = el(`<button class="pick-card">${em}</button>`);
        b.addEventListener("click", async () => {
          if (em === correct) {
            b.classList.add("right");
            AudioEngine.sfx.correct();
            Confetti.burst(40);
            await AudioEngine.speak(`Yes! ${sentence} ${praise()}`);
            round++;
            if (round < stage.sentences.length) showRound();
            else onDone();
          } else {
            b.classList.add("wiggle");
            AudioEngine.sfx.wrong();
            AudioEngine.speak(encourage());
            setTimeout(() => b.classList.remove("wiggle"), 500);
          }
        });
        pick.appendChild(b);
      });
    });
  }
  showRound();
}

/* =====================================================================
   ACTIVITY 6: My Book — a decodable mini-book
   ===================================================================== */
function playBook(stage, onBack, onDone) {
  const book = stage.book;
  let page = -1; // -1 = cover

  function showPage() {
    const isCover = page === -1;
    const [text, scene] = isCover ? [book.title, book.cover] : book.pages[page];
    const node = el(`
      <div class="book" style="--c:${stage.color}">
        <header class="bar">
          <span class="book-progress">${isCover ? "" : `Page ${page + 1} of ${book.pages.length}`}</span>
        </header>
        <div class="book-page ${isCover ? "book-cover" : ""}">
          <div class="book-scene">${scene}</div>
          <div class="book-text" id="book-text"></div>
        </div>
        <div class="book-controls">
          <button class="btn-round" id="btn-hear" aria-label="Read to me">🔊</button>
          <button class="btn-big" id="btn-turn">${isCover ? "Open the book 📖" : (page === book.pages.length - 1 ? "The End! 🎉" : "Turn the page ➜")}</button>
        </div>
      </div>`);
    node.querySelector(".bar").prepend(backButton(onBack));
    setScreen(node, "screen-book");

    const textEl = node.querySelector("#book-text");
    if (isCover) {
      textEl.innerHTML = `<span class="book-title">${book.title}</span>`;
      AudioEngine.speak(`${book.title}. A book just for you! Tap, to open it.`);
    } else {
      text.split(" ").forEach(w => {
        const b = el(`<button class="word-chip">${w}</button>`);
        b.addEventListener("click", () => {
          b.classList.add("lit");
          AudioEngine.speak(w.replace(/[.,!?]/g, ""), { rate: 0.75 });
        });
        textEl.appendChild(b);
      });
    }

    node.querySelector("#btn-hear").addEventListener("click", async () => {
      if (isCover) return AudioEngine.speak(book.title);
      const chips = [...textEl.children];
      for (let wi = 0; wi < chips.length; wi++) {
        chips[wi].classList.add("reading");
        await AudioEngine.speak(chips[wi].textContent.replace(/[.,!?]/g, ""), { rate: 0.75, interrupt: false });
        chips[wi].classList.remove("reading");
      }
      AudioEngine.speak(text, { rate: 0.85 });
    });

    node.querySelector("#btn-turn").addEventListener("click", () => {
      AudioEngine.sfx.pageTurn();
      page++;
      if (page < book.pages.length) showPage();
      else onDone();
    });
  }
  showPage();
}

/* =====================================================================
   SCREEN: Sticker gallery
   ===================================================================== */
function showStickers() {
  const owned = Progress.data.stickers;
  const node = el(`
    <div class="stickers">
      <header class="bar"><h2>🌟 My Sticker Book</h2></header>
      <p class="subtitle">${owned.length ? `You have ${owned.length} sticker${owned.length > 1 ? "s" : ""}!` : "Finish games to win stickers!"}</p>
      <div class="sticker-grid"></div>
    </div>`);
  node.querySelector(".bar").prepend(backButton(showHome));
  const grid = node.querySelector(".sticker-grid");
  STICKERS.forEach(s => {
    const got = owned.includes(s);
    const cell = el(`<div class="sticker-cell ${got ? "got pop-in" : ""}">${got ? s : "❔"}</div>`);
    if (got) cell.addEventListener("click", () => { AudioEngine.sfx.ding(); cell.classList.add("bounce-once"); setTimeout(() => cell.classList.remove("bounce-once"), 600); });
    grid.appendChild(cell);
  });
  setScreen(node, "screen-stickers");
}

/* =====================================================================
   SCREEN: Grown-ups corner (hold to open — a simple parent gate)
   ===================================================================== */
function showParents() {
  const gate = el(`
    <div class="parents">
      <header class="bar"><h2>👪 For grown-ups</h2></header>
      <div class="parent-card">
        <p>Press and <b>hold the button for 3 seconds</b> to open.</p>
        <button class="btn-big" id="hold-btn">Hold me…</button>
      </div>
    </div>`);
  gate.querySelector(".bar").prepend(backButton(showHome));
  setScreen(gate, "screen-parents");

  const btn = gate.querySelector("#hold-btn");
  let timer = null;
  const start = () => {
    btn.textContent = "Keep holding…";
    timer = setTimeout(showParentsContent, 3000);
  };
  const cancel = () => {
    btn.textContent = "Hold me…";
    clearTimeout(timer);
  };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", cancel);
  btn.addEventListener("pointerleave", cancel);
}

function showParentsContent() {
  const node = el(`
    <div class="parents">
      <header class="bar"><h2>👪 For grown-ups</h2></header>
      <div class="parent-card parent-text">
        <h3>How this app teaches reading</h3>
        <p>Pip's Reading Adventure follows the <b>Science of Reading</b>: decades of research
        (including the National Reading Panel and more recent studies) showing that children
        learn to read best with <b>explicit, systematic phonics</b> — being taught letter–sound
        relationships in a planned order and practising by <b>sounding out and blending</b> real words.</p>
        <ul>
          <li><b>Systematic progression:</b> 6 levels introduce letter-sounds in a research-based
          order (s, a, t, p, i, n first — they build many words quickly), then digraphs
          (sh, ch, th, ng) and vowel teams (ai, ee, oa, oo, magic&nbsp;e).</li>
          <li><b>Decodable text:</b> every word your child reads uses only sounds already
          taught, plus a few "heart words" (the, said, one…) that are learned by sight.
          This builds confidence and real decoding skill instead of guessing.</li>
          <li><b>Blending &amp; segmenting:</b> the core skills of phonemic awareness — pushing
          sounds together (b-u-s → bus) and breaking words apart — are practised in every level.</li>
          <li><b>Immediate feedback &amp; rewards:</b> gentle corrections, stars, stickers and
          confetti keep motivation high. Sessions are short by design — 10–15 minutes a day
          beats one long weekly session.</li>
          <li><b>From words to books:</b> each level ends with a real decodable mini-book, the
          bridge to reading full books independently.</li>
        </ul>
        <h3>Tips for best results</h3>
        <ul>
          <li>Sit with your child and <b>echo the pure sounds</b>: say "sss" not "suh", "t" not "tuh".
          The app's voice is a computer voice, so your model matters!</li>
          <li>Ask your child to run a finger under words as they blend.</li>
          <li>Re-read the mini-books — re-reading builds fluency and is great fun.</li>
          <li>Keep reading aloud to your child every day; the app builds decoding,
          and your shared reading builds vocabulary and a love of stories.</li>
        </ul>
        <h3>Progress</h3>
        <p id="progress-summary"></p>
        <button class="btn-chip" id="btn-reset">Reset all progress</button>
      </div>
    </div>`);
  node.querySelector(".bar").prepend(backButton(showHome));
  setScreen(node, "screen-parents");

  const doneCount = STAGES.reduce((n, s) => n + Progress.stars(s.id), 0);
  node.querySelector("#progress-summary").textContent =
    `${doneCount} of ${STAGES.length * ACTIVITIES.length} activities completed, ` +
    `${Progress.data.stickers.length} stickers earned.`;

  node.querySelector("#btn-reset").addEventListener("click", () => {
    if (confirm("Reset all progress and stickers?")) {
      localStorage.removeItem(Progress.KEY);
      Progress.load();
      showHome();
    }
  });
}

/* =====================================================================
   SCREEN: Welcome — first tap unlocks audio (iOS requirement)
   ===================================================================== */
function showWelcome() {
  const node = el(`
    <div class="welcome">
      <div class="mascot mascot-big bounce">🦊</div>
      <h1>Pip's Reading Adventure</h1>
      <p class="subtitle">Learn to read with Pip the fox!</p>
      <button class="btn-big btn-start">▶ Let's play!</button>
    </div>`);
  node.querySelector(".btn-start").addEventListener("click", () => {
    AudioEngine.unlock();
    AudioEngine.sfx.fanfare();
    AudioEngine.speak("Hi! I'm Pip! Let's learn to read!");
    showHome();
  });
  setScreen(node, "screen-welcome");
}

/* ------------------------------- Boot -------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  Confetti.init();
  showWelcome();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
