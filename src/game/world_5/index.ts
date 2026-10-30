import { LevelDefinition } from '../types';
import { WorldDefinition } from '../world_1';
import { world5Level1 } from './level_1';
import { world5Level2 } from './level_2';
import { world5Level3 } from './level_3';
import { world5Level4 } from './level_4';
import { world5Level5 } from './level_5';

export const WORLD_5_LEVELS: LevelDefinition[] = [
  world5Level1,
  world5Level2,
  world5Level3,
  world5Level4,
  world5Level5,
];

export const WORLD_5: WorldDefinition = {
  id: 5,
  name: 'Inferno Kingdom',
  subtitle: 'Active Volcanoes, Molten Caverns & Inferno Citadel',
  levels: WORLD_5_LEVELS,
};

export {
  world5Level1,
  world5Level2,
  world5Level3,
  world5Level4,
  world5Level5,
};
