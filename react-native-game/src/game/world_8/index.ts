import { LevelDefinition } from '../types';
import { buildWorld8Level1 } from './level_1';
import { buildWorld8Level2 } from './level_2';
import { buildWorld8Level3 } from './level_3';
import { buildWorld8Level4 } from './level_4';
import { buildWorld8Level5 } from './level_5';

export const WORLD_8_LEVELS: LevelDefinition[] = [
  buildWorld8Level1(),
  buildWorld8Level2(),
  buildWorld8Level3(),
  buildWorld8Level4(),
  buildWorld8Level5(),
];

export const WORLD_8 = {
  id: 8,
  name: 'Shadowveil Kingdom',
  subtitle: 'Haunted forests, spectral manors, and the Shadow King',
  levels: WORLD_8_LEVELS,
};

export {
  buildWorld8Level1,
  buildWorld8Level2,
  buildWorld8Level3,
  buildWorld8Level4,
  buildWorld8Level5,
};
