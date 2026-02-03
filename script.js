/* ===================================================
   INSTAGRAM BIO GENERATOR — script.js
   =================================================== */

/* ─── SHARED DOM REFS ──────────────────────────────── */
const toast = document.getElementById('toast');
var toastTimer = null;

function showToast() {
  toast.classList.add('toast--visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('toast--visible');
  }, 2200);
}

/* Helper: copy string to clipboard (modern + fallback) */
function copyToClipboard(text, callback) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(callback);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (callback) callback();
  }
}

/* Helper: capitalise first letter */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─────────────────────────────────────────────────────
   HERO SECTION — letter-by-letter name animation
   ───────────────────────────────────────────────────── */
(function () {
  var heroName     = document.getElementById('heroName');
  var heroCursor   = document.getElementById('heroCursor');
  var heroSubtitle = document.querySelector('.hero__subtitle');
  var heroSocials  = document.querySelector('.hero__socials');

  var NAME          = 'Lalit';
  var DELAY_START   = 520;   // ms — wait for greeting fade-in before first letter
  var LETTER_GAP    = 200;   // ms between each letter appearing
  var LETTER_DUR    = 450;   // ms — CSS animation duration per letter
  var CURSOR_SHOW   = 300;   // ms — cursor appears this long before letters start
  var CURSOR_HIDE   = 600;   // ms — cursor lingers this long after last letter

  // 1. Show cursor first (it blinks while letters appear)
  setTimeout(function () {
    heroCursor.classList.add('hero__cursor--visible');
  }, DELAY_START - CURSOR_SHOW);

  // 2. Inject each letter as its own <span> BEFORE the cursor (cursor is last child of heroName)
  var cursorEl = heroName.querySelector('.hero__cursor');  // already in DOM from HTML
  NAME.split('').forEach(function (char, i) {
    var span       = document.createElement('span');
    span.className = 'hero__letter';
    span.textContent = char;
    // inline custom properties drive the CSS animation
    span.style.setProperty('--delay', (DELAY_START + i * LETTER_GAP) / 1000 + 's');
    span.style.setProperty('--dur',   LETTER_DUR / 1000 + 's');
    heroName.insertBefore(span, cursorEl);   // insert before cursor so cursor stays at the end
  });

  // 3. After the last letter finishes, reveal subtitle & socials, then hide cursor
  var totalNameTime = DELAY_START + (NAME.length - 1) * LETTER_GAP + LETTER_DUR;

  setTimeout(function () {
    // fade in subtitle
    heroSubtitle.classList.add('hero__subtitle--visible');
  }, totalNameTime + 120);

  setTimeout(function () {
    // fade in social icons (slightly after subtitle)
    heroSocials.classList.add('hero__socials--visible');
  }, totalNameTime + 280);

  setTimeout(function () {
    heroCursor.classList.add('hero__cursor--hidden');
  }, totalNameTime + CURSOR_HIDE);
})();

/* ─────────────────────────────────────────────────────
   SECTION 1 — CUSTOM BIO GENERATOR  (original logic)
   ───────────────────────────────────────────────────── */
const nameInput       = document.getElementById('name');
const professionInput = document.getElementById('profession');
const skillsInput     = document.getElementById('skills');
const styleSelect     = document.getElementById('style');
const generateBtn     = document.getElementById('generateBtn');
const outputSection   = document.getElementById('outputSection');
const previewName     = document.getElementById('previewName');
const previewBio      = document.getElementById('previewBio');
const avatarLetter    = document.getElementById('avatarLetter');
const copyBtn         = document.getElementById('copyBtn');
const copyIcon        = document.getElementById('copyIcon');

// Hide output on page load
outputSection.style.display = 'none';

// --- Bio template generators ---
var bioGenerators = {
  cool: function (data) {
    var skillLine = data.skills.join(' · ');
    return (
      '😎 ' + data.name.toUpperCase() + '\n' +
      '━━━━━━━━━━━━━━━\n' +
      data.profession + ' by day\n' +
      '🌙 dreamer by night\n' +
      '━━━━━━━━━━━━━━━\n' +
      '⚡ ' + skillLine + '\n' +
      '🔥 let\'s build something insane\n' +
      '📍 Earth, but make it aesthetic'
    );
  },
  professional: function (data) {
    var skillLine = data.skills.map(function (s) { return '• ' + s; }).join('\n');
    return (
      '👤 ' + data.name + '\n' +
      '💼 ' + data.profession + '\n' +
      '━━━━━━━━━━━━━━━\n' +
      'Skills & Expertise:\n' +
      skillLine + '\n' +
      '━━━━━━━━━━━━━━━\n' +
      '💡 Passionate about delivering results.\n' +
      '📧 DM to collaborate.'
    );
  },
  fun: function (data) {
    var skillLine = data.skills.join(' ✨ ');
    return (
      '🌟 ' + data.name + ' 🌟\n' +
      '━━━━━━━━━━━━━━━\n' +
      data.profession + ' 🎯\n' +
      '━━━━━━━━━━━━━━━\n' +
      '✨ ' + skillLine + ' ✨\n' +
      '🍕 coffee addict\n' +
      '🎶 vibes curator\n' +
      '🤝 collab > competition\n' +
      '👋 say hi, don\'t be shy!'
    );
  }
};

function parseSkills(raw) {
  return raw.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
}

// Generate button
generateBtn.addEventListener('click', function () {
  var name       = nameInput.value.trim();
  var profession = professionInput.value.trim();
  var skills     = parseSkills(skillsInput.value);
  var style      = styleSelect.value;

  // Validation
  if (!name) {
    nameInput.focus();
    nameInput.style.borderColor = '#e6683c';
    setTimeout(function () { nameInput.style.borderColor = ''; }, 1400);
    return;
  }
  if (!profession) {
    professionInput.focus();
    professionInput.style.borderColor = '#e6683c';
    setTimeout(function () { professionInput.style.borderColor = ''; }, 1400);
    return;
  }
  if (skills.length === 0) {
    skillsInput.focus();
    skillsInput.style.borderColor = '#e6683c';
    setTimeout(function () { skillsInput.style.borderColor = ''; }, 1400);
    return;
  }

  var bio = bioGenerators[style]({
    name:       capitalize(name),
    profession: capitalize(profession),
    skills:     skills.map(capitalize)
  });

  previewName.textContent    = capitalize(name);
  previewBio.textContent     = bio;
  avatarLetter.textContent   = name.charAt(0).toUpperCase();
  outputSection.style.display = 'block';

  setTimeout(function () {
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 160);
});

// Copy generated bio
copyBtn.addEventListener('click', function () {
  var text = previewBio.textContent;
  if (!text) return;
  copyToClipboard(text, function () {
    copyIcon.textContent = '✓';
    setTimeout(function () { copyIcon.textContent = '📋'; }, 1200);
    showToast();
  });
});

// Live name preview
nameInput.addEventListener('input', function () {
  var val = nameInput.value.trim();
  if (val) {
    previewName.textContent  = capitalize(val);
    avatarLetter.textContent = val.charAt(0).toUpperCase();
  }
});

/* ─────────────────────────────────────────────────────
   SECTION 2 — READY-MADE BIO DATA
   ───────────────────────────────────────────────────── */

var boysBios = [
  /* 1 */  '👤 The Dreamer\n💼 Creative Soul\n━━━━━━━━━━━━━━━\nTraits:\n• Wild imagination\n• Endless curiosity\n• Always chasing stars\n━━━━━━━━━━━━━━━\n✨ Living proof that dreamers make it.\n📩 Slide in, let\'s create.',
  /* 2 */  '👤 The Explorer\n🌍 Adventure Seeker\n━━━━━━━━━━━━━━━\nSkills:\n• Trail blazer\n• Risk taker\n• Map reader\n━━━━━━━━━━━━━━━\n🧭 Born to wander, built to wonder.\n📩 Join the journey.',
  /* 3 */  '👤 The Builder\n🏗️ Future Architect\n━━━━━━━━━━━━━━━\nSkills:\n• Strategy\n• Design\n• Execution\n━━━━━━━━━━━━━━━\n🔨 I don\'t just dream — I build.\n📩 Let\'s make blueprints.',
  /* 4 */  '👤 The Coder\n💻 Tech Visionary\n━━━━━━━━━━━━━━━\nLangs:\n• Python\n• JavaScript\n• C++\n━━━━━━━━━━━━━━━\n⚡ Turning ideas into apps.\n📩 DM for collab.',
  /* 5 */  '👤 The Photographer\n📸 Eye of the Wild\n━━━━━━━━━━━━━━━\nGear:\n• Canon R5\n• Drones\n• Golden hour\n━━━━━━━━━━━━━━━\n🌅 I capture moments, not memories.\n📩 Book a shoot.',
  /* 6 */  '👤 The Musician\n🎵 Sound Architect\n━━━━━━━━━━━━━━━\nVibes:\n• Lo-fi beats\n• Live sessions\n• Raw melodies\n━━━━━━━━━━━━━━━\n🎧 Music is my language.\n📩 Collab?',
  /* 7 */  '👤 The Athlete\n⚽ Game Changer\n━━━━━━━━━━━━━━━\nSports:\n• Football\n• Basketball\n• Fitness\n━━━━━━━━━━━━━━━\n💪 Train hard. Play harder.\n📩 Gym buddies welcome.',
  /* 8 */  '👤 The Chef\n🍳 Kitchen Wizard\n━━━━━━━━━━━━━━━\nSpecialty:\n• Italian\n• Street food\n• Desserts\n━━━━━━━━━━━━━━━\n🍕 Food is love on a plate.\n📩 Dinner? Say less.',
  /* 9 */  '👤 The Writer\n✍️ Word Weaver\n━━━━━━━━━━━━━━━\nGenres:\n• Fiction\n• Poetry\n• Essays\n━━━━━━━━━━━━━━━\n📖 Stories live in my pen.\n📩 Read my latest.',
  /* 10 */ '👤 The Entrepreneur\n🚀 Serial Founder\n━━━━━━━━━━━━━━━\nSkills:\n• Hustling\n• Scaling\n• Disrupting\n━━━━━━━━━━━━━━━\n💰 From zero to vision.\n📩 Pitch me.',
  /* 11 */ '👤 The Designer\n🎨 Visual Storyteller\n━━━━━━━━━━━━━━━\nTools:\n• Figma\n• Illustrator\n• Canva\n━━━━━━━━━━━━━━━\n✨ Pixels are my playground.\n📩 Let\'s design something sick.',
  /* 12 */ '👤 The Traveller\n✈️ Passport Collector\n━━━━━━━━━━━━━━━\nBeen to:\n• 30+ countries\n• Countless sunsets\n• Zero regrets\n━━━━━━━━━━━━━━━\n🌏 The world is my mood board.\n📩 Where next?',
  /* 13 */ '👤 The Gamer\n🎮 Digital Warrior\n━━━━━━━━━━━━━━━\nTitles:\n• Valorant\n• Fortnite\n• Elden Ring\n━━━━━━━━━━━━━━━\n🏆 GG not easy.\n📩 Party up.',
  /* 14 */ '👤 The Philosopher\n🧠 Deep Thinker\n━━━━━━━━━━━━━━━\nInterests:\n• Stoicism\n• Psychology\n• Existentialism\n━━━━━━━━━━━━━━━\n💭 Life is the question.\n📩 Let\'s talk.',
  /* 15 */ '👤 The Minimalist\n🍃 Less Is More\n━━━━━━━━━━━━━━━\nLifestyle:\n• Clean spaces\n• Clear mind\n• Simple living\n━━━━━━━━━━━━━━━\n🌿 Stripped it all back.\n📩 On purpose.',
  /* 16 */ '👤 The Night Owl\n🌙 Creature of Darkness\n━━━━━━━━━━━━━━━\nHabits:\n• 3 AM energy\n• Late night ideas\n• Coffee dependency\n━━━━━━━━━━━━━━━\n☕ Sleep is optional.\n📩 Available after midnight.',
  /* 17 */ '👤 The Fitness Freak\n💪 Iron Devotee\n━━━━━━━━━━━━━━━\nRoutine:\n• Deadlifts\n• Meal prep\n• Discipline\n━━━━━━━━━━━━━━━\n🏋️ Body is a temple.\n📩 Spot me.',
  /* 18 */ '👤 The Mentor\n🎓 Guide & Guru\n━━━━━━━━━━━━━━━\nFocus:\n• Leadership\n• Career advice\n• Growth hacking\n━━━━━━━━━━━━━━━\n🌱 Invest in people.\n📩 Ask me anything.',
  /* 19 */ '👤 The Filmmaker\n🎬 Visual Narrator\n━━━━━━━━━━━━━━━\nCraft:\n• Cinematography\n• Editing\n• Storytelling\n━━━━━━━━━━━━━━━\n🎥 Every frame is a painting.\n📩 Cast me.',
  /* 20 */ '👤 The Strategist\n♟️ Mastermind\n━━━━━━━━━━━━━━━\nDomain:\n• Business\n• Chess\n• Problem solving\n━━━━━━━━━━━━━━━\n🧩 I see ten moves ahead.\n📩 Level up with me.',
  /* 21 */ '👤 The Rebel\n🔥 Born to Break Rules\n━━━━━━━━━━━━━━━\nVibe:\n• Anti-corporate\n• Indie spirit\n• Raw authenticity\n━━━━━━━━━━━━━━━\n⛓️ Conformity is boring.\n📩 Be different with me.',
  /* 22 */ '👤 The Scientist\n🔬 Lab Rat Turned Legend\n━━━━━━━━━━━━━━━\nFields:\n• Chemistry\n• Physics\n• Curiosity\n━━━━━━━━━━━━━━━\n🧪 Questions > Answers.\n📩 Let\'s experiment.',
  /* 23 */ '👤 The Surfer\n🏄 Ride the Wave\n━━━━━━━━━━━━━━━\nSpot:\n• Bali\n• Pipeline\n• Local breaks\n━━━━━━━━━━━━━━━\n🌊 Salt water is my therapy.\n📩 Catch waves, not stress.',
  /* 24 */ '👤 The DJ\n🎶 Sound Lord\n━━━━━━━━━━━━━━━\nGenre:\n• House\n• Techno\n• Bass\n━━━━━━━━━━━━━━━\n🎧 Drop the beat, not the mic.\n📩 Book a set.',
  /* 25 */ '👤 The Hustler\n💼 24/7 Grinder\n━━━━━━━━━━━━━━━\nMindset:\n• Always on\n• Side hustles\n• Relentless drive\n━━━━━━━━━━━━━━━\n⚡ Rest is for the weekend. Maybe.\n📩 Let\'s grind.',
  /* 26 */ '👤 The Painter\n🎨 Canvas King\n━━━━━━━━━━━━━━━\nStyle:\n• Abstract\n• Realism\n• Mixed media\n━━━━━━━━━━━━━━━\n🖌️ Art flows through my veins.\n📩 Commission open.',
  /* 27 */ '👤 The Bookworm\n📚 Chapter Chaser\n━━━━━━━━━━━━━━━\nGenres:\n• Sci-fi\n• Psychology\n• Philosophy\n━━━━━━━━━━━━━━━\n📖 Lost in pages, found in worlds.\n📩 Recommend me something.',
  /* 28 */ '👤 The Drummer\n🥁 Heartbeat Keeper\n━━━━━━━━━━━━━━━\nStyle:\n• Jazz\n• Rock\n• Freestyle\n━━━━━━━━━━━━━━━\n🎶 I set the rhythm of life.\n📩 Need a beat?',
  /* 29 */ '👤 The Pilot\n✈️ Sky Walker\n━━━━━━━━━━━━━━━\nExp:\n• 500+ flight hours\n• Commercial certified\n• Cloud chaser\n━━━━━━━━━━━━━━━\n🌤️ Higher is better.\n📩 Fly with me.',
  /* 30 */ '👤 The Architect\n🏛️ Structure Visionary\n━━━━━━━━━━━━━━━\nDomain:\n• Urban design\n• Sustainable builds\n• Future cities\n━━━━━━━━━━━━━━━\n📐 I shape skylines.\n📩 Dream project?',
  /* 31 */ '👤 The Poet\n📝 Ink & Soul\n━━━━━━━━━━━━━━━\nThemes:\n• Love\n• Rebellion\n• Self-discovery\n━━━━━━━━━━━━━━━\n🖋️ Words are my weapons.\n📩 Read my verses.',
  /* 32 */ '👤 The Hacker\n💻 Digital Phantom\n━━━━━━━━━━━━━━━\nSkills:\n• Penetration testing\n• Cybersecurity\n• Linux\n━━━━━━━━━━━━━━━\n🔐 I find the cracks before they do.\n📩 Secure your stack.',
  /* 33 */ '👤 The Dancer\n💃 Rhythm & Soul\n━━━━━━━━━━━━━━━\nStyles:\n• Salsa\n• Hip-hop\n• Contemporary\n━━━━━━━━━━━━━━━\n🎵 Dance like no one\'s watching.\n📩 Partner up.',
  /* 34 */ '👤 The Barista\n☕ Coffee Connoisseur\n━━━━━━━━━━━━━━━\nSpecialty:\n• Latte art\n• Espresso\n• Pour over\n━━━━━━━━━━━━━━━\n🫘 Your morning starts with me.\n📩 Order up.',
  /* 35 */ '👤 The Runner\n🏃 Concrete Warrior\n━━━━━━━━━━━━━━━\nMilestones:\n• 5 marathons\n• Sub-3 hour club\n• Pain is progress\n━━━━━━━━━━━━━━━\n👟 Running from nothing, toward everything.\n📩 Join a race.',
  /* 36 */ '👤 The Actor\n🎭 Living Chameleon\n━━━━━━━━━━━━━━━\nGenre:\n• Drama\n• Action\n• Improv\n━━━━━━━━━━━━━━━\n🎬 Every day is a scene.\n📩 Cast me.',
  /* 37 */ '👤 The Investor\n📈 Money Maker\n━━━━━━━━━━━━━━━\nFocus:\n• Crypto\n• Stocks\n• Real estate\n━━━━━━━━━━━━━━━\n💵 Let your money work.\n📩 Market talk?',
  /* 38 */ '👤 The Woodworker\n🪵 Craft & Create\n━━━━━━━━━━━━━━━\nSkills:\n• Joinery\n• Furniture\n• Sculptures\n━━━━━━━━━━━━━━━\n🔨 Making things that last.\n📩 Custom orders open.',
  /* 39 */ '👤 The Astronomer\n🌌 Star Gazer\n━━━━━━━━━━━━━━━\nLove:\n• Nebulae\n• Eclipse nights\n• Telescope hours\n━━━━━━━━━━━━━━━\n⭐ Small on Earth, infinite in mind.\n📩 Stargaze with me.',
  /* 40 */ '👤 The Podcaster\n🎙️ Voice of a Generation\n━━━━━━━━━━━━━━━\nTopics:\n• Tech\n• Culture\n• Deep talks\n━━━━━━━━━━━━━━━\n🎧 Tune in. Think more.\n📩 Be a guest.',
  /* 41 */ '👤 The Drifter\n🛤️ No Fixed Address\n━━━━━━━━━━━━━━━\nLifestyle:\n• Van life\n• Backpacking\n• Freedom\n━━━━━━━━━━━━━━━\n🌄 Roots are optional.\n📩 Hit the road with me.',
  /* 42 */ '👤 The Comedian\n😂 Laughter Factory\n━━━━━━━━━━━━━━━\nStyle:\n• Stand-up\n• Sarcasm\n• Deadpan\n━━━━━━━━━━━━━━━\n🎤 Born to make you laugh.\n📩 Book a roast.',
  /* 43 */ '👤 The Martial Artist\n🥋 Warrior Monk\n━━━━━━━━━━━━━━━\nDiscipline:\n• BJJ\n• Muay Thai\n• Meditation\n━━━━━━━━━━━━━━━\n☯️ Mind & body in harmony.\n📩 Train with me.',
  /* 44 */ '👤 The Animator\n🎨 Frame by Frame\n━━━━━━━━━━━━━━━\nSoft:\n• After Effects\n• Motion graphics\n• 2D & 3D\n━━━━━━━━━━━━━━━\n✨ Magic happens frame by frame.\n📩 Animate your brand.',
  /* 45 */ '👤 The Sailor\n⛵ Ocean\'s Son\n━━━━━━━━━━━━━━━\nSeas:\n• Pacific\n• Caribbean\n• Open water\n━━━━━━━━━━━━━━━\n🌊 Horizon is just a suggestion.\n📩 Set sail.',
  /* 46 */ '👤 The Rapper\n🎤 Mic King\n━━━━━━━━━━━━━━━\nStyle:\n• Conscious\n• Trap\n• Freestyle\n━━━━━━━━━━━━━━━\n🔊 Words hit different.\n📩 Spit bars together.',
  /* 47 */ '👤 The Programmer\n⌨️ Logic Lord\n━━━━━━━━━━━━━━━\nStack:\n• React\n• Node.js\n• MongoDB\n━━━━━━━━━━━━━━━\n🖥️ Code is poetry.\n📩 Hack a project.',
  /* 48 */ '👤 The Herbalist\n🌿 Nature\'s Pharmacist\n━━━━━━━━━━━━━━━\nKnowledge:\n• Ayurveda\n• Essential oils\n• Organic living\n━━━━━━━━━━━━━━━\n🍃 Heal naturally.\n📩 Ask about remedies.',
  /* 49 */ '👤 The Skater\n🛹 Concrete Surfer\n━━━━━━━━━━━━━━━\nTricks:\n• Kickflip\n• Ollie\n• Grinds\n━━━━━━━━━━━━━━━\n🤙 Gravity is just a guideline.\n📩 Skatepark meetup?',
  /* 50 */ '👤 The Magician\n🎩 Illusion Master\n━━━━━━━━━━━━━━━\nAct:\n• Card tricks\n• Stage magic\n• Mind reading\n━━━━━━━━━━━━━━━\n✨ Now you see it…\n📩 Book a show.',
  /* 51 */ '👤 The Botanist\n🌱 Green Thumb\n━━━━━━━━━━━━━━━\nGarden:\n• Succulents\n• Tropicals\n• Bonsai\n━━━━━━━━━━━━━━━\n🌿 Plants are my people.\n📩 Trade cuttings.',
  /* 52 */ '👤 The Mechanic\n🔧 Grease & Gears\n━━━━━━━━━━━━━━━\nSkills:\n• Engine builds\n• Custom cars\n• Diagnostics\n━━━━━━━━━━━━━━━\n🚗 Making machines sing.\n📩 Book a service.',
  /* 53 */ '👤 The Monk\n🧘 Inner Peace Seeker\n━━━━━━━━━━━━━━━\nPractice:\n• Meditation\n• Mindfulness\n• Gratitude\n━━━━━━━━━━━━━━━\n☮️ Calm mind. Clear path.\n📩 Meditate with me.',
  /* 54 */ '👤 The Toymaker\n🧸 Childhood Keeper\n━━━━━━━━━━━━━━━\nCraft:\n• Handmade toys\n• Wooden puzzles\n• Imagination fuel\n━━━━━━━━━━━━━━━\n🎪 Making magic for kids.\n📩 Custom orders welcome.',
  /* 55 */ '👤 The Cyclist\n🚴 Road Warrior\n━━━━━━━━━━━━━━━\nRides:\n• Mountain trails\n• Urban commute\n• Century rides\n━━━━━━━━━━━━━━━\n🏔️ Pedals never stop.\n📩 Ride along.',
  /* 56 */ '👤 The Linguist\n🗣️ Polyglot Pro\n━━━━━━━━━━━━━━━\nLanguages:\n• 5 spoken fluently\n• 3 in progress\n• Slang master\n━━━━━━━━━━━━━━━\n🌐 Borders are just words.\n📩 Teach me yours.',
  /* 57 */ '👤 The Firefighter\n🔥 Brave & Bold\n━━━━━━━━━━━━━━━\nDuty:\n• Rescue missions\n• Fire control\n• Community service\n━━━━━━━━━━━━━━━\n🛡️ Serving with courage.\n📩 Always on call.',
  /* 58 */ '👤 The Sculptor\n⛏️ Stone & Soul\n━━━━━━━━━━━━━━━\nMedium:\n• Marble\n• Clay\n• Metal\n━━━━━━━━━━━━━━━\n🏺 Shapes tell stories.\n📩 Commission a piece.',
  /* 59 */ '👤 The Astronaut Wannabe\n🚀 Reaching for Stars\n━━━━━━━━━━━━━━━\nGoals:\n• Aerospace engineering\n• STEM evangelist\n• Sky is the floor\n━━━━━━━━━━━━━━━\n🌠 Not born yet. Coming soon.\n📩 Count me in.',
  /* 60 */ '👤 The Vintner\n🍷 Wine Curator\n━━━━━━━━━━━━━━━\nPalate:\n• Red wines\n• French labels\n• Blind tasting\n━━━━━━━━━━━━━━━\n🍇 Life is better with good wine.\n📩 Pop a bottle.',
  /* 61 */ '👤 The Weightlifter\n🏋️ Iron Addict\n━━━━━━━━━━━━━━━\nLifts:\n• Squat\n• Bench\n• Deadlift\n━━━━━━━━━━━━━━━\n💪 PR every single day.\n📩 Gym squad open.',
  /* 62 */ '👤 The Streamer\n🎮 Live & Loud\n━━━━━━━━━━━━━━━\nContent:\n• FPS games\n• IRL streams\n• Community vibes\n━━━━━━━━━━━━━━━\n📺 Tune in, hang out.\n📩 Sub & follow.',
  /* 63 */ '👤 The Sailor Boy\n⚓ Deck Hand\n━━━━━━━━━━━━━━━\nLife:\n• Knots & ropes\n• Fish & freedom\n• Endless blue\n━━━━━━━━━━━━━━━\n🌊 Born with salt in my blood.\n📩 Set sail together.',
  /* 64 */ '👤 The Tailor\n🪡 Thread & Needle\n━━━━━━━━━━━━━━━\nCraft:\n• Bespoke suits\n• Street wear\n• Custom fits\n━━━━━━━━━━━━━━━\n👔 Style is in the details.\n📩 Book a fitting.',
  /* 65 */ '👤 The Diver\n🤿 Deep Sea Diver\n━━━━━━━━━━━━━━━\nDepths:\n• Coral reefs\n• Wreck diving\n• Free diving\n━━━━━━━━━━━━━━━\n🐠 The ocean hides secrets. I find them.\n📩 Dive with me.',
  /* 66 */ '👤 The Podcast Host\n🎙️ Story Collector\n━━━━━━━━━━━━━━━\nEpisodes:\n• 200+ published\n• 50K listeners\n• Real conversations\n━━━━━━━━━━━━━━━\n🗣️ Everyone has a story.\n📩 Be my next guest.',
  /* 67 */ '👤 The Tattoo Artist\n🖋️ Ink & Skin\n━━━━━━━━━━━━━━━\nStyle:\n• Fine line\n• Traditional\n• Neo-trad\n━━━━━━━━━━━━━━━\n✨ Wearing art forever.\n📩 Booking now.',
  /* 68 */ '👤 The Backpacker\n🎒 Solo Wanderer\n━━━━━━━━━━━━━━━\nTrips:\n• Southeast Asia\n• South America\n• Budget life\n━━━━━━━━━━━━━━━\n🗺️ Cheap thrills, rich soul.\n📩 Travel tips DM.',
  /* 69 */ '👤 The Goalkeeper\n🧤 Last Line of Defense\n━━━━━━━━━━━━━━━\nSkills:\n• Shot stopping\n• Command presence\n• Reflexes\n━━━━━━━━━━━━━━━\n⚽ Nothing gets past me.\n📩 Train together.',
  /* 70 */ '👤 The Woodsman\n🪓 Forest Keeper\n━━━━━━━━━━━━━━━\nLife:\n• Camping\n• Survival skills\n• Fire starting\n━━━━━━━━━━━━━━━\n🌲 Trees and tea.\n📩 Camp with me.',
  /* 71 */ '👤 The Street Artist\n🎨 Urban Canvas\n━━━━━━━━━━━━━━━\nStyle:\n• Graffiti\n• Murals\n• Street installations\n━━━━━━━━━━━━━━━\n🏙️ The city is my gallery.\n📩 Collab on a wall.',
  /* 72 */ '👤 The Brewer\n🍺 Craft King\n━━━━━━━━━━━━━━━\nBrews:\n• IPAs\n• Stouts\n• Home recipes\n━━━━━━━━━━━━━━━\n🍻 Hops & happiness.\n📩 Come taste.',
  /* 73 */ '👤 The Weightlifter Pro\n🏆 Gold Chaser\n━━━━━━━━━━━━━━━\nComp:\n• Powerlifting\n• Olympic lifting\n• Podium finisher\n━━━━━━━━━━━━━━━\n🥇 Strength is earned.\n📩 Compete with me.',
  /* 74 */ '👤 The Robot Builder\n🤖 Tech Tinkerer\n━━━━━━━━━━━━━━━\nTools:\n• Arduino\n• Raspberry Pi\n• Soldering\n━━━━━━━━━━━━━━━\n⚙️ Making the future, now.\n📩 Build with me.',
  /* 75 */ '👤 The Nomad\n🌍 Professional Drifter\n━━━━━━━━━━━━━━━\nWork:\n• Remote first\n• Digital nomad\n• Laptop & freedom\n━━━━━━━━━━━━━━━\n💻 Work from anywhere.\n📩 Nomad tips open.',
  /* 76 */ '👤 The Sailor Sun\n☀️ Mast & Horizon\n━━━━━━━━━━━━━━━\nVoyage:\n• Atlantic crossing\n• Island hopping\n• Wind & waves\n━━━━━━━━━━━━━━━\n⛵ Salt in the air, freedom in the heart.\n📩 Come aboard.',
  /* 77 */ '👤 The Woodcarver\n🪵 Grain & Grain\n━━━━━━━━━━━━━━━\nArt:\n• Relief carving\n• Spoon carving\n• Figurines\n━━━━━━━━━━━━━━━\n🪓 Every cut tells a story.\n📩 Custom pieces available.',
  /* 78 */ '👤 The Forger\n⚒️ Iron & Fire\n━━━━━━━━━━━━━━━\nCraft:\n• Blades\n• Sculptures\n• Blacksmithing\n━━━━━━━━━━━━━━━\n🔥 Metal bends to my will.\n📩 Order a blade.',
  /* 79 */ '👤 The Loner\n🌙 Solitary Spirit\n━━━━━━━━━━━━━━━\nVibes:\n• Books & rain\n• Walks at dawn\n• Deep silences\n━━━━━━━━━━━━━━━\n🌑 Alone by choice, at peace by nature.\n📩 If you dare.',
  /* 80 */ '👤 The Trainer\n🏋️ Coach & Creator\n━━━━━━━━━━━━━━━\nFocus:\n• Calisthenics\n• HIIT\n• Mindset\n━━━━━━━━━━━━━━━\n💪 I don\'t just train bodies.\n📩 Join my program.',
  /* 81 */ '👤 The Glassblower\n🪩 Molten Magic\n━━━━━━━━━━━━━━━\nCreates:\n• Vases\n• Sculptures\n• Glass art\n━━━━━━━━━━━━━━━\n✨ Breathing life into sand.\n📩 Visit the studio.',
  /* 82 */ '👤 The Mountaineer\n🏔️ Summit Chaser\n━━━━━━━━━━━━━━━\nPeaks:\n• Kilimanjaro ✓\n• Everest base ✓\n• Next: The top\n━━━━━━━━━━━━━━━\n⛰️ The view is everything.\n📩 Climb with me.',
  /* 83 */ '👤 The Playwright\n📜 Stage Architect\n━━━━━━━━━━━━━━━\nPlays:\n• Drama\n• Comedy\n• One-man shows\n━━━━━━━━━━━━━━━\n🎭 Life is a stage. I write the lines.\n📩 Read my scripts.',
  /* 84 */ '👤 The Kayaker\n🛶 River Rider\n━━━━━━━━━━━━━━━\nWaters:\n• Whitewater\n• Sea kayaking\n• Calm lakes\n━━━━━━━━━━━━━━━\n🌊 Paddle & peace.\n📩 Paddle together.',
  /* 85 */ '👤 The Origami Master\n📐 Paper & Precision\n━━━━━━━━━━━━━━━\nFolds:\n• Cranes\n• Dragons\n• Complex models\n━━━━━━━━━━━━━━━\n🧊 Art from a single sheet.\n📩 Learn a fold.',
  /* 86 */ '👤 The Falconer\n🦅 Sky Tamer\n━━━━━━━━━━━━━━━\nBirds:\n• Hawks\n• Falcons\n• Eagles\n━━━━━━━━━━━━━━━\n🌤️ Wild hearts, loyal souls.\n📩 See the hunt.',
  /* 87 */ '👤 The Leather Crafter\n🪖 Rugged & Real\n━━━━━━━━━━━━━━━\nItems:\n• Wallets\n• Jackets\n• Bags\n━━━━━━━━━━━━━━━\n🤙 Made to last generations.\n📩 Shop now.',
  /* 88 */ '👤 The Luthier\n🎸 Guitar Maker\n━━━━━━━━━━━━━━━\nSkill:\n• Hand-built guitars\n• Repairs\n• Custom pickups\n━━━━━━━━━━━━━━━\n🎵 Every strum tells a story.\n📩 Commission your dream guitar.',
  /* 89 */ '👤 The Herbologist\n🌾 Ancient Wisdom\n━━━━━━━━━━━━━━━\nHerbs:\n• Ashwagandha\n• Lavender\n• Ginseng\n━━━━━━━━━━━━━━━\n🍵 Nature had medicine first.\n📩 Brew with me.',
  /* 90 */ '👤 The Chess Prodigy\n♟️ 64 Square King\n━━━━━━━━━━━━━━━\nRating:\n• 2200+\n• Tournament player\n• Strategy addict\n━━━━━━━━━━━━━━━\n🧠 Thinking ten moves ahead.\n📩 Challenge me.',
  /* 91 */ '👤 The Blacksmith\n⚒️ Ancient Craft\n━━━━━━━━━━━━━━━\nWork:\n• Swords\n• Horseshoes\n• Art pieces\n━━━━━━━━━━━━━━━\n🔥 Where fire meets iron.\n📩 Custom orders welcome.',
  /* 92 */ '👤 The DJ Producer\n🎚️ Beats & Bass\n━━━━━━━━━━━━━━━\nDAW:\n• Ableton\n• FL Studio\n• Live sets\n━━━━━━━━━━━━━━━\n🎶 I produce energy.\n📩 Collab DMs open.',
  /* 93 */ '👤 The Bow Hunter\n🏹 Silent Predator\n━━━━━━━━━━━━━━━\nSkills:\n• Archery\n• Wilderness\n• Patience\n━━━━━━━━━━━━━━━\n🌲 Patience is my superpower.\n📩 Hit the range.',
  /* 94 */ '👤 The Gemologist\n💎 Stone Whisperer\n━━━━━━━━━━━━━━━\nStones:\n• Diamonds\n• Sapphires\n• Rubies\n━━━━━━━━━━━━━━━\n✨ Rare things fascinate me.\n📩 Appraise your gems.',
  /* 95 */ '👤 The Fencer\n🤺 Blade Dancer\n━━━━━━━━━━━━━━━\nStyle:\n• Épée\n• Foil\n• Sabre\n━━━━━━━━━━━━━━━\n⚔️ Elegance meets edge.\n📩 En garde.',
  /* 96 */ '👤 The Cave Diver\n🌊 Into the Dark\n━━━━━━━━━━━━━━━\nAdventure:\n• Underwater caves\n• Night dives\n• Deep exploration\n━━━━━━━━━━━━━━━\n🤿 Darkness holds secrets.\n📩 Dive if you dare.',
  /* 97 */ '👤 The Arsonist Turned Artist\n🔥 Controlled Chaos\n━━━━━━━━━━━━━━━\nCraft:\n• Fire spinning\n• Pyrography\n• Flame art\n━━━━━━━━━━━━━━━\n🪔 Fire is my paintbrush.\n📩 Watch me burn.',
  /* 98 */ '👤 The Falconer Apprentice\n🦚 Wing & Wind\n━━━━━━━━━━━━━━━\nJourney:\n• Hawk training\n• Wildlife rehab\n• Bird photography\n━━━━━━━━━━━━━━━\n🌿 Learning from the sky.\n📩 Fly along.',
  /* 99 */ '👤 The Pottery Maker\n🏺 Earth & Hands\n━━━━━━━━━━━━━━━\nStyle:\n• Wheel throwing\n• Glazing\n• Handbuilt\n━━━━━━━━━━━━━━━\n🌍 Shaping earth into art.\n📩 Visit the kiln.',
  /* 100 */'👤 The Ironman\n🏅 Triathlon Beast\n━━━━━━━━━━━━━━━\nDisciplines:\n• Swim\n• Bike\n• Run\n━━━━━━━━━━━━━━━\n⚡ 226 km. No excuses.\n📩 Train together.',
  /* 101 */'👤 The Silversmith\n🪙 Metal & Art\n━━━━━━━━━━━━━━━\nCreates:\n• Rings\n• Chains\n• Sculptures\n━━━━━━━━━━━━━━━\n✨ Silver doesn\'t lie.\n📩 Design your piece.',
  /* 102 */'👤 The Urban Farmer\n🌾 City Roots\n━━━━━━━━━━━━━━━\nGrows:\n• Rooftop vegetables\n• Herbs\n• Microgreens\n━━━━━━━━━━━━━━━\n🥬 Green living in concrete jungle.\n📩 Local delivery.',
  /* 103 */'👤 The Spearfisher\n🐟 Ocean Hunter\n━━━━━━━━━━━━━━━\nWaters:\n• Mediterranean\n• Pacific\n• Crystal clear\n━━━━━━━━━━━━━━━\n🌊 Primal instinct, modern soul.\n📩 Spear with me.',
  /* 104 */'👤 The Glider Pilot\n🪂 Wind Rider\n━━━━━━━━━━━━━━━\nFlights:\n• Paragliding\n• Hang gliding\n• Thermals master\n━━━━━━━━━━━━━━━\n🌤️ Flying without an engine.\n📩 Catch the updraft.',
  /* 105 */'👤 The Campfire Storyteller\n🔥 Ancient Tradition\n━━━━━━━━━━━━━━━\nTales:\n• Myths & legends\n• Horror\n• Adventure\n━━━━━━━━━━━━━━━\n📖 Gather \'round. This one\'s good.\n📩 Invite me to your fire.'
];

var girlsBios = [
  /* 1 */  '👤 The Dreamer Girl\n💫 Soft & Stellar\n━━━━━━━━━━━━━━━\nVibes:\n• Fairy lights\n• Iced lattes\n• Sunset chasing\n━━━━━━━━━━━━━━━\n🌸 Dreaming in colour.\n📩 Let\'s glow together.',
  /* 2 */  '👤 The Fashionista\n👗 Style Icon\n━━━━━━━━━━━━━━━\nAesthetic:\n• Vintage\n• Streetwear\n• Elevated casual\n━━━━━━━━━━━━━━━\n✨ Fashion is a mood.\n📩 Style collab?',
  /* 3 */  '👤 The Artist\n🎨 Canvas & Chaos\n━━━━━━━━━━━━━━━\nMedium:\n• Watercolour\n• Digital\n• Sketching\n━━━━━━━━━━━━━━━\n🖌️ Art is my therapy.\n📩 Commission open.',
  /* 4 */  '👤 The Explorer Girl\n🌿 Wild at Heart\n━━━━━━━━━━━━━━━\nThings:\n• Hiking\n• Forest bathing\n• Getting lost\n━━━━━━━━━━━━━━━\n🍃 Nature is my home.\n📩 Hike with me.',
  /* 5 */  '👤 The Baker\n🧁 Sweet Surrender\n━━━━━━━━━━━━━━━\nSpecialty:\n• Cakes\n• Croissants\n• Custom designs\n━━━━━━━━━━━━━━━\n🍰 Baking happiness daily.\n📩 Order a cake.',
  /* 6 */  '👤 The Yoga Queen\n🧘 Inner Peace\n━━━━━━━━━━━━━━━\nPractice:\n• Vinyasa\n• Meditation\n• Breathwork\n━━━━━━━━━━━━━━━\n🌸 Breathe deep. Live light.\n📩 Join a class.',
  /* 7 */  '👤 The Photographer\n📸 Golden Light\n━━━━━━━━━━━━━━━\nStyle:\n• Portrait\n• Travel\n• Film photography\n━━━━━━━━━━━━━━━\n🌅 Capturing life\'s soft moments.\n📩 Book a shoot.',
  /* 8 */  '👤 The Singer\n🎤 Voice & Vibe\n━━━━━━━━━━━━━━━\nGenres:\n• Indie pop\n• Acoustic\n• Soul\n━━━━━━━━━━━━━━━\n🎵 My voice is my story.\n📩 Listen to my music.',
  /* 9 */  '👤 The Entrepreneur\n💼 Boss Lady\n━━━━━━━━━━━━━━━\nBrand:\n• Skincare line\n• Online store\n• Content empire\n━━━━━━━━━━━━━━━\n💪 Built this from scratch.\n📩 Collab?',
  /* 10 */ '👤 The Bookworm\n📚 Lost in Pages\n━━━━━━━━━━━━━━━\nGenres:\n• Romance\n• Fantasy\n• Self-help\n━━━━━━━━━━━━━━━\n📖 Books > Boys.\n📩 Book club DM.',
  /* 11 */ '👤 The Dancer\n💃 Stage & Soul\n━━━━━━━━━━━━━━━\nStyles:\n• Ballet\n• Contemporary\n• Salsa\n━━━━━━━━━━━━━━━\n🩰 Dance like nobody\'s watching.\n📩 Dance with me.',
  /* 12 */ '👤 The Traveller\n✈️ Suitcase & Sunsets\n━━━━━━━━━━━━━━━\nDestinations:\n• Santorini ✓\n• Bali ✓\n• Next: Everywhere\n━━━━━━━━━━━━━━━\n🌍 Wanderlust is a lifestyle.\n📩 Trip inspo?',
  /* 13 */ '👤 The Coder Girl\n💻 She Codes\n━━━━━━━━━━━━━━━\nStack:\n• Python\n• JavaScript\n• UX Design\n━━━━━━━━━━━━━━━\n⚡ Breaking barriers, one line at a time.\n📩 Tech collab?',
  /* 14 */ '👤 The Musician\n🎹 Keys & Dreams\n━━━━━━━━━━━━━━━\nInstruments:\n• Piano\n• Guitar\n• Voice\n━━━━━━━━━━━━━━━\n🎶 Music lives in my soul.\n📩 Play together.',
  /* 15 */ '👤 The Minimalist\n🤍 Less & More\n━━━━━━━━━━━━━━━\nEssentials:\n• White space\n• Clean lines\n• Pure joy\n━━━━━━━━━━━━━━━\n🌿 Beauty in simplicity.\n📩 Inspire each other.',
  /* 16 */ '👤 The Illustrator\n🖍️ Colour & Story\n━━━━━━━━━━━━━━━\nArt:\n• Children\'s books\n• Character design\n• Concept art\n━━━━━━━━━━━━━━━\n🌈 Stories come to life.\n📩 Commission now.',
  /* 17 */ '👤 The Runner\n🏃 Miles & Mind\n━━━━━━━━━━━━━━━\nMilestones:\n• 3 half marathons\n• Personal bests\n• Runner\'s high\n━━━━━━━━━━━━━━━\n👟 Run towards your dreams.\n📩 Running buddy?',
  /* 18 */ '👤 The Gardener\n🌻 Bloom & Grow\n━━━━━━━━━━━━━━━\nGarden:\n• Roses\n• Wildflowers\n• Herb garden\n━━━━━━━━━━━━━━━\n🌼 Growing things, growing me.\n📩 Garden tips open.',
  /* 19 */ '👤 The Chef\n👩‍🍳 Kitchen Queen\n━━━━━━━━━━━━━━━\nCuisine:\n• Italian\n• Japanese\n• Desserts\n━━━━━━━━━━━━━━━\n🍝 Food is love, served plated.\n📩 Dinner invite?',
  /* 20 */ '👤 The Writer\n✍️ Ink & Feeling\n━━━━━━━━━━━━━━━\nGenres:\n• Poetry\n• Fiction\n• Journals\n━━━━━━━━━━━━━━━\n📝 My pen speaks for me.\n📩 Read my words.',
  /* 21 */ '👤 The Filmmaker\n🎬 Visual Poet\n━━━━━━━━━━━━━━━\nCraft:\n• Short films\n• Documentaries\n• Editing\n━━━━━━━━━━━━━━━\n🎥 Every frame is a feeling.\n📩 Co-direct with me.',
  /* 22 */ '👤 The Surfer Girl\n🏄 Wave Chaser\n━━━━━━━━━━━━━━━\nBeach:\n• Bali waves\n• California break\n• Sunrise sessions\n━━━━━━━━━━━━━━━\n🌊 Salt & freedom.\n📩 Catch a wave.',
  /* 23 */ '👤 The Makeup Artist\n💄 Beauty Alchemist\n━━━━━━━━━━━━━━━\nSkills:\n• Bridal looks\n• Editorial\n• SFX makeup\n━━━━━━━━━━━━━━━\n✨ Transforming faces, inspiring souls.\n📩 Book a session.',
  /* 24 */ '👤 The Podcaster\n🎙️ Real Conversations\n━━━━━━━━━━━━━━━\nTopics:\n• Women in tech\n• Mental health\n• Career growth\n━━━━━━━━━━━━━━━\n🗣️ Let\'s talk openly.\n📩 Be a guest.',
  /* 25 */ '👤 The Activist\n✊ Change Maker\n━━━━━━━━━━━━━━━\nCauses:\n• Environment\n• Education\n• Equality\n━━━━━━━━━━━━━━━\n🌍 Small actions. Big impact.\n📩 Join the movement.',
  /* 26 */ '👤 The Painter Girl\n🎨 Colour Dreamer\n━━━━━━━━━━━━━━━\nStyle:\n• Abstract\n• Impressionism\n• Mixed media\n━━━━━━━━━━━━━━━\n🖌️ Paint your world brighter.\n📩 Art prints shop.',
  /* 27 */ '👤 The Swimmer\n🏊 Lap Queen\n━━━━━━━━━━━━━━━\nEvents:\n• Freestyle\n• Butterfly\n• Open water\n━━━━━━━━━━━━━━━\n💧 Born in the water.\n📩 Swim session?',
  /* 28 */ '👤 The Florist\n🌹 Petal Weaver\n━━━━━━━━━━━━━━━\nArrangements:\n• Weddings\n• Events\n• Bouquets\n━━━━━━━━━━━━━━━\n🌷 Flowers say what words can\'t.\n📩 Order a bouquet.',
  /* 29 */ '👤 The Gymnast\n🤸 Flip & Fly\n━━━━━━━━━━━━━━━\nEvents:\n• Floor\n• Beam\n• Vault\n━━━━━━━━━━━━━━━\n⭐ Grace under pressure.\n📩 Train with me.',
  /* 30 */ '👤 The Barista Girl\n☕ Latte Lover\n━━━━━━━━━━━━━━━\nBrews:\n• Specialty coffee\n• Latte art\n• Cinnamon everything\n━━━━━━━━━━━━━━━\n🫘 Your morning mood starter.\n📩 Order up.',
  /* 31 */ '👤 The Herbalist\n🌿 Plant Medicine\n━━━━━━━━━━━━━━━\nPractice:\n• Ayurveda\n• Herbal teas\n• Holistic healing\n━━━━━━━━━━━━━━━\n🍵 Nature knows best.\n📩 Healing chat.',
  /* 32 */ '👤 The Pilot Girl\n✈️ Sky Nomad\n━━━━━━━━━━━━━━━\nExp:\n• Commercial license\n• 400+ hours\n• Clouds are friends\n━━━━━━━━━━━━━━━\n🌤️ Ceilings are meant to be broken.\n📩 Fly with ambition.',
  /* 33 */ '👤 The Gamer Girl\n🎮 Pixel Queen\n━━━━━━━━━━━━━━━\nGames:\n• Valorant\n• Overwatch\n• Indie titles\n━━━━━━━━━━━━━━━\n🏆 GG. Always.\n📩 Team up.',
  /* 34 */ '👤 The Ceramicist\n🏺 Clay & Dreams\n━━━━━━━━━━━━━━━\nMakes:\n• Bowls\n• Vases\n• Handmade mugs\n━━━━━━━━━━━━━━━\n🌍 Shaping earth with love.\n📩 Visit my studio.',
  /* 35 */ '👤 The Motivational Speaker\n🗣️ Fire Starter\n━━━━━━━━━━━━━━━\nTopics:\n• Self-belief\n• Career moves\n• Mental strength\n━━━━━━━━━━━━━━━\n💥 I ignite potential.\n📩 Book a talk.',
  /* 36 */ '👤 The Violinist\n🎻 Strings & Stars\n━━━━━━━━━━━━━━━\nStyle:\n• Classical\n• Contemporary\n• Cross-genre\n━━━━━━━━━━━━━━━\n🎵 Every note is emotion.\n📩 Listen to me play.',
  /* 37 */ '👤 The Vlogger\n📹 Daily Life\n━━━━━━━━━━━━━━━\nContent:\n• Beauty\n• Travel\n• Lifestyle\n━━━━━━━━━━━━━━━\n✨ Sharing my world with you.\n📩 Subscribe & connect.',
  /* 38 */ '👤 The Astronomer\n🌌 Star Child\n━━━━━━━━━━━━━━━\nLove:\n• Galaxies\n• Meteor showers\n• Telescope nights\n━━━━━━━━━━━━━━━\n⭐ Small on Earth, infinite inside.\n📩 Stargaze?',
  /* 39 */ '👤 The Tailor\n🪡 Stitch & Style\n━━━━━━━━━━━━━━━\nCraft:\n• Dresses\n• Alterations\n• Bridal gowns\n━━━━━━━━━━━━━━━\n👗 Elegance is in every thread.\n📩 Book a fitting.',
  /* 40 */ '👤 The Nutritionist\n🥗 Food Healer\n━━━━━━━━━━━━━━━\nFocus:\n• Clean eating\n• Meal plans\n• Gut health\n━━━━━━━━━━━━━━━\n🌿 Fuel your glow.\n📩 Free consultation.',
  /* 41 */ '👤 The Street Artist\n🏙️ Urban Bloom\n━━━━━━━━━━━━━━━\nStyle:\n• Murals\n• Stencils\n• Wheatpaste\n━━━━━━━━━━━━━━━\n🎨 Turning grey walls into gardens.\n📩 Commission a mural.',
  /* 42 */ '👤 The Model\n📸 Frame & Poise\n━━━━━━━━━━━━━━━\nWork:\n• Editorial\n• Commercial\n• Runway\n━━━━━━━━━━━━━━━\n✨ Confidence is couture.\n📩 Booking inquiries.',
  /* 43 */ '👤 The Hiker\n🥾 Trail Blazer\n━━━━━━━━━━━━━━━\nTrails:\n• Alps ✓\n• Himalayas ✓\n• Solo hikes\n━━━━━━━━━━━━━━━\n🏔️ Elevation is my therapy.\n📩 Trail tips DM.',
  /* 44 */ '👤 The Fashion Designer\n👠 Runway Creator\n━━━━━━━━━━━━━━━\nStyle:\n• Couture\n• Streetwear\n• Sustainable fashion\n━━━━━━━━━━━━━━━\n💎 Designing the future of style.\n📩 Behind the scenes.',
  /* 45 */ '👤 The Candle Maker\n🕯️ Wax & Warmth\n━━━━━━━━━━━━━━━\nScents:\n• Vanilla\n• Lavender\n• Ocean breeze\n━━━━━━━━━━━━━━━\n🌸 Turning homes into havens.\n📩 Shop online.',
  /* 46 */ '👤 The Photographer Girl\n🌸 Soft Focus\n━━━━━━━━━━━━━━━\nStyle:\n• Newborn\n• Wedding\n• Nature\n━━━━━━━━━━━━━━━\n📷 Tender moments, forever kept.\n📩 Book a session.',
  /* 47 */ '👤 The Tea Lover\n🍵 Brew & Be\n━━━━━━━━━━━━━━━\nTeas:\n• Matcha\n• Earl Grey\n• Chai\n━━━━━━━━━━━━━━━\n☕ One cup of calm, please.\n📩 Tea date?',
  /* 48 */ '👤 The Athlete Girl\n⚽ Game Changer\n━━━━━━━━━━━━━━━\nSports:\n• Soccer\n• Tennis\n• Fitness\n━━━━━━━━━━━━━━━\n🏆 Play like you mean it.\n📩 Train together.',
  /* 49 */ '👤 The Calligrapher\n🖋️ Ink & Grace\n━━━━━━━━━━━━━━━\nStyles:\n• Modern script\n• Lettering\n• Invitations\n━━━━━━━━━━━━━━━\n✍️ Every letter is art.\n📩 Custom orders.',
  /* 50 */ '👤 The Journalist\n📰 Words & Truth\n━━━━━━━━━━━━━━━\nBeats:\n• Culture\n• Politics\n• Human interest\n━━━━━━━━━━━━━━━\n📝 Truth deserves a voice.\n📩 Read my bylines.',
  /* 51 */ '👤 The Dancer Girl\n🩰 Pointe & Power\n━━━━━━━━━━━━━━━\nDance:\n• Ballet\n• Jazz\n• Lyrical\n━━━━━━━━━━━━━━━\n🌟 Grace is strength.\n📩 Dance class info.',
  /* 52 */ '👤 The Interior Designer\n🏡 Space & Style\n━━━━━━━━━━━━━━━\nThemes:\n• Minimalist\n• Bohemian\n• Modern chic\n━━━━━━━━━━━━━━━\n🛋️ I make spaces breathe.\n📩 Design your dream space.',
  /* 53 */ '👤 The Winemaker\n🍷 Grape & Grace\n━━━━━━━━━━━━━━━\nVarietals:\n• Rosé\n• Pinot Noir\n• Sparkling\n━━━━━━━━━━━━━━━\n🍇 Crafting elegance in a glass.\n📩 Wine tasting?',
  /* 54 */ '👤 The Dancer Performer\n🌙 Moonlit Moves\n━━━━━━━━━━━━━━━\nStyle:\n• Belly dance\n• Tribal fusion\n• Interpretive\n━━━━━━━━━━━━━━━\n🌕 Moving with the universe.\n📩 Show bookings open.',
  /* 55 */ '👤 The Skincare Guru\n🧴 Glow Protocol\n━━━━━━━━━━━━━━━\nRoutine:\n• Morning ritual\n• SPF always\n• Natural ingredients\n━━━━━━━━━━━━━━━\n✨ Glass skin? Earned it.\n📩 Skincare DMs.',
  /* 56 */ '👤 The Ceramicist Girl\n🌸 Earth Art\n━━━━━━━━━━━━━━━\nCreates:\n• Planters\n• Mugs\n• Sculptures\n━━━━━━━━━━━━━━━\n🏺 Hands in clay, heart in art.\n📩 Custom pieces.',
  /* 57 */ '👤 The Woodworker\n🪵 Grain & Grace\n━━━━━━━━━━━━━━━\nCraft:\n• Furniture\n• Cuttingboards\n• Home decor\n━━━━━━━━━━━━━━━\n🌲 She builds with beauty.\n📩 Custom orders welcome.',
  /* 58 */ '👤 The Mindfulness Coach\n🧘 Peace Keeper\n━━━━━━━━━━━━━━━\nServices:\n• Guided meditation\n• Breathwork\n• Journals\n━━━━━━━━━━━━━━━\n🌿 Find your calm.\n📩 Free session available.',
  /* 59 */ '👤 The Night Owl\n🌙 After Hours\n━━━━━━━━━━━━━━━\nHabits:\n• Midnight tea\n• Late night art\n• Creative 3 AM\n━━━━━━━━━━━━━━━\n☕ My best ideas come at midnight.\n📩 Up late? Same.',
  /* 60 */ '👤 The Jewelry Maker\n💍 Sparkle Crafter\n━━━━━━━━━━━━━━━\nDesigns:\n• Gold jewelry\n• Gemstones\n• Minimalist pieces\n━━━━━━━━━━━━━━━\n💎 Small details. Big impact.\n📩 Browse my shop.',
  /* 61 */ '👤 The Illustrator Girl\n🌈 Story Painter\n━━━━━━━━━━━━━━━\nArt:\n• Book covers\n• Greeting cards\n• Logos\n━━━━━━━━━━━━━━━\n🖍️ Colour brings life.\n📩 Hire me.',
  /* 62 */ '👤 The Kayaker\n🛶 Water Witch\n━━━━━━━━━━━━━━━\nSpot:\n• Sea kayaking\n• Rivers\n• Calm lakes\n━━━━━━━━━━━━━━━\n🌊 Paddle & peace.\n📩 Paddle along.',
  /* 63 */ '👤 The Bookshop Keeper\n📚 Shelf Curator\n━━━━━━━━━━━━━━━\nLife:\n• Indie bookshop\n• Reading nook\n• Paper & ink\n━━━━━━━━━━━━━━━\n📖 Where stories live.\n📩 Recommend a book.',
  /* 64 */ '👤 The Beekeeper\n🐝 Hive Whisperer\n━━━━━━━━━━━━━━━\nCraft:\n• Honey harvesting\n• Apiculture\n• Bee care\n━━━━━━━━━━━━━━━\n🍯 Sweet work, sweeter rewards.\n📩 Taste my honey.',
  /* 65 */ '👤 The Soap Maker\n🫧 Lather & Love\n━━━━━━━━━━━━━━━\nRecipes:\n• Handmade bars\n• Essential oils\n• Botanical blends\n━━━━━━━━━━━━━━━\n🌸 Clean skin, clean living.\n📩 Shop now.',
  /* 66 */ '👤 The Actress\n🎭 Stage & Screen\n━━━━━━━━━━━━━━━\nGenres:\n• Drama\n• Comedy\n• Theatre\n━━━━━━━━━━━━━━━\n🌟 Every role is a new world.\n📩 Audition DMs.',
  /* 67 */ '👤 The Weavers Guild\n🧵 Fabric & Flow\n━━━━━━━━━━━━━━━\nCraft:\n• Macramé\n• Hand weaving\n• Textiles\n━━━━━━━━━━━━━━━\n🪡 Threads tell stories.\n📩 Workshop details.',
  /* 68 */ '👤 The Wildlife Photographer\n📷 Nature\'s Eye\n━━━━━━━━━━━━━━━\nSubjects:\n• Birds\n• Macro\n• Landscapes\n━━━━━━━━━━━━━━━\n🌿 Patience & pixels.\n📩 Print shop open.',
  /* 69 */ '👤 The Meditation Teacher\n🧘 Stillness Keeper\n━━━━━━━━━━━━━━━\nStyles:\n• Vipassana\n• Loving kindness\n• Body scan\n━━━━━━━━━━━━━━━\n🌸 Find your silence.\n📩 Drop in class.',
  /* 70 */ '👤 The Soap Artist\n🌺 Petal Craft\n━━━━━━━━━━━━━━━\nVibes:\n• Floral scents\n• Luxury bars\n• Gift sets\n━━━━━━━━━━━━━━━\n✨ Luxury you can lather.\n📩 Custom gift baskets.',
  /* 71 */ '👤 The Dog Trainer\n🐕 Paw Expert\n━━━━━━━━━━━━━━━\nSkills:\n• Obedience\n• Agility\n• Rescue rehab\n━━━━━━━━━━━━━━━\n🦮 Every dog deserves love.\n📩 Book a session.',
  /* 72 */ '👤 The Embroiderer\n🧵 Stitch by Stitch\n━━━━━━━━━━━━━━━\nStyle:\n• Hand embroidery\n• Cross stitch\n• Hoop art\n━━━━━━━━━━━━━━━\n🌸 Every stitch is intention.\n📩 Custom pieces.',
  /* 73 */ '👤 The Surfer Soul\n🌊 Salt Girl\n━━━━━━━━━━━━━━━\nSpots:\n• Oahu\n• Portugal\n• Local breaks\n━━━━━━━━━━━━━━━\n🏄 Ocean is my church.\n📩 Wax up.',
  /* 74 */ '👤 The Confectioner\n🍫 Sweet Things\n━━━━━━━━━━━━━━━\nMakes:\n• Chocolates\n• Macarons\n• Truffles\n━━━━━━━━━━━━━━━\n🍬 Life is sweeter with me.\n📩 Place an order.',
  /* 75 */ '👤 The Plant Mom\n🪴 Greenery Goddess\n━━━━━━━━━━━━━━━\nCollection:\n• 50+ plants\n• Rare species\n• Propagation pro\n━━━━━━━━━━━━━━━\n🌱 If it grows, I grow with it.\n📩 Plant swap?',
  /* 76 */ '👤 The Tattooist\n🖋️ Skin & Art\n━━━━━━━━━━━━━━━\nStyle:\n• Watercolour\n• Fine line\n• Minimalist\n━━━━━━━━━━━━━━━\n✨ Art that lives and breathes.\n📩 Booking open.',
  /* 77 */ '👤 The Knitter\n🧶 Cozy Crafter\n━━━━━━━━━━━━━━━\nMakes:\n• Sweaters\n• Scarves\n• Blankets\n━━━━━━━━━━━━━━━\n🌧️ Warm stitches, warm soul.\n📩 Custom knitwear.',
  /* 78 */ '👤 The Ballerina\n🩰 Grace & Gold\n━━━━━━━━━━━━━━━\nLevel:\n• Professional dancer\n• 15+ years\n• Pointe shoes\n━━━━━━━━━━━━━━━\n⭐ Discipline is beautiful.\n📩 Watch me dance.',
  /* 79 */ '👤 The Crystal Healer\n💎 Energy Reader\n━━━━━━━━━━━━━━━\nCrystals:\n• Amethyst\n• Rose quartz\n• Obsidian\n━━━━━━━━━━━━━━━\n🌙 Vibrations & healing.\n📩 Crystal shop online.',
  /* 80 */ '👤 The Landscape Painter\n🌄 Canvas Earth\n━━━━━━━━━━━━━━━\nScenes:\n• Mountains\n• Oceans\n• Golden fields\n━━━━━━━━━━━━━━━\n🖌️ Painting what I feel.\n📩 Art prints available.',
  /* 81 */ '👤 The Aromatherapist\n🌸 Scent & Soul\n━━━━━━━━━━━━━━━\nEssentials:\n• Lavender\n• Eucalyptus\n• Rose oil\n━━━━━━━━━━━━━━━\n🌿 Breathe in peace.\n📩 Therapy booking.',
  /* 82 */ '👤 The Dancer Pro\n💃 Floor & Fire\n━━━━━━━━━━━━━━━\nStyle:\n• Hip-hop\n• Breaking\n• Freestyle\n━━━━━━━━━━━━━━━\n🎵 Body is the instrument.\n📩 Crew up.',
  /* 83 */ '👤 The Leather Artist\n🪖 Stitch & Style\n━━━━━━━━━━━━━━━\nItems:\n• Bags\n• Belts\n• Journals\n━━━━━━━━━━━━━━━\n✨ Handcrafted elegance.\n📩 Custom leather goods.',
  /* 84 */ '👤 The Aquarist\n🐠 Ocean in a Box\n━━━━━━━━━━━━━━━\nTanks:\n• Reef tanks\n• Freshwater\n• Planted aquariums\n━━━━━━━━━━━━━━━\n🌊 Tiny ocean, endless wonder.\n📩 Aqua tips free.',
  /* 85 */ '👤 The Folk Singer\n🎶 Campfire Soul\n━━━━━━━━━━━━━━━\nVibe:\n• Acoustic guitar\n• Storytelling songs\n• Raw emotion\n━━━━━━━━━━━━━━━\n🎵 Music from the heart.\n📩 Listen to my tracks.',
  /* 86 */ '👤 The Origami Artist\n📐 Paper Dreams\n━━━━━━━━━━━━━━━\nFolds:\n• Flowers\n• Elephants\n• Sculptures\n━━━━━━━━━━━━━━━\n🧊 Art from a single sheet.\n📩 Workshop open.',
  /* 87 */ '👤 The Soap Alchemist\n🫧 Bubble Magic\n━━━━━━━━━━━━━━━\nRecipes:\n• Cold process\n• Botanical bars\n• Custom sets\n━━━━━━━━━━━━━━━\n🌸 Clean chemistry.\n📩 Bulk orders welcome.',
  /* 88 */ '👤 The Tarot Reader\n🃏 Cards & Cosmos\n━━━━━━━━━━━━━━━\nServices:\n• Daily pulls\n• Life readings\n• Digital spreads\n━━━━━━━━━━━━━━━\n🌙 The cards know.\n📩 Get a reading.',
  /* 89 */ '👤 The Bird Lover\n🐦 Feathered Friends\n━━━━━━━━━━━━━━━\nBirds:\n• Parrots\n• Doves\n• Rescue birds\n━━━━━━━━━━━━━━━\n🌿 Wings & wonder.\n📩 Avian chat.',
  /* 90 */ '👤 The Muralist\n🏛️ Wall Whisperer\n━━━━━━━━━━━━━━━\nStyle:\n• Large-scale\n• Abstract\n• Botanical\n━━━━━━━━━━━━━━━\n🎨 City walls = my canvas.\n📩 Project inquiries.',
  /* 91 */ '👤 The Pottery Girl\n🏺 Spin & Shape\n━━━━━━━━━━━━━━━\nProducts:\n• Mugs\n• Plates\n• Decorative pots\n━━━━━━━━━━━━━━━\n🌍 Clay is my language.\n📩 Etsy shop link.',
  /* 92 */ '👤 The Mushroom Forager\n🍄 Forest Treasure\n━━━━━━━━━━━━━━━\nFinds:\n• Porcini\n• Chanterelles\n• Morels\n━━━━━━━━━━━━━━━\n🌲 Nature\'s hidden bounty.\n📩 Foraging walks.',
  /* 93 */ '👤 The Silk Painter\n🖌️ Thread & Colour\n━━━━━━━━━━━━━━━\nArt:\n• Silk scarves\n• Fabric painting\n• Wearable art\n━━━━━━━━━━━━━━━\n🌺 Elegance you can wear.\n📩 Custom silk pieces.',
  /* 94 */ '👤 The Meditation Guide\n🕉️ Zen & Flow\n━━━━━━━━━━━━━━━\nApproach:\n• Mindfulness\n• Yoga nidra\n• Sound baths\n━━━━━━━━━━━━━━━\n🌸 Peace is a practice.\n📩 Group sessions.',
  /* 95 */ '👤 The Lace Maker\n🧵 Thread & Time\n━━━━━━━━━━━━━━━\nCraft:\n• Bobbin lace\n• Needle lace\n• Bridal veils\n━━━━━━━━━━━━━━━\n✨ Patience woven into beauty.\n📩 Bespoke orders.',
  /* 96 */ '👤 The Wild Swimmer\n🌊 Cold & Calm\n━━━━━━━━━━━━━━━\nWaters:\n• Lakes\n• Rivers\n• Open sea\n━━━━━━━━━━━━━━━\n🧊 Cold water heals the soul.\n📩 Swim at dawn?',
  /* 97 */ '👤 The Jam Maker\n🫐 Berry Bliss\n━━━━━━━━━━━━━━━\nFlavors:\n• Strawberry\n• Mixed berry\n• Fig & honey\n━━━━━━━━━━━━━━━\n🍓 Sweetness in a jar.\n📩 Farmers market soon.',
  /* 98 */ '👤 The Hand Letterer\n🖊️ Ink & Intention\n━━━━━━━━━━━━━━━\nWork:\n• Wedding stationery\n• Signage\n• Art prints\n━━━━━━━━━━━━━━━\n✍️ Every word, handcrafted.\n📩 Quotes & inquiries.',
  /* 99 */ '👤 The Fairy Tale Girl\n🧚 Enchanted\n━━━━━━━━━━━━━━━\nWorld:\n• Forests\n• Magic\n• Wonder\n━━━━━━━━━━━━━━━\n🌟 Believing in the impossible.\n📩 Once upon a time…',
  /* 100 */'👤 The Sunset Chaser\n🌅 Golden Hour\n━━━━━━━━━━━━━━━\nRituals:\n• Evening walks\n• Sky watching\n• Gratitude\n━━━━━━━━━━━━━━━\n🌼 Every sunset is a gift.\n📩 Watch one together.',
  /* 101 */'👤 The Mosaic Artist\n🪞 Tile & Time\n━━━━━━━━━━━━━━━\nCraft:\n• Bathroom mosaics\n• Art pieces\n• Pathway tiles\n━━━━━━━━━━━━━━━\n✨ Small pieces. Big picture.\n📩 Custom mosaics.',
  /* 102 */'👤 The Pressed Flower Artist\n🌷 Nature Prints\n━━━━━━━━━━━━━━━\nMakes:\n• Cards\n• Frames\n• Bookmarks\n━━━━━━━━━━━━━━━\n🌸 Preserving beauty forever.\n📩 Shop open.',
  /* 103 */'👤 The Sunrise Jogger\n🌅 Dawn Runner\n━━━━━━━━━━━━━━━\nRoutine:\n• 5 AM runs\n• Trail jogging\n• Fresh air\n━━━━━━━━━━━━━━━\n👟 Start the day moving.\n📩 Running pal?',
  /* 104 */'👤 The Honey Artist\n🍯 Golden Drizzle\n━━━━━━━━━━━━━━━\nProducts:\n• Raw honey\n• Honeycomb\n• Bee pollen\n━━━━━━━━━━━━━━━\n🐝 Nature\'s sweetest gift.\n📩 Wholesale inquiries.',
  /* 105 */'👤 The Paper Artist\n📄 Fold & Flow\n━━━━━━━━━━━━━━━\nArt:\n• Paper sculptures\n• Kirigami\n• Paper flowers\n━━━━━━━━━━━━━━━\n🌸 Turning sheets into worlds.\n📩 Commission a piece.'
];

/* ─────────────────────────────────────────────────────
   SECTION 2 — READY-MADE BIO RENDERER & TABS
   ───────────────────────────────────────────────────── */
const bioGrid   = document.getElementById('bioGrid');
const bioCount  = document.getElementById('bioCount');
const tabBtns   = document.querySelectorAll('.tab');

// Track which tab is currently active
var currentTab = 'boys';

/* Render a full set of bio cards into the grid */
function renderBios(arr) {
  // Wipe previous cards
  bioGrid.innerHTML = '';

  // Update count label
  bioCount.textContent = 'Showing ' + arr.length + ' bios';

  // Create a card for every bio
  arr.forEach(function (bioText, index) {
    // Wrapper card element
    var card = document.createElement('div');
    card.className = 'bio-card';
    // Staggered entrance: each card delays 40ms more than the last (capped at 1 s)
    var delay = Math.min(index * 0.04, 1);
    card.style.setProperty('--delay', delay + 's');

    // Index badge (top-right)
    var badge = document.createElement('span');
    badge.className = 'bio-card__index';
    badge.textContent = '#' + (index + 1);

    // Bio text block
    var textDiv = document.createElement('div');
    textDiv.className = 'bio-card__text';
    textDiv.textContent = bioText;   // pre-line whitespace handles \n

    // Footer with copy button
    var footer = document.createElement('div');
    footer.className = 'bio-card__footer';

    var copyBtn2 = document.createElement('button');
    copyBtn2.className = 'bio-card__copy';
    copyBtn2.innerHTML = '<span class="btn__icon">📋</span><span class="btn__text">Copy Bio</span>';

    // Copy handler — closure captures the correct bioText
    copyBtn2.addEventListener('click', (function (text, btn) {
      return function () {
        copyToClipboard(text, function () {
          // Brief "copied" visual state
          btn.classList.add('bio-card__copy--copied');
          btn.innerHTML = '<span class="btn__icon">✓</span><span class="btn__text">Copied!</span>';
          setTimeout(function () {
            btn.classList.remove('bio-card__copy--copied');
            btn.innerHTML = '<span class="btn__icon">📋</span><span class="btn__text">Copy Bio</span>';
          }, 1100);
          showToast();
        });
      };
    })(bioText, copyBtn2));

    footer.appendChild(copyBtn2);

    // Assemble card
    card.appendChild(badge);
    card.appendChild(textDiv);
    card.appendChild(footer);
    bioGrid.appendChild(card);
  });
}

/* Tab click handler (event delegation on the tab row) */
document.querySelector('.readymade__tabs').addEventListener('click', function (e) {
  var clicked = e.target.closest('.tab');
  if (!clicked) return;

  var tab = clicked.getAttribute('data-tab');
  if (tab === currentTab) return; // already active

  // Swap active class
  tabBtns.forEach(function (btn) { btn.classList.remove('tab--active'); });
  clicked.classList.add('tab--active');

  currentTab = tab;

  // Render the matching dataset
  renderBios(tab === 'boys' ? boysBios : girlsBios);

  // Scroll gently so top of grid is visible
  bioGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ─── Initial render (Boys tab is default) ───────── */
renderBios(boysBios);