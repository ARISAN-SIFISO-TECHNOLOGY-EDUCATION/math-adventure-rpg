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
    levels: 15,
    description: 'Counting, comparing, shapes, patterns, 3D objects & size comparison — perfect first steps.',
    topics: ['Counting 1–10', 'More or less', 'Addition within 5', 'Shapes & patterns', '3D shapes & size'],
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
    levels: 20,
    description: '4 worlds, 20 levels — numbers, money, patterns, data & expanded notation.',
    topics: ['Numbers & operations', 'Money, time & place value', 'Multiply & divide', 'Patterns, data & measurement'],
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
    levels: 15,
    description: '3 worlds, 15 levels — fractions, geometry, probability, algebra & sequences.',
    topics: ['Fractions, decimals & percentages', 'Volume, surface area & angles', 'Probability & algebra', '3 boss battles'],
    detailLink: '/advanced-primary',
    playLink: '/play?phase=4',
    tip: 'They can play fully independently at this stage.',
  },
  {
    phase: 5,
    emoji: '🧠',
    color: '#4338CA',
    bg: '#EEF2FF',
    border: '#A5B4FC',
    badge: 'Secondary',
    ages: 'Ages 13–14',
    levels: 15,
    description: '3 worlds, 15 levels — algebra, Pythagoras, parallel lines, probability & data.',
    topics: ['Algebra & equations', 'Pythagoras & geometry', 'Probability & statistics', '3 boss battles'],
    detailLink: '/secondary',
    playLink: '/play?phase=5',
    tip: 'Challenge them — Grade 8–9 content, secondary school ready.',
  },
];
