import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world6Level1 } from './level_1';
import { world6Level2 } from './level_2';
import { world6Level3 } from './level_3';
import { world6Level4 } from './level_4';
import { world6Level5 } from './level_5';

export const WORLD_6_LEVELS: LevelDefinition[] = [
  world6Level1,
  world6Level2,
  world6Level3,
  world6Level4,
  world6Level5,
];

export const WORLD_6: WorldDefinition = {
  id: 6,
  name: 'Celestia Kingdom',
  subtitle: 'Floating Sky Islands, Ancient Temples & Celestial Palace',
  levels: WORLD_6_LEVELS,
};

export {
  world6Level1,
  world6Level2,
  world6Level3,
  world6Level4,
  world6Level5,
};
