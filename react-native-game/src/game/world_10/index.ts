import { LevelDefinition } from '../types';
import { buildWorld10Level1 } from './level_1';
import { buildWorld10Level2 } from './level_2';
import { buildWorld10Level3 } from './level_3';
import { buildWorld10Level4 } from './level_4';
import { buildWorld10Level5 } from './level_5';

export const WORLD_10_LEVELS: LevelDefinition[] = [
  buildWorld10Level1(),
  buildWorld10Level2(),
  buildWorld10Level3(),
  buildWorld10Level4(),
  buildWorld10Level5(),
];

export const WORLD_10 = {
  id: 10,
  name: 'Ancient Ruins',
  subtitle: 'Overgrown jungles, booby-trapped temples, and the Ancient Colossus',
  levels: WORLD_10_LEVELS,
};

export {
  buildWorld10Level1,
  buildWorld10Level2,
  buildWorld10Level3,
  buildWorld10Level4,
  buildWorld10Level5,
};
