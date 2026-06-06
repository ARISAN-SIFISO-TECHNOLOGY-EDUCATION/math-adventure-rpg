// Kids' RPG phase curriculum config (ages 3–12, phases 1–4).
//
// Extracted from Game.tsx so consumers that only need the static config (e.g.
// GrownUpCorner's replay picker) don't pull the whole ~2k-line Game component
// into their bundle — this lets App.tsx lazy-load Game without dragging it back
// into the eager marketing chunk.

export type PhaseConfig = {
  id: number;
  name: string;
  ageRange: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  levels: { n: number; topic: string }[];
};

export const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: 'Pre-School',
    ageRange: 'Ages 3–5',
    emoji: '🌱',
    bgColor: 'bg-[#FEF9C3]',
    borderColor: 'border-[#EAB308]',
    badgeBg: 'bg-[#FDE047]',
    levels: [
      { n: 1, topic: 'counting objects from 1 to 5' },
      { n: 2, topic: 'counting objects from 1 to 10' },
      { n: 3, topic: 'comparing two numbers — which is more or which is less' },
      { n: 4, topic: 'simple addition where the answer is 5 or less' },
      { n: 5, topic: 'simple subtraction where both numbers are 5 or less' },
      { n: 6, topic: 'subitizing — recognise a quantity at a glance' },
      { n: 7, topic: 'number bonds — find the missing part' },
      { n: 8, topic: 'counting objects from 11 to 20' },
      { n: 9, topic: 'identify shapes — circle, square, triangle, star' },
      { n: 10, topic: 'spot the pattern — what comes next?' },
      { n: 11, topic: 'sorting and classifying — find the one that does not belong' },
      { n: 12, topic: 'size comparison — bigger, longer, taller' },
      { n: 13, topic: 'identify 3D shapes — sphere, cube, cylinder, cone' },
      { n: 14, topic: 'counting backwards from 10' },
      { n: 15, topic: 'ordinal numbers — first, second, third, fourth' },
    ],
  },
  {
    id: 2,
    name: 'Lower Primary',
    ageRange: 'Ages 6–8',
    emoji: '📚',
    bgColor: 'bg-[#DCFCE7]',
    borderColor: 'border-[#22C55E]',
    badgeBg: 'bg-[#4ADE80]',
    levels: [
      // World 1 — Academy of Numbers
      { n: 6,  topic: 'addition with answers up to 20' },
      { n: 7,  topic: 'subtraction within 20' },
      { n: 8,  topic: 'addition and subtraction with numbers up to 100' },
      { n: 9,  topic: 'times tables for 2, 5, and 10' },
      { n: 10, topic: 'missing number problems such as ? + 4 = 11 or 7 − ? = 3' },
      // World 2 — Merchant's Guild
      { n: 11, topic: 'place value — identifying tens and units digits' },
      { n: 12, topic: 'money — counting coins and making change' },
      { n: 13, topic: 'time — reading clocks and calculating hours ahead' },
      { n: 14, topic: 'word problems involving addition and subtraction' },
      { n: 15, topic: 'doubles and halves of numbers' },
      // World 3 — Dragon's Tower
      { n: 16, topic: 'times tables for 3, 4, and 6' },
      { n: 17, topic: 'division by sharing equally' },
      { n: 18, topic: 'simple fractions — half, quarter, and three quarters' },
      { n: 19, topic: 'perimeter of rectangles and squares' },
      { n: 20, topic: 'multi-step word problems requiring two calculations' },
      // World 4 — Star Observatory
      { n: 21, topic: 'number patterns — complete sequences counting in 2s, 3s, 4s, 5s, or 10s' },
      { n: 22, topic: 'standard measurement — length in cm and m, mass in kg' },
      { n: 23, topic: 'data handling — read a pictograph and answer total, most popular, and difference questions' },
      { n: 24, topic: 'properties of 3D objects — faces, edges, and vertices of cubes, spheres, cylinders, and cones' },
      { n: 25, topic: 'expanded notation — value of a digit in a 3-digit number' },
    ],
  },
  {
    id: 3,
    name: 'Higher Primary',
    ageRange: 'Ages 9–12',
    emoji: '🔢',
    bgColor: 'bg-[#DBEAFE]',
    borderColor: 'border-[#3B82F6]',
    badgeBg: 'bg-[#60A5FA]',
    levels: [
      // World 1 — Merchant Republic
      { n: 1,  topic: 'long multiplication — 2-digit × 2-digit' },
      { n: 2,  topic: 'division with remainders — quotient and remainder' },
      { n: 3,  topic: 'decimal addition and subtraction (1 decimal place)' },
      { n: 4,  topic: 'percentages using the 10% anchor method' },
      { n: 5,  topic: 'multi-step money: change, discounts, and splitting bills' },
      // World 2 — Engineers' Citadel
      { n: 6,  topic: 'area of rectangles and squares in square metres' },
      { n: 7,  topic: 'simplifying fractions to lowest terms' },
      { n: 8,  topic: 'adding and subtracting fractions with unlike denominators' },
      { n: 9,  topic: 'ratio and proportion — scaling and map distances' },
      { n: 10, topic: 'combined area, fraction, and ratio problems' },
      // World 3 — Storm Observatory
      { n: 11, topic: 'negative integers — temperature changes and number lines' },
      { n: 12, topic: 'mean, median, and mode of data sets' },
      { n: 13, topic: 'algebraic equations — solve for the unknown n' },
      { n: 14, topic: 'advanced order of operations with brackets (BODMAS)' },
      { n: 15, topic: 'multi-step synthesis — algebra, data, and negative numbers' },
    ],
  },
  {
    id: 4,
    name: 'Advanced Primary',
    ageRange: 'Ages 11–12',
    emoji: '🧮',
    bgColor: 'bg-[#F3E8FF]',
    borderColor: 'border-[#A855F7]',
    badgeBg: 'bg-[#C084FC]',
    levels: [
      { n: 16, topic: 'adding and subtracting simple fractions' },
      { n: 17, topic: 'adding and subtracting decimal numbers to 2 decimal places' },
      { n: 18, topic: 'percentage change and reverse percentages' },
      { n: 19, topic: 'order of operations: BODMAS with squares and cubes' },
      { n: 20, topic: 'multi-step word problems requiring two or more calculations' },
      { n: 21, topic: 'volume of rectangular prisms — length × width × height' },
      { n: 22, topic: 'surface area of rectangular prisms — sum of all faces' },
      { n: 23, topic: 'angle relationships: supplementary, complementary, vertically opposite' },
      { n: 24, topic: 'triangle properties — angle sum, isosceles, exterior angles' },
      { n: 25, topic: 'combined geometry: volume, surface area, and angles' },
      { n: 26, topic: 'simple probability expressed as a fraction' },
      { n: 27, topic: 'expanding algebraic expressions and collecting like terms' },
      { n: 28, topic: 'linear equations with variables on both sides' },
      { n: 29, topic: 'arithmetic sequences — finding terms and missing values' },
      { n: 30, topic: 'final boss: geometry, probability, algebra, and sequences combined' },
    ],
  },
];
