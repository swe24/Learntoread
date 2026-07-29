/* =====================================================================
   Pip's Reading Adventure — Curriculum data
   Based on systematic synthetic phonics (Science of Reading):
   - Explicit grapheme–phoneme correspondences taught in a set order
     (progression modelled on Letters & Sounds phases 2–5)
   - Only decodable words/sentences using taught GPCs + taught tricky words
   - Tricky ("heart") words taught by sight, a few per stage
   ===================================================================== */

// How each grapheme is spoken by the speech synthesiser.
// Spellings must be ones the TTS reads as a sound, never as letter names:
// letter-runs like "nnn" get spelled out ("en en en"), so consonants use a
// short syllable instead. "sss"/"mmm"/"shh" are real interjections and hum
// or hiss correctly.
const PHONEME_TTS = {
  s: "sss", a: "ah", t: "tuh", p: "puh", i: "ih", n: "nuh",
  m: "mmm", d: "duh", g: "guh", o: "oh", c: "kuh", k: "kuh",
  e: "eh", u: "uh", r: "ruh", h: "huh", b: "buh", f: "fuh", l: "luh",
  j: "juh", v: "vuh", w: "wuh", x: "eks", y: "yuh", z: "zuh",
  sh: "shh", ch: "chuh", th: "thuh", ng: "ing", qu: "kwuh",
  ck: "kuh", ll: "luh", ss: "sss", ff: "fuh", zz: "zuh",
  ai: "ay", ee: "ee", oa: "oh", oo: "oo",
  a_e: "ay", i_e: "eye", o_e: "oh",
};

// Display form of a grapheme tile
function graphemeLabel(g) {
  if (g.includes("_")) return g.replace("_", "-"); // a_e -> a-e (magic e)
  return g;
}

// Lesson content for every grapheme: sound cue + example words.
// Cues are read aloud by the TTS, so they avoid stretched letter-runs
// ("Nnnn") that a synthesiser would spell out as letter names.
const SOUNDS = {
  s:  { cue: "Stretch it out, like a sneaky snake hissing!", words: [["sun","☀️"],["sock","🧦"],["star","⭐"]] },
  a:  { cue: "Like biting a big crunchy apple!",             words: [["apple","🍎"],["ant","🐜"],["alligator","🐊"]] },
  t:  { cue: "A quick tapping sound, like a ticking clock!", words: [["tiger","🐯"],["tent","⛺"],["turtle","🐢"]] },
  p:  { cue: "A little puff of air, like popping bubbles!",  words: [["pig","🐷"],["pan","🍳"],["penguin","🐧"]] },
  i:  { cue: "Like a wiggly little insect!",                 words: [["insect","🐞"],["iguana","🦎"],["ink","🖋️"]] },
  n:  { cue: "A hummy nose sound, like a noisy engine!",     words: [["nest","🪺"],["net","🥅"],["nose","👃"]] },
  m:  { cue: "Press your lips together. Yummy yummy!",       words: [["moon","🌙"],["mouse","🐭"],["milk","🥛"]] },
  d:  { cue: "Tap your tongue, like a drum!",                words: [["dog","🐶"],["duck","🦆"],["drum","🥁"]] },
  g:  { cue: "Deep in your throat, like gulping juice!",     words: [["goat","🐐"],["gift","🎁"],["grapes","🍇"]] },
  o:  { cue: "Make your lips round, like an octopus!",       words: [["octopus","🐙"],["orange","🍊"],["ox","🐂"]] },
  c:  { cue: "Like a clicking camera!",                      words: [["cat","🐱"],["cup","☕"],["car","🚗"]] },
  k:  { cue: "It makes the same sound as c!",                words: [["kite","🪁"],["key","🔑"],["koala","🐨"]] },
  e:  { cue: "Like cracking open an egg!",                   words: [["egg","🥚"],["elephant","🐘"],["envelope","✉️"]] },
  u:  { cue: "Like going up, up, up!",                       words: [["umbrella","☂️"],["up","⬆️"],["under","⬇️"]] },
  r:  { cue: "Like a roaring racing car!",                   words: [["rabbit","🐰"],["rainbow","🌈"],["robot","🤖"]] },
  h:  { cue: "A breathy sound, like a panting puppy!",       words: [["hat","🎩"],["horse","🐴"],["house","🏠"]] },
  b:  { cue: "Like a bouncing ball!",                        words: [["ball","⚽"],["bear","🐻"],["banana","🍌"]] },
  f:  { cue: "Teeth on your lip, like a fizzy drink!",       words: [["fish","🐟"],["frog","🐸"],["fire","🔥"]] },
  l:  { cue: "Sing it, like licking a lolly!",               words: [["lion","🦁"],["leaf","🍃"],["lemon","🍋"]] },
  j:  { cue: "Like jiggly jelly on a plate!",                words: [["jam","🍓"],["jet","✈️"],["jellyfish","🪼"]] },
  v:  { cue: "Buzzy teeth, like a vrooming van!",            words: [["van","🚐"],["violin","🎻"],["volcano","🌋"]] },
  w:  { cue: "Make your lips round, like whooshing wind!",   words: [["whale","🐳"],["watch","⌚"],["web","🕸️"]] },
  x:  { cue: "It hides at the end of words, like fox and box!", words: [["box","📦"],["fox","🦊"],["six","6️⃣"]] },
  y:  { cue: "Like a yo-yo going up and down!",              words: [["yo-yo","🪀"],["yawn","🥱"],["yolk","🍳"]] },
  z:  { cue: "A buzzy sound, like a bee!",                   words: [["zebra","🦓"],["zip","🤐"],["zig-zag","⚡"]] },
  sh: { cue: "Finger on your lips. Hush, the baby is asleep!", words: [["ship","🚢"],["shell","🐚"],["sheep","🐑"]] },
  ch: { cue: "Like a chugging choo-choo train!",             words: [["cheese","🧀"],["chick","🐤"],["chair","🪑"]] },
  th: { cue: "Poke your tongue between your teeth!",         words: [["thumb","👍"],["three","3️⃣"],["bath","🛁"]] },
  ng: { cue: "Sing it in your nose!",                        words: [["ring","💍"],["king","👑"],["wing","🪽"]] },
  qu: { cue: "Two letters, one sound. Quack quack!",         words: [["queen","👸"],["question","❓"],["quack","🦆"]] },
  ck: { cue: "Two letters, one sound, like at the end of duck!", words: [["duck","🦆"],["sock","🧦"],["clock","🕐"]] },
  ll: { cue: "Double letters make just one sound!",          words: [["bell","🔔"],["doll","🪆"],["hill","⛰️"]] },
  ss: { cue: "Double letters make just one sound!",          words: [["kiss","💋"],["dress","👗"],["grass","🌱"]] },
  ff: { cue: "Double letters make just one sound!",          words: [["puff","💨"],["cliff","🪨"],["off","📴"]] },
  zz: { cue: "Double letters make just one sound!",          words: [["buzz","🐝"],["fizz","🥤"],["jazz","🎷"]] },
  ai: { cue: "Two letters hold hands and say one sound, like in rain!", words: [["rain","🌧️"],["snail","🐌"],["train","🚂"]] },
  ee: { cue: "Two letters hold hands and say one sound, like in bee!",  words: [["bee","🐝"],["tree","🌳"],["feet","🦶"]] },
  oa: { cue: "Two letters hold hands and say one sound, like in boat!", words: [["boat","⛵"],["goat","🐐"],["road","🛣️"]] },
  oo: { cue: "Two letters hold hands and say one sound, like in moon!", words: [["moon","🌙"],["boot","🥾"],["spoon","🥄"]] },
  a_e:{ cue: "Magic e makes a say its name, like in cake!",  words: [["cake","🎂"],["snake","🐍"],["gate","🚧"]] },
  i_e:{ cue: "Magic e makes i say its name, like in bike!",  words: [["bike","🚲"],["kite","🪁"],["five","5️⃣"]] },
  o_e:{ cue: "Magic e makes o say its name, like in nose!",  words: [["nose","👃"],["rope","🪢"],["bone","🦴"]] },
};

/* Each stage:
   graphemes   — new letter-sounds taught in this stage (video lessons)
   tricky      — heart words for this stage
   blend       — [word, [graphemes], correct emoji, [2 distractor emojis]]
   build       — [word, [graphemes], emoji, [distractor graphemes]]
   sentences   — [sentence, correct picture, [2 distractor pictures]]
   book        — { title, cover, pages: [[sentence, scene emoji], ...] }
*/
const STAGES = [
  {
    id: "s1", name: "Sunny Start", icon: "☀️", color: "#f59e0b",
    graphemes: ["s","a","t","p","i","n"],
    tricky: ["I","a","is","the"],
    blend: [
      ["sit", ["s","i","t"], "🪑", ["🐶","🍌"]],
      ["pin", ["p","i","n"], "📌", ["🍎","🚗"]],
      ["tap", ["t","a","p"], "🚰", ["🐱","⭐"]],
      ["nap", ["n","a","p"], "😴", ["⚽","🍕"]],
      ["sip", ["s","i","p"], "🥤", ["🎩","🐸"]],
    ],
    build: [
      ["ant", ["a","n","t"], "🐜", ["s","p"]],
      ["tin", ["t","i","n"], "🥫", ["a","s"]],
      ["pit", ["p","i","t"], "🕳️", ["n","a"]],
      ["pan", ["p","a","n"], "🍳", ["t","i"]],
    ],
    sentences: [
      ["I sit.", "🧒🪑", ["🐶🦴","🌧️☂️"]],
      ["I sip it.", "🧒🥤", ["🐱🐟","✈️☁️"]],
      ["A pin is in a tin.", "📌🥫", ["🍎🧺","🐸🌿"]],
      ["Pip naps.", "🦊😴", ["🦊🏃","🐔🥚"]],
      ["Pat sat in a pit.", "🧒🕳️", ["🧒🚲","🐶🛁"]],
    ],
    book: {
      title: "Pip!", cover: "🦊",
      pages: [
        ["Pip sits.", "🦊🪑"],
        ["Pip sips.", "🦊🥤"],
        ["Pip taps a tin.", "🦊🥫"],
        ["Pip tips the tin!", "🦊💥"],
        ["Pip naps.", "🦊😴💤"],
      ],
    },
  },
  {
    id: "s2", name: "Muddy Paws", icon: "🐾", color: "#84cc16",
    graphemes: ["m","d","g","o","c","k"],
    tricky: ["to","no","go","into"],
    blend: [
      ["dog", ["d","o","g"], "🐶", ["🐱","🍰"]],
      ["cat", ["c","a","t"], "🐱", ["🐶","🌵"]],
      ["map", ["m","a","p"], "🗺️", ["🧢","🥁"]],
      ["cap", ["c","a","p"], "🧢", ["👑","🗺️"]],
      ["kid", ["k","i","d"], "🧒", ["🐐","🤖"]],
    ],
    build: [
      ["mop", ["m","o","p"], "🧹", ["d","k"]],
      ["pot", ["p","o","t"], "🍲", ["c","m"]],
      ["dad", ["d","a","d"], "👨", ["g","o"]],
      ["dig", ["d","i","g"], "⛏️", ["c","a"]],
    ],
    sentences: [
      ["The cat sat on the mat.", "🐱🟫", ["🐶🦴","👑🏰"]],
      ["The dog dug a pit.", "🐶🕳️", ["🐱🥛","🚂💨"]],
      ["I got a map.", "🧒🗺️", ["🧒🎈","🐟🌊"]],
      ["Mum is mad at the cat.", "👩😠🐱", ["👩😀🐶","🧒😴🛏️"]],
      ["Go in, dog!", "🐶🚪", ["🐱🌳","🦆💦"]],
    ],
    book: {
      title: "The Dog and the Cat", cover: "🐶🐱",
      pages: [
        ["The dog dug and dug.", "🐶🕳️"],
        ["The cat sat on the mat.", "🐱🟫"],
        ["The dog got the mat!", "🐶🟫💨"],
        ["The cat is mad.", "😾"],
        ["The dog and the cat nap.", "🐶🐱💤"],
      ],
    },
  },
  {
    id: "s3", name: "Fun in the Sun", icon: "🌈", color: "#06b6d4",
    graphemes: ["e","u","r","h","b","f","l"],
    tricky: ["he","she","we","me","be"],
    blend: [
      ["sun", ["s","u","n"], "☀️", ["🌙","🌧️"]],
      ["bed", ["b","e","d"], "🛏️", ["🚌","🎩"]],
      ["bus", ["b","u","s"], "🚌", ["🚲","🛏️"]],
      ["cup", ["c","u","p"], "☕", ["🥄","🔔"]],
      ["hat", ["h","a","t"], "🎩", ["🧦","🐔"]],
    ],
    build: [
      ["hen", ["h","e","n"], "🐔", ["b","u"]],
      ["leg", ["l","e","g"], "🦵", ["r","f"]],
      ["red", ["r","e","d"], "🔴", ["l","b"]],
      ["fan", ["f","a","n"], "🪭", ["h","e"]],
    ],
    sentences: [
      ["The hen is in a pen.", "🐔🏠", ["🐶🕳️","☀️🌊"]],
      ["He fed the red hen.", "🧒🐔", ["🧒🐶","👩🐱"]],
      ["A bug is on the rug.", "🐛🟥", ["🐝🌸","🐟🌊"]],
      ["She runs in the sun.", "🏃☀️", ["😴🌙","🏊🌊"]],
      ["We sit on the bus.", "🧒🧒🚌", ["🧒🚲","👨✈️"]],
    ],
    book: {
      title: "The Hen and the Bug", cover: "🐔🐛",
      pages: [
        ["A hen sat on a log.", "🐔🪵"],
        ["A bug is on the log.", "🐛🪵"],
        ["The hen met the bug.", "🐔🐛"],
        ["The bug and the hen run.", "🐔🐛💨"],
        ["Fun in the sun!", "🐔🐛☀️"],
      ],
    },
  },
  {
    id: "s4", name: "Zig-Zag Zoo", icon: "🦓", color: "#a855f7",
    graphemes: ["j","v","w","x","y","z","ck","ll","ss","ff","zz"],
    tricky: ["you","they","my","was","are"],
    blend: [
      ["fox", ["f","o","x"], "🦊", ["📦","🐝"]],
      ["box", ["b","o","x"], "📦", ["🦊","🔔"]],
      ["van", ["v","a","n"], "🚐", ["✈️","🕸️"]],
      ["web", ["w","e","b"], "🕸️", ["🚐","🧦"]],
      ["sock", ["s","o","ck"], "🧦", ["👟","🧤"]],
    ],
    build: [
      ["jet", ["j","e","t"], "✈️", ["v","w"]],
      ["six", ["s","i","x"], "6️⃣", ["z","y"]],
      ["yak", ["y","a","k"], "🐃", ["j","x"]],
      ["bell", ["b","e","ll"], "🔔", ["ss","f"]],
    ],
    sentences: [
      ["The fox is in the box.", "🦊📦", ["🐶🛏️","🐝🌸"]],
      ["A bug can buzz.", "🐝💨", ["🐟🌊","🐔🥚"]],
      ["My cat has a bell.", "🐱🔔", ["🐶🧦","🐭🧀"]],
      ["The jet zips up.", "✈️⬆️", ["🚌🛣️","⛵🌊"]],
      ["They run to the van.", "🧒🧒🚐", ["🧒😴🛏️","👩🚲"]],
    ],
    book: {
      title: "The Fox and the Box", cover: "🦊📦",
      pages: [
        ["A fox got a big box.", "🦊📦"],
        ["Is a bug in the box? No!", "🐛❌"],
        ["Is a sock in the box? Yes!", "🧦✅"],
        ["The fox naps in the box.", "🦊📦💤"],
        ["A fox in a box!", "🦊📦🎉"],
      ],
    },
  },
  {
    id: "s5", name: "Ship Ahoy!", icon: "🚢", color: "#3b82f6",
    graphemes: ["sh","ch","th","ng","qu"],
    tricky: ["said","have","like","so","do"],
    blend: [
      ["ship", ["sh","i","p"], "🚢", ["⛵","🐟"]],
      ["chick", ["ch","i","ck"], "🐤", ["🐔","🦆"]],
      ["ring", ["r","i","ng"], "💍", ["👑","🔔"]],
      ["fish", ["f","i","sh"], "🐟", ["🐸","🚢"]],
      ["king", ["k","i","ng"], "👑", ["💍","👸"]],
    ],
    build: [
      ["shop", ["sh","o","p"], "🏪", ["ch","t"]],
      ["bath", ["b","a","th"], "🛁", ["sh","d"]],
      ["chip", ["ch","i","p"], "🍟", ["sh","g"]],
      ["wing", ["w","i","ng"], "🪽", ["qu","th"]],
    ],
    sentences: [
      ["The fish is in the ship.", "🚢🐟", ["🐤🪺","👑🏰"]],
      ["The king can sing a song.", "👑🎤", ["👸📚","🐟🌊"]],
      ["A moth is in the bath.", "🛁🦋", ["🐝🌸","🐤🥚"]],
      ["I like fish and chips.", "🐟🍟", ["🍎🍌","🧀🍞"]],
      ["The queen said thank you.", "👸💬", ["👑😴","🧒🏃"]],
    ],
    book: {
      title: "The King and the Fish", cover: "👑🐟",
      pages: [
        ["The king has a big ship.", "👑🚢"],
        ["A fish swims with the ship.", "🐟🚢"],
        ["The king sings to the fish.", "👑🎤"],
        ["The fish did a flip!", "🐟🤸"],
        ["The king and the fish are chums.", "👑🐟💛"],
      ],
    },
  },
  {
    id: "s6", name: "Moonlight Magic", icon: "🌙", color: "#ec4899",
    graphemes: ["ai","ee","oa","oo","a_e","i_e","o_e"],
    tricky: ["little","one","when","out","what"],
    blend: [
      ["rain", ["r","ai","n"], "🌧️", ["☀️","❄️"]],
      ["boat", ["b","oa","t"], "⛵", ["🚂","🌧️"]],
      ["moon", ["m","oo","n"], "🌙", ["⭐","☀️"]],
      ["tree", ["t","r","ee"], "🌳", ["🌷","🍄"]],
      ["bee", ["b","ee"], "🐝", ["🐛","🦋"]],
    ],
    build: [
      ["feet", ["f","ee","t"], "🦶", ["oa","m"]],
      ["road", ["r","oa","d"], "🛣️", ["ee","b"]],
      ["boot", ["b","oo","t"], "🥾", ["ai","s"]],
      ["snail", ["s","n","ai","l"], "🐌", ["oo","t"]],
    ],
    sentences: [
      ["The sheep sit in the rain.", "🐑🌧️", ["🐐☀️","🐝🌸"]],
      ["I ride my bike up the road.", "🚲🛣️", ["⛵🌊","🚂🌉"]],
      ["We see the boat and the moon.", "⛵🌙", ["🚗☀️","🏠🌈"]],
      ["A little bee is in the tree.", "🐝🌳", ["🐛🟥","🐟🌊"]],
      ["We make a cake at home.", "🎂🏠", ["🍕🏪","🥗🌳"]],
    ],
    book: {
      title: "The Boat Ride", cover: "⛵",
      pages: [
        ["We sail on a boat.", "⛵🌊"],
        ["The rain came down!", "🌧️⛵"],
        ["We got wet.", "💦🧒"],
        ["Then the sun came out.", "☀️🌈"],
        ["We ride home on the road.", "🚗🛣️"],
        ["What a fine trip!", "🧒🧒🎉"],
      ],
    },
  },
];

// Activities shown for each stage, in teaching order
const ACTIVITIES = [
  { key: "video",  name: "Sound Videos", icon: "🎬", desc: "Watch and say the new sounds" },
  { key: "blend",  name: "Blend It!",    icon: "🧩", desc: "Push sounds together to make words" },
  { key: "build",  name: "Word Builder", icon: "🔤", desc: "Build words from letter tiles" },
  { key: "tricky", name: "Heart Words",  icon: "❤️", desc: "Words we learn by heart" },
  { key: "read",   name: "Read It!",     icon: "📖", desc: "Read real sentences" },
  { key: "book",   name: "My Book",      icon: "📚", desc: "Read a whole little book!" },
];

const STICKERS = ["🦊","🐶","🐱","🐔","🐛","🦓","🚢","👑","🌙","⭐","🌈","🐝","🎂","⛵","🐌","🦉","🐬","🦄"];
