import { LevelDefinition } from './types';
import { WORLD_1, WORLD_1_LEVELS } from './world_1';
import { WORLD_2, WORLD_2_LEVELS } from './world_2';
import { WORLD_3, WORLD_3_LEVELS } from './world_3';
import { WORLD_4, WORLD_4_LEVELS } from './world_4';
import { WORLD_5, WORLD_5_LEVELS } from './world_5';
import { WORLD_6, WORLD_6_LEVELS } from './world_6';
import { WORLD_7, WORLD_7_LEVELS } from './world_7';
import { WORLD_8, WORLD_8_LEVELS } from './world_8';
import { WORLD_9, WORLD_9_LEVELS } from './world_9';
import { WORLD_10, WORLD_10_LEVELS } from './world_10';

export interface WorldRegistryEntry {
  id: number;
  name: string;
  subtitle: string;
  levels: LevelDefinition[];
}

// Registry of all worlds
export const WORLDS: WorldRegistryEntry[] = [
  WORLD_1,
  WORLD_2,
  WORLD_3,
  WORLD_4,
  WORLD_5,
  WORLD_6,
  WORLD_7,
  WORLD_8,
  WORLD_9,
  WORLD_10,
];

// Flat list of all registered levels across all worlds
export const LEVELS: LevelDefinition[] = [
  ...WORLD_1_LEVELS,
  ...WORLD_2_LEVELS,
  ...WORLD_3_LEVELS,
  ...WORLD_4_LEVELS,
  ...WORLD_5_LEVELS,
  ...WORLD_6_LEVELS,
  ...WORLD_7_LEVELS,
  ...WORLD_8_LEVELS,
  ...WORLD_9_LEVELS,
  ...WORLD_10_LEVELS,
];

const WORLD_MAP = new Map<number, WorldRegistryEntry>(WORLDS.map((w) => [w.id, w]));
const LEVEL_MAP = new Map<number, LevelDefinition>(LEVELS.map((l) => [l.id, l]));

export function getWorldById(worldId: number): WorldRegistryEntry {
  return WORLD_MAP.get(worldId) || WORLDS[0];
}

export function getLevelById(id: number): LevelDefinition {
  return LEVEL_MAP.get(id) || LEVELS[0];
}

export * from './world_1';
export * from './world_2';
export * from './world_3';
export * from './world_4';
export * from './world_5';
export * from './world_6';
export * from './world_7';
export * from './world_8';
export * from './world_9';
export * from './world_10';


