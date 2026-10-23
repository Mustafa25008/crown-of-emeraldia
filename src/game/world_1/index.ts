import { LevelDefinition } from '../types';
import { level1 } from './level_1';
import { level2 } from './level_2';
import { level3 } from './level_3';
import { level4 } from './level_4';
import { level5 } from './level_5';

export interface WorldDefinition {
  id: number;
  name: string;
  subtitle: string;
  levels: LevelDefinition[];
}

export const WORLD_1_LEVELS: LevelDefinition[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
];

export const WORLD_1: WorldDefinition = {
  id: 1,
  name: 'WORLD 1',
  subtitle: 'Emeraldia Kingdom',
  levels: WORLD_1_LEVELS,
};

export {
  level1,
  level2,
  level3,
  level4,
  level5,
};
