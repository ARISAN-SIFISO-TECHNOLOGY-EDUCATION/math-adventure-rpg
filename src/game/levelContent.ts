// Kids' RPG level content: tutorial slides, per-phase level intros, hints,
// world groupings, badges, the parental-gate problems, and the getHint/
// isBossLevel helpers. Pure data + pure functions, extracted from Game.tsx
// to keep the component focused on behaviour.

// --- Pre-School Tutorial Data ---
export const TUTORIAL_SLIDES = [
  {
    emoji: '👾',
    title: 'Meet Your Monster!',
    body: 'This hungry monster needs YOUR help to grow strong!',
    bg: 'bg-[#FEF9C3]',
  },
  {
    emoji: '🎮',
    title: 'How to Play',
    body: 'A question will appear. Look at the answers and CHOOSE the right one!',
    bg: 'bg-[#DCFCE7]',
  },
  {
    emoji: '⭐',
    title: 'Count Carefully',
    body: 'Count each object one by one. Take your time — there is no rush!',
    bg: 'bg-[#DBEAFE]',
  },
  {
    emoji: '🏆',
    title: 'Earn Coins!',
    body: 'Every correct answer earns a coin. Get 5 right to level up!',
    bg: 'bg-[#F3E8FF]',
  },
  {
    emoji: '🚀',
    title: "Let's Go!",
    body: "You're ready! Feed your monster and become a Math Hero!",
    bg: 'bg-[#FFE4E6]',
  },
];

export const LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  1:  { emoji: '🔢', title: 'Counting 1 to 5',    body: 'Count the objects and choose the right number.', tip: 'Point at each one as you count!' },
  2:  { emoji: '🌟', title: 'Counting up to 10',  body: 'Now we count even more objects!', tip: 'Take it slow — count every single one.' },
  3:  { emoji: '⚖️', title: 'More or Less',        body: 'Look at two numbers and pick the BIGGER one.', tip: 'Think: which number would be more sweets?' },
  4:  { emoji: '➕', title: 'Adding Together',     body: 'Put two groups together and count them all.', tip: 'Count the first group, then keep counting!' },
  5:  { emoji: '➖', title: 'Taking Away',          body: 'Start with a number and take some away.', tip: 'Count what is left after taking away.' },
  6:  { emoji: '⚡', title: 'Quick Count!',         body: 'Objects flash on screen — see how many without counting one by one!', tip: 'Trust your eyes — how many at once?' },
  7:  { emoji: '🧩', title: 'Missing Part',         body: 'One part of the sum is missing. Blocks will help you find it!', tip: 'Count all blocks, then count the known ones.' },
  8:  { emoji: '🔟', title: 'Counting to 20!',     body: 'Now we count all the way to 20 — you can do it!', tip: 'Try counting in groups of 5 to keep track.' },
  9:  { emoji: '🔷', title: 'Shape Explorer',      body: 'Look at the shape and choose its name!', tip: 'Think about how many sides or corners it has.' },
  10: { emoji: '🎨', title: 'Pattern Detective',   body: 'Spot what repeats and choose what comes next!', tip: 'Say the pattern out loud to hear the rhythm.' },
  11: { emoji: '🗂️', title: 'Sort it Out!',         body: 'Find the one that does NOT belong!',            tip: 'Look carefully — what makes one different?' },
  12: { emoji: '📏', title: 'Big or Small?',          body: 'Compare two things — which one wins?',          tip: 'Think about size, length, or how tall!' },
  13: { emoji: '📦', title: '3D Shape Explorer',      body: 'These shapes are all around us in real life!',  tip: 'A ball is a sphere. A box is a cube!' },
  14: { emoji: '⏪', title: 'Count Backwards!',       body: 'Start from the top and count back down!',       tip: 'Start at 10 and go: 10, 9, 8…' },
  15: { emoji: '🥇', title: 'First, Second, Third…',  body: 'Who is 1st? Who is 2nd? Who is 3rd?',          tip: '1st means first in the line — at the front!' },
};

export const PHASE1_HINTS: Record<number, string> = {
  1:  '👆 Count each object carefully!',
  2:  '👆 Count every one — up to 10!',
  3:  '👆 Choose the BIGGER number!',
  4:  '👆 Add them together!',
  5:  '👆 How many are left?',
  6:  '⚡ Trust your eyes — don\'t count one by one!',
  7:  '🧩 Count the blocks to find the missing part!',
  8:  '👆 Count carefully all the way to 20!',
  9:  '🔷 How many sides does it have?',
  10: '🎨 What is the repeating pattern?',
  11: '🗂️ Which one looks different from the rest?',
  12: '📏 Look carefully — which is bigger or longer?',
  13: '📦 Is it a ball, a box, a tin, or a cone?',
  14: '⏪ Count backwards: 10, 9, 8… what fits the gap?',
  15: '🥇 Count from the front: 1st, 2nd, 3rd…',
};

export const P2_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  // World 1 — Academy of Numbers
  1:  { emoji: '🏫', title: 'Welcome to the Academy!',   body: 'Add numbers up to 20 to defeat the gate guardians.',   tip: 'Count on from the bigger number!' },
  2:  { emoji: '➖', title: 'Subtraction Siege',          body: 'Take away to weaken the enemies!',                      tip: 'Count backwards from the bigger number.' },
  3:  { emoji: '💯', title: 'The Hundred Challenge',      body: 'Add and subtract numbers all the way to 100!',          tip: 'Break big numbers into tens to make it easier.' },
  4:  { emoji: '✖️', title: 'Times Table Training',       body: 'Master the ×2, ×5, and ×10 tables to unlock power-ups!', tip: 'Skip-count: 5, 10, 15, 20…' },
  5:  { emoji: '❓', title: 'The Missing Number',         body: 'Find the hidden number to solve the puzzle!',           tip: 'Think: what do I add to get the total?' },
  // World 2 — Merchant's Guild
  6:  { emoji: '🏪', title: 'Enter the Merchant\'s Guild!', body: 'Understand place value — tens and units are your coins and gems!', tip: 'The first digit tells you HOW MANY tens.' },
  7:  { emoji: '💰', title: 'Money Mastery',              body: 'Count coins, make change — the guild rewards sharp traders!', tip: 'Work out the total, then find the difference.' },
  8:  { emoji: '⏰', title: 'Time Keeper',                body: 'Tell the time and calculate hours ahead!',              tip: 'Count forward on a clock: 8 → 9 → 10…' },
  9:  { emoji: '📖', title: 'Story Problems',             body: 'Real-world word problems — read carefully and choose the right operation!', tip: 'Find the KEY words: "more", "left", "altogether".' },
  10: { emoji: '🪞', title: 'Doubles & Halves',           body: 'Double and halve numbers — these are your secret weapons!', tip: 'Half means split equally into TWO groups.' },
  // World 3 — Dragon's Tower
  11: { emoji: '🐉', title: 'Dragon\'s Tower Awaits!',   body: 'Multiply with ×3, ×4, and ×6 to storm the tower!',     tip: 'Use what you know: 4×6 = double 2×6!' },
  12: { emoji: '⚔️', title: 'Division Dragon',           body: 'Share numbers equally to defeat the dragon\'s riddles!', tip: 'Division is just multiplication in reverse.' },
  13: { emoji: '🍕', title: 'Fraction Fortress',         body: 'Find halves and quarters of numbers — split the treasure!', tip: 'Half = divide by 2. Quarter = divide by 4.' },
  14: { emoji: '📐', title: 'Perimeter Puzzle',          body: 'Calculate the perimeter — add up ALL the sides of the shape!', tip: 'Perimeter = all sides added together.' },
  15: { emoji: '🏆', title: 'FINAL BOSS: Word Problems', body: 'Two-step word problems — read, plan, then calculate!',  tip: 'Do one calculation at a time — no rushing!' },
  // World 4 — Star Observatory
  16: { emoji: '🌟', title: 'Star Observatory Awaits!',  body: 'Spot the pattern and fill the missing number!',          tip: 'Count the gap between numbers — that is your step!' },
  17: { emoji: '📏', title: 'Measuring Up',              body: 'Length and mass — use the right unit to solve it!',      tip: 'cm for short things; m for long things; kg for mass.' },
  18: { emoji: '📊', title: 'Data Detective',            body: 'Read the chart and answer questions about the data!',    tip: 'Count the ☺ symbols, then multiply by the key.' },
  19: { emoji: '📦', title: '3D Shape Master',           body: 'Explore faces, edges, and corners of 3D shapes!',       tip: 'Run your finger along each edge — count carefully!' },
  20: { emoji: '🌟', title: 'FINAL BOSS: Star Keeper!', body: 'Expanded notation — show the value of every digit!',    tip: '356 = 300 + 50 + 6. Each place has its own value.' },
};

export const P2_HINTS: Record<number, string> = {
  1:  '➕ Start from the bigger number and count up!',
  2:  '➖ Start from the bigger number and count down!',
  3:  '💯 Break into tens and units to make it easier!',
  4:  '✖️ Skip-count to find the answer!',
  5:  '❓ Think: what makes the total correct?',
  6:  '🔢 Which digit is in the tens place?',
  7:  '💰 Total cost first, then find the change!',
  8:  '⏰ Count the hours forward on the clock!',
  9:  '📖 Look for keywords: "altogether", "left", "more".',
  10: '🪞 Double means ×2. Half means ÷2.',
  11: '✖️ Use a known fact to help!',
  12: '➗ How many groups fit into the total?',
  13: '🍕 Half = ÷2. Quarter = ÷4.',
  14: '📐 Add ALL four sides of the shape!',
  15: '🏆 Solve one step at a time!',
  16: '🌟 What is the gap between each number?',
  17: '📏 Subtract to find the difference; add to find the total.',
  18: '📊 Count ☺ symbols × the key number.',
  19: '📦 Flat sides = faces. Lines where sides meet = edges. Corners = vertices.',
  20: '🌟 Hundreds, tens, units — each digit has its own place value.',
};

// Sub-world boundaries for Phase 2 (levelInPhase → world name + color)
export const P2_WORLDS = [
  { levels: [1, 2, 3, 4, 5],      name: 'Academy of Numbers', emoji: '🏫', color: '#2563EB', bgHex: '#EFF6FF', bg: 'bg-[#EFF6FF]', badge: 'bg-[#93C5FD]' },
  { levels: [6, 7, 8, 9, 10],     name: "Merchant's Guild",   emoji: '🏪', color: '#D97706', bgHex: '#FFFBEB', bg: 'bg-[#FFFBEB]', badge: 'bg-[#FCD34D]' },
  { levels: [11, 12, 13, 14, 15], name: "Dragon's Tower",     emoji: '🐉', color: '#DC2626', bgHex: '#FEF2F2', bg: 'bg-[#FEF2F2]', badge: 'bg-[#FCA5A5]' },
  { levels: [16, 17, 18, 19, 20], name: 'Star Observatory',   emoji: '🌟', color: '#7C3AED', bgHex: '#F5F3FF', bg: 'bg-[#F5F3FF]', badge: 'bg-[#C4B5FD]' },
];

// ─── Phase 3 constants ────────────────────────────────────────────────────────

export const P3_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  // World 1 — Merchant Republic
  1:  { emoji: '🏦', title: 'Welcome to the Merchant Republic!', body: 'Master big multiplication to dominate the marketplace.', tip: 'Try 23×14 = 23×10 + 23×4 — split it up!' },
  2:  { emoji: '➗', title: 'Division with Remainders',          body: 'Not every number divides perfectly — find what is left over!', tip: 'Quotient × divisor + remainder = the original.' },
  3:  { emoji: '🔢', title: 'Decimal Duels',                    body: 'Add and subtract decimal numbers — every decimal place counts!', tip: 'Line up the decimal point before calculating.' },
  4:  { emoji: '%',  title: 'Percentage Power',                 body: 'Find 10% first — then scale up or down. The merchant method!', tip: '10% = divide by 10. 20% = double of 10%.' },
  5:  { emoji: '👑', title: 'BOSS: The Guild Master!',          body: 'Multi-step money challenges. Change, discounts, split bills — all at once!', tip: 'One step at a time. Total first, then adjust.' },
  // World 2 — Engineers' Citadel
  6:  { emoji: '🏗️', title: "Enter the Engineers' Citadel!",  body: 'Area — how many square metres fill the space? Not the same as perimeter!', tip: 'Area = length × width. Perimeter = 2×(l+w).' },
  7:  { emoji: '➗', title: 'Fraction Files',                   body: 'Simplify fractions — find the smallest equivalent form.', tip: 'Divide both top and bottom by the same number.' },
  8:  { emoji: '🧮', title: 'Fraction Fusion',                  body: 'Add and subtract fractions with DIFFERENT denominators.', tip: 'Convert to a common denominator first!' },
  9:  { emoji: '⚖️', title: 'Ratio & Proportion',              body: 'Scale ratios up or down — the citadel needs exact measurements!', tip: 'If ratio is 2:3 and you multiply one part, multiply the other.' },
  10: { emoji: '👷', title: 'BOSS: Chief Architect!',          body: 'Combined challenge — area, fractions, and ratios together!', tip: 'Solve each part separately, then combine the results.' },
  // World 3 — Storm Observatory
  11: { emoji: '🌩️', title: 'Welcome to the Storm Observatory!', body: 'Negative numbers — below zero exists in science, finance, and nature.', tip: 'Use a number line. Going left means getting smaller.' },
  12: { emoji: '📊', title: 'Data Storm',                       body: 'Find the mean, median, and mode of data sets.', tip: 'Mean = total ÷ count. Median = middle. Mode = most common.' },
  13: { emoji: '🔣', title: 'Algebra Alert',                    body: 'Solve equations — find the hidden value of n!', tip: 'Do the OPPOSITE operation to isolate n on one side.' },
  14: { emoji: '⚙️', title: 'BODMAS Battle',                   body: 'Brackets first, then × and ÷, then + and −. Order matters!', tip: 'B → O → D → M → A → S. Never skip steps.' },
  15: { emoji: '🌩️', title: 'FINAL BOSS: Storm Warden!',      body: 'The ultimate synthesis — everything from all three worlds!', tip: 'Read carefully, plan your steps, then calculate.' },
};

export const P3_HINTS: Record<number, string> = {
  1:  '✖️ Split: 23×14 = 23×10 + 23×4.',
  2:  '➗ Quotient × divisor + remainder = original.',
  3:  '🔢 Line up the decimal point before calculating.',
  4:  '% Find 10% first, then scale up or down.',
  5:  '💰 Total first — then find change or apply discount.',
  6:  '📐 Area = l × w. Don\'t confuse with perimeter!',
  7:  '➗ Divide top AND bottom by the same number.',
  8:  '🧮 Common denominator first!',
  9:  '⚖️ Multiply BOTH parts of the ratio by the same factor.',
  10: '🏗️ Solve each part separately.',
  11: '🌡️ Number line: left = smaller, right = bigger.',
  12: '📊 Sort the values first to find the median.',
  13: '🔣 Use the opposite operation to find n.',
  14: '⚙️ Brackets first, then × ÷, then + −.',
  15: '🌩️ Break it into steps — check each one.',
};

export const P3_WORLDS = [
  { levels: [1, 2, 3, 4, 5],     name: 'Merchant Republic',  emoji: '🏦', color: '#0EA5E9', bgHex: '#F0F9FF', bg: 'bg-[#F0F9FF]', badge: 'bg-[#7DD3FC]' },
  { levels: [6, 7, 8, 9, 10],    name: "Engineers' Citadel", emoji: '🏗️', color: '#16A34A', bgHex: '#F0FDF4', bg: 'bg-[#F0FDF4]', badge: 'bg-[#86EFAC]' },
  { levels: [11, 12, 13, 14, 15], name: 'Storm Observatory', emoji: '🌩️', color: '#7C3AED', bgHex: '#F5F3FF', bg: 'bg-[#F5F3FF]', badge: 'bg-[#C4B5FD]' },
];

// ─── Phase 4 constants ────────────────────────────────────────────────────────

export const P4_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  // World 1 — The Pinnacle
  1: { emoji: '🏔️', title: 'Welcome to The Pinnacle!',           body: 'Master complex fraction operations — the hardest math yet!',           tip: 'Find a common denominator before adding or subtracting.' },
  2: { emoji: '🔢', title: 'Decimal Mastery',                     body: 'Two decimal places and multiplication — precision is everything!',     tip: 'Count the total decimal places in your answer.' },
  3: { emoji: '📈', title: 'Percentage Challenges',                body: 'Percentage change and reverse percentages — the language of finance!',  tip: 'Change ÷ original × 100 gives you % change.' },
  4: { emoji: '🧮', title: 'BODMAS + Exponents',                  body: 'Squares and cubes inside complex expressions — secondary school ready!', tip: 'Exponents come BEFORE multiply and divide.' },
  5: { emoji: '👑', title: 'BOSS: The Pinnacle Guardian!',         body: 'Multi-step synthesis — every Pinnacle skill at once!',                 tip: 'Plan your steps before calculating.' },
  // World 2 — The Geometry Forge
  6:  { emoji: '📦', title: 'Enter the Geometry Forge!',          body: 'Volume — how much space does a 3D shape fill? Length × width × height!', tip: 'Volume = l × w × h. Don\'t confuse with area!' },
  7:  { emoji: '🎁', title: 'Surface Area',                       body: 'How much material wraps a box? Add up ALL the faces!',                  tip: 'SA = 2(lw + lh + wh). Six faces, three pairs.' },
  8:  { emoji: '📐', title: 'Angle Relationships',                body: 'Supplementary, complementary, vertically opposite — angles have rules!', tip: 'Supplementary = 180°. Complementary = 90°.' },
  9:  { emoji: '🔺', title: 'Triangle Properties',                body: 'All triangles\' angles add to 180°. Isosceles and equilateral have extra rules!', tip: 'Three angles always sum to 180°.' },
  10: { emoji: '⚙️', title: 'BOSS: The Chief Geometer!',         body: 'Volume, surface area, and angles — all in one forge challenge!',        tip: 'One calculation at a time.' },
  // World 3 — The Summit Academy
  11: { emoji: '🎲', title: 'Welcome to the Summit Academy!',     body: 'Probability — how likely is an event? Express as a fraction!',          tip: 'P = favourable outcomes ÷ total outcomes.' },
  12: { emoji: '🔡', title: 'Expand & Simplify',                  body: 'Algebra: expand brackets and collect like terms!',                      tip: 'a(b + c) = ab + ac. Multiply every term inside.' },
  13: { emoji: '⚖️', title: 'Equations Both Sides',              body: 'Variables on both sides — move them all to one side first!',            tip: 'Do the same operation to BOTH sides.' },
  14: { emoji: '📊', title: 'Arithmetic Sequences',               body: 'Find patterns in sequences — spot the common difference!',              tip: 'nth term = first term + (n−1) × difference.' },
  15: { emoji: '🏆', title: 'FINAL BOSS: The Summit Guardian!',   body: 'The ultimate challenge — geometry, algebra, probability, and sequences!', tip: 'Read carefully. Solve one step at a time.' },
};

export const P4_HINTS: Record<number, string> = {
  1:  '🔢 Find a common denominator first!',
  2:  '💰 Count decimal places in your final answer.',
  3:  '📈 % change = (change ÷ original) × 100.',
  4:  '🧮 Exponents first, then × ÷, then + −.',
  5:  '👑 Take it one step at a time!',
  6:  '📦 Volume = l × w × h.',
  7:  '🎁 SA = 2(lw + lh + wh). Six faces, three pairs.',
  8:  '📐 Supplementary = 180°. Complementary = 90°.',
  9:  '🔺 Angles in a triangle always sum to 180°.',
  10: '⚙️ Solve each part separately, then combine.',
  11: '🎲 P = favourable ÷ total outcomes.',
  12: '🔡 Multiply every term inside the bracket.',
  13: '⚖️ Move all x terms to one side first.',
  14: '📊 nth term = first + (n−1) × difference.',
  15: '🏆 One step at a time — you\'ve got this!',
};

export const P4_WORLDS = [
  { levels: [1, 2, 3, 4, 5],     name: 'The Pinnacle',        emoji: '🏔️', color: '#9F1239', bgHex: '#FFF1F2', bg: 'bg-[#FFF1F2]', badge: 'bg-[#FECDD3]' },
  { levels: [6, 7, 8, 9, 10],    name: 'The Geometry Forge',  emoji: '⚙️', color: '#0369A1', bgHex: '#F0F9FF', bg: 'bg-[#F0F9FF]', badge: 'bg-[#BAE6FD]' },
  { levels: [11, 12, 13, 14, 15], name: 'The Summit Academy', emoji: '🏆', color: '#7C3AED', bgHex: '#F5F3FF', bg: 'bg-[#F5F3FF]', badge: 'bg-[#C4B5FD]' },
];


// ─── Badge System ─────────────────────────────────────────────────────────────
export const BADGES: { id: string; emoji: string; label: string; desc: string }[] = [
  { id: 'phase1_complete', emoji: '🌱', label: 'Sprout',           desc: 'Complete Pre-School'       },
  { id: 'phase2_complete', emoji: '📚', label: 'Scholar',          desc: 'Complete Lower Primary'    },
  { id: 'phase3_complete', emoji: '🗺️', label: 'Navigator',        desc: 'Complete Higher Primary'   },
  { id: 'phase4_complete', emoji: '🏆', label: 'Legend',           desc: 'Master all 4 phases'       },
  { id: 'boss_slayer',     emoji: '💀', label: 'Boss Slayer',      desc: 'Defeat your first boss'    },
  { id: 'streak_3',        emoji: '🔥', label: 'Hot Streak',       desc: 'Play 3 days in a row'      },
  { id: 'streak_7',        emoji: '🔥🔥','label': 'On Fire!',      desc: 'Play 7 days in a row'      },
  { id: 'coins_100',       emoji: '🪙', label: 'Century',          desc: 'Earn 100 lifetime coins'   },
  { id: 'coins_500',       emoji: '💰', label: 'Treasure Hoarder', desc: 'Earn 500 lifetime coins'   },
  { id: 'consolation_5',   emoji: '💪', label: 'Resilient',        desc: 'Collect 5 consolation coins'},
];

export function getHint(phase: number, levelInPhase: number): string {
  if (phase === 1) return PHASE1_HINTS[levelInPhase] ?? '';
  if (phase === 2) return P2_HINTS[levelInPhase] ?? '';
  if (phase === 3) return P3_HINTS[levelInPhase] ?? '';
  if (phase === 4) return P4_HINTS[levelInPhase] ?? '';
  return '';
}

export const isBossLevel = (p: number, lip: number): boolean => p >= 2 && [5, 10, 15, 20].includes(lip);

export const PARENTAL_GATE_PROBLEMS = [
  { question: '(14 + 22) ÷ 4 = ?', answer: 9 },
  { question: '7 × 8 − 16 = ?', answer: 40 },
  { question: '144 ÷ 12 = ?', answer: 12 },
  { question: '(25 − 7) × 3 = ?', answer: 54 },
  { question: '3² + 4² = ?', answer: 25 },
];
