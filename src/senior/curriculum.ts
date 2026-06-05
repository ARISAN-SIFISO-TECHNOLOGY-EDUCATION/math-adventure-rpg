// Senior Exam Studio curriculum (ages 15–17) — IGCSE / CAPS aligned.
// School identity (Builders → Systems → Thinkers) forms an upward arc:
//   15 build the foundations · 16 connect & analyse systems · 17 think abstractly.

export interface TopicCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;       // Tailwind bg class e.g. 'bg-teal'
  levels: number;
  hasTest: boolean;
}

export interface AgeGroup {
  age: number;
  school: string;
  subtitle: string;
  icon: string;
  color: string;
  locked: boolean;
  topics: TopicCard[];
  hasMockExam: boolean;
}

export const CURRICULUM: AgeGroup[] = [
  {
    age: 15,
    school: 'School of Builders',
    subtitle: 'IGCSE Core — Cambridge 0580 / 0607 / CAPS Grade 10',
    icon: '🌱',
    color: 'bg-teal',
    locked: false,
    hasMockExam: true,
    topics: [
      {
        id: 'age15-numbers',
        title: 'Numbers & Algebra I',
        subtitle: 'Surds · Indices · Quadratics · Sequences · Logs · Standard Form · Rounding · Log Laws',
        icon: '🔢',
        color: 'bg-teal',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-algebra',
        title: 'Algebra II',
        subtitle: 'Quadratic Formula · Simultaneous · Inequalities · Algebraic Fractions · Completing the Square · Linear+Quadratic',
        icon: '✏️',
        color: 'bg-sprout-purple',
        levels: 6,
        hasTest: true,
      },
      {
        id: 'age15-geometry',
        title: 'Geometry & Vectors',
        subtitle: 'Analytical Geo · Circle · Similarity · Vectors · Volume/SA · Sectors',
        icon: '📐',
        color: 'bg-sprout-blue',
        levels: 6,
        hasTest: true,
      },
      {
        id: 'age15-trig',
        title: 'Trigonometry',
        subtitle: 'SOH-CAH-TOA · Sine/Cosine Rule · Elevation · Bearings · 3D · Inverse Trig · ½ab sinC',
        icon: '📡',
        color: 'bg-sprout-orange',
        levels: 7,
        hasTest: true,
      },
      {
        id: 'age15-numeracy',
        title: 'Numeracy & Proportion',
        subtitle: 'Percentages · Reverse % · Ratio · Direct/Inverse Proportion · Speed-Distance-Time',
        icon: '💯',
        color: 'bg-sprout-gold',
        levels: 1,
        hasTest: true,
      },
      {
        id: 'age15-stats',
        title: 'Statistics',
        subtitle: 'Mean/Median/Mode · Box Plots · Grouped Data · Histograms · Scatter',
        icon: '📊',
        color: 'bg-sprout-green',
        levels: 3,
        hasTest: true,
      },
      {
        id: 'age15-prob',
        title: 'Probability & Finance',
        subtitle: 'Venn Diagrams · Tree Diagrams · Compound Interest',
        icon: '🎲',
        color: 'bg-sprout-pink',
        levels: 2,
        hasTest: true,
      },
      {
        id: 'age15-functions',
        title: 'Functions',
        subtitle: 'Domain/Range · Graphs & Transformations',
        icon: '🔀',
        color: 'bg-sprout-purple',
        levels: 2,
        hasTest: true,
      },
      {
        id: 'age15-matrices',
        title: 'Matrices & Transformations',
        subtitle: '2×2 Matrices · Geometric Transformations · Inverse Matrix',
        icon: '⬛',
        color: 'bg-sprout-blue',
        levels: 3,
        hasTest: true,
      },
    ],
  },
  {
    age: 16,
    school: 'School of Systems',
    subtitle: 'IGCSE Extended / A-Level AS — Cambridge 9709 / CAPS Grade 11',
    icon: '🚀',
    color: 'bg-sprout-purple',
    locked: false,
    hasMockExam: true,
    topics: [
      {
        id: 'age16-trig2',
        title: 'Advanced Trigonometry',
        subtitle: 'Identities · Equations · Radians · Pythagorean · Double Angle',
        icon: '🌊',
        color: 'bg-sprout-blue',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age16-calculus',
        title: 'Calculus',
        subtitle: 'First Principles · Differentiation · Tangents · Stationary Points · Integration',
        icon: '∫',
        color: 'bg-sprout-purple',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age16-exponential',
        title: 'Exponential Functions',
        subtitle: 'Growth & Decay · Solving Equations · Models',
        icon: '📈',
        color: 'bg-sprout-orange',
        levels: 3,
        hasTest: true,
      },
      {
        id: 'age16-algebra3',
        title: 'Algebra III',
        subtitle: 'Polynomial Division · Logs · Remainder & Factor · Binomial',
        icon: '🧮',
        color: 'bg-teal',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age16-functions2',
        title: 'Functions II',
        subtitle: 'Transformations · Inverse · Composite Functions',
        icon: '🔁',
        color: 'bg-sprout-pink',
        levels: 4,
        hasTest: true,
      },
      {
        id: 'age16-analytical-geo',
        title: 'Analytical Geometry II',
        subtitle: 'Equation of Line · Vectors · Perpendicular · Circle',
        icon: '📌',
        color: 'bg-sprout-green',
        levels: 4,
        hasTest: true,
      },
      {
        id: 'age16-stats2',
        title: 'Statistics II',
        subtitle: 'Standard Deviation · Conditional Prob · Variance · E(X)',
        icon: '📉',
        color: 'bg-sprout-gold',
        levels: 4,
        hasTest: true,
      },
    ],
  },
  {
    age: 17,
    school: 'School of Thinkers',
    subtitle: 'A-Level Pure Mathematics — Cambridge 9709',
    icon: '🏆',
    color: 'bg-sprout-gold',
    locked: true,
    hasMockExam: false,
    topics: [],
  },
];
