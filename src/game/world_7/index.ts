import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world7Level1 } from './level_1';
import { world7Level2 } from './level_2';
import { world7Level3 } from './level_3';
import { world7Level4 } from './level_4';
import { world7Level5 } from './level_5';

export const WORLD_7_LEVELS: LevelDefinition[] = [
  world7Level1,
  world7Level2,
  world7Level3,
  world7Level4,
  world7Level5,
];

export const WORLD_7: WorldDefinition = {
  id: 7,
  name: 'Chronos Realm',
  subtitle: 'Ancient Clocktowers, Forgotten Factories & Temporal Machinery',
  levels: WORLD_7_LEVELS,
};

export {
  world7Level1,
  world7Level2,
  world7Level3,
  world7Level4,
  world7Level5,
};
