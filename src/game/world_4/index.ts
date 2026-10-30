import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world4Level1 } from './level_1';
import { world4Level2 } from './level_2';
import { world4Level3 } from './level_3';
import { world4Level4 } from './level_4';
import { world4Level5 } from './level_5';

export const WORLD_4_LEVELS: LevelDefinition[] = [
  world4Level1,
  world4Level2,
  world4Level3,
  world4Level4,
  world4Level5,
];

export const WORLD_4: WorldDefinition = {
  id: 4,
  name: 'Frostfall Kingdom',
  subtitle: 'Snowy Peaks, Icy Caverns & Frostfang Castle',
  levels: WORLD_4_LEVELS,
};

export {
  world4Level1,
  world4Level2,
  world4Level3,
  world4Level4,
  world4Level5,
};
