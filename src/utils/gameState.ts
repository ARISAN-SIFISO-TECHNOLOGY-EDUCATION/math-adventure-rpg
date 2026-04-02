export type GameState = 'START' | 'MAP' | 'BATTLE' | 'VICTORY' | 'GAMEOVER';

export type Monster = {
  name: string;
  hp: number;
  maxHp: number;
  image: string;
  color: string;
};

export const MONSTERS: Monster[] = [
  { name: 'Slimey', hp: 30, maxHp: 30, image: '🟢', color: 'bg-green-400' },
  { name: 'Fire Bat', hp: 50, maxHp: 50, image: '🦇', color: 'bg-red-400' },
  { name: 'Stone Golem', hp: 80, maxHp: 80, image: '🗿', color: 'bg-gray-400' },
];
