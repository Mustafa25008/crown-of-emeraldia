import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world3Level1 } from './level_1';
import { world3Level2 } from './level_2';
import { world3Level3 } from './level_3';
import { world3Level4 } from './level_4';
import { world3Level5 } from './level_5';

export const WORLD_3_LEVELS: LevelDefinition[] = [
  world3Level1,
  world3Level2,
  world3Level3,
  world3Level4,
  world3Level5,
];

export const WORLD_3: WorldDefinition = {
  id: 3,
  name: 'Sunscorch Desert',
  subtitle: 'Golden Dunes, Ancient Temples & Sunken Pyramid',
  levels: WORLD_3_LEVELS,
};

export {
  world3Level1,
  world3Level2,
  world3Level3,
  world3Level4,
  world3Level5,
};
