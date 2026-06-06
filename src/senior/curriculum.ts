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
        subtitle: 'Quadratic Formula · Simultaneous · Inequalities · Algebraic Fractions · Completing the Square · Linear+Quadratic · Change of Subject · Factor by Grouping',
        icon: '✏️',
        color: 'bg-sprout-purple',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-geometry',
        title: 'Geometry & Vectors',
        subtitle: 'Analytical Geo · Circle · Similarity · Vectors · Volume/SA · Sectors · Polygon Angles · Similar Area/Volume',
        icon: '📐',
        color: 'bg-sprout-blue',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-trig',
        title: 'Trigonometry',
        subtitle: 'SOH-CAH-TOA · Sine/Cosine Rule · Elevation · Bearings · 3D · Inverse Trig · ½ab sinC · Exact Values',
        icon: '📡',
        color: 'bg-sprout-orange',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-numeracy',
        title: 'Numeracy & Proportion',
        subtitle: 'Percentages · % Change · Reverse % · Ratio Sharing · Direct Proportion · Inverse Proportion · Speed-Distance-Time · Unit Conversion',
        icon: '💯',
        color: 'bg-sprout-gold',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-stats',
        title: 'Statistics',
        subtitle: 'Mean/Median/Mode · Box Plots · Grouped Data · Frequency Tables · Scatter & Correlation · Stem-and-Leaf · Range · Comparing Data',
        icon: '📊',
        color: 'bg-sprout-green',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-prob',
        title: 'Probability & Finance',
        subtitle: 'Venn Diagrams · Compound Interest · Single Events · Tree Diagrams · Mutually Exclusive · Independent Events · Simple Interest · Expected Frequency',
        icon: '🎲',
        color: 'bg-sprout-pink',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-functions',
        title: 'Functions',
        subtitle: 'Evaluate/Composite/Inverse · Graphs · Domain & Range · Graph Types · Line from 2 Points · Turning Point · Solving f(x)=k · Transformations',
        icon: '🔀',
        color: 'bg-sprout-purple',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age15-matrices',
        title: 'Matrices & Transformations',
        subtitle: 'Transformations · Multiply/Determinant · Inverse Matrix · Add/Subtract · Scalar × · Identity · Matrix Equations · Transformation Matrices',
        icon: '⬛',
        color: 'bg-sprout-blue',
        levels: 8,
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
        subtitle: 'Identities · Equations · Radians · Pythagorean · Double Angle · Graphs · Interval Solutions · Reciprocal Ratios',
        icon: '🌊',
        color: 'bg-sprout-blue',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-calculus',
        title: 'Calculus',
        subtitle: 'First Principles · Differentiation · Tangents · Stationary Points · Integration · Gradient at a Point · Normals · Rates of Change',
        icon: '∫',
        color: 'bg-sprout-purple',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-exponential',
        title: 'Exponential Functions',
        subtitle: 'Growth & Decay · Solving Equations · Models · Graph Properties · Population Growth · Half-Life · Log Form · Doubling Time',
        icon: '📈',
        color: 'bg-sprout-orange',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-algebra3',
        title: 'Algebra III',
        subtitle: 'Polynomial Division · Logs · Remainder & Factor · Binomial · Solving Cubics · Binomial Coefficients · Log Equations',
        icon: '🧮',
        color: 'bg-teal',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-functions2',
        title: 'Functions II',
        subtitle: 'Transformations · Inverse · Composite · Solve for Input · Domain & Range · Composite Expressions · Self-Inverse · Piecewise',
        icon: '🔁',
        color: 'bg-sprout-pink',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-analytical-geo',
        title: 'Analytical Geometry II',
        subtitle: 'Equation of Line · Vectors · Perpendicular · Circle · Midpoint & Distance · Parallel Lines · Centre & Radius · Tangent Length',
        icon: '📌',
        color: 'bg-sprout-green',
        levels: 8,
        hasTest: true,
      },
      {
        id: 'age16-stats2',
        title: 'Statistics II',
        subtitle: 'Standard Deviation · Conditional Prob · Variance · E(X) · Probability Distributions · Combinations · Permutations · Counting Principle',
        icon: '📉',
        color: 'bg-sprout-gold',
        levels: 8,
        hasTest: true,
      },
    ],
  },
  {
    age: 17,
    school: 'School of Thinkers',
    subtitle: 'A-Level Pure Mathematics — Cambridge 9709 / CAPS Grade 12',
    icon: '🏆',
    color: 'bg-sprout-gold',
    locked: false,
    hasMockExam: true,
    topics: [
      {
        id: 'age17-diff',
        title: 'Differentiation',
        subtitle: 'Chain Rule · Product Rule · Second Derivative · Stationary Nature · Optimisation',
        icon: '📉',
        color: 'bg-sprout-purple',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age17-int',
        title: 'Integration',
        subtitle: 'Definite Integrals · Area Under Curve · Reverse Chain · Polynomials · Evaluation',
        icon: '∫',
        color: 'bg-teal',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age17-series',
        title: 'Sequences & Series',
        subtitle: 'Arithmetic Sum · Geometric Sum · Sum to Infinity · Find Term · Sigma Notation',
        icon: '🔢',
        color: 'bg-sprout-blue',
        levels: 5,
        hasTest: true,
      },
      {
        id: 'age17-trig3',
        title: 'Trigonometry III',
        subtitle: 'Solving Equations · Compound Angles · Exact Radians · Simplifying',
        icon: '📐',
        color: 'bg-sprout-orange',
        levels: 4,
        hasTest: true,
      },
      {
        id: 'age17-logexp',
        title: 'Logs & Exponentials',
        subtitle: 'ln Laws · Solving Logs · Log-Law Equations · Change of Base',
        icon: '📈',
        color: 'bg-sprout-green',
        levels: 4,
        hasTest: true,
      },
      {
        id: 'age17-func3',
        title: 'Functions',
        subtitle: 'Composite · Inverse · Modulus Equations · Domain & Range',
        icon: '🔀',
        color: 'bg-sprout-pink',
        levels: 4,
        hasTest: true,
      },
      {
        id: 'age17-algebra4',
        title: 'Algebra & Proof',
        subtitle: 'Partial Fractions · Binomial Coefficients · Factorising Cubics',
        icon: '🧮',
        color: 'bg-sprout-gold',
        levels: 3,
        hasTest: true,
      },
    ],
  },
];
