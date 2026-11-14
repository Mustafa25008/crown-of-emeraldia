import { LevelDefinition } from '../types';
import { buildWorld9Level1 } from './level_1';
import { buildWorld9Level2 } from './level_2';
import { buildWorld9Level3 } from './level_3';
import { buildWorld9Level4 } from './level_4';
import { buildWorld9Level5 } from './level_5';

export const WORLD_9_LEVELS: LevelDefinition[] = [
  buildWorld9Level1(),
  buildWorld9Level2(),
  buildWorld9Level3(),
  buildWorld9Level4(),
  buildWorld9Level5(),
];

export const WORLD_9 = {
  id: 9,
  name: 'Crystal Caverns',
  subtitle: 'Bioluminescent mines, prism labyrinths, and the Crystal Guardian',
  levels: WORLD_9_LEVELS,
};

export {
  buildWorld9Level1,
  buildWorld9Level2,
  buildWorld9Level3,
  buildWorld9Level4,
  buildWorld9Level5,
};
