import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world2Level1 } from './level_1';
import { world2Level2 } from './level_2';
import { world2Level3 } from './level_3';
import { world2Level4 } from './level_4';
import { world2Level5 } from './level_5';

export const WORLD_2_LEVELS: LevelDefinition[] = [
  world2Level1,
  world2Level2,
  world2Level3,
  world2Level4,
  world2Level5,
];

export const WORLD_2: WorldDefinition = {
  id: 2,
  name: 'WORLD 2',
  subtitle: 'Sapphire Ocean',
  levels: WORLD_2_LEVELS,
};

export {
  world2Level1,
  world2Level2,
  world2Level3,
  world2Level4,
  world2Level5,
};
