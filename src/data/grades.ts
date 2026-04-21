export type GradeConfig = {
  phase: number;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  badge: string;
  ages: string;
  levels: number;
  description: string;
  topics: string[];
  detailLink: string;
  playLink: string;
  tip: string;
};

export const GRADES: GradeConfig[] = [
  {
    phase: 1,
    emoji: '🌱',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#6EE7B7',
    badge: 'Pre-School',
    ages: 'Ages 3–5',
    levels: 10,
    description: 'Counting, comparing, shapes, patterns & simple sums — perfect first steps.',
    topics: ['Counting 1–10', 'More or less', 'Addition within 5', 'Shapes & patterns'],
    detailLink: '/preschool',
    playLink: '/play?phase=1',
    tip: 'Sit with your child and read each question aloud.',
  },
  {
    phase: 2,
    emoji: '📚',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    badge: 'Lower Primary',
    ages: 'Ages 6–8',
    levels: 15,
    description: '3 worlds, 15 levels — numbers, money, time, multiplication, fractions & more.',
    topics: ['Numbers & operations', 'Money, time & place value', 'Multiply & divide', 'Fractions & perimeter'],
    detailLink: '/lower-primary',
    playLink: '/play?phase=2',
    tip: 'Let them try independently — stay nearby to celebrate!',
  },
  {
    phase: 3,
    emoji: '⚔️',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    badge: 'Higher Primary',
    ages: 'Ages 9–12',
    levels: 15,
    description: '3 worlds, 15 levels — multiplication, decimals, fractions, ratio, algebra & data.',
    topics: ['Commerce maths', 'Area & fractions', 'Data & algebra', '3 boss battles'],
    detailLink: '/higher-primary',
    playLink: '/play?phase=3',
    tip: 'Give them space — check in after each level.',
  },
  {
    phase: 4,
    emoji: '🏆',
    color: '#9F1239',
    bg: '#FFF1F2',
    border: '#FECDD3',
    badge: 'Advanced Primary',
    ages: 'Ages 11–12',
    levels: 5,
    description: 'Decimals, percentages, order of operations, and multi-step word problems.',
    topics: ['Fractions & decimals', 'Percentages', 'Order of operations (BODMAS)', 'Word problems'],
    detailLink: '/advanced-primary',
    playLink: '/play?phase=4',
    tip: 'They can play fully independently at this stage.',
  },
];
