import { LevelDefinition } from './types';
import { WORLD_1, WORLD_1_LEVELS } from './world_1';
import { WORLD_2, WORLD_2_LEVELS } from './world_2';
import { WORLD_3, WORLD_3_LEVELS } from './world_3';
import { WORLD_4, WORLD_4_LEVELS } from './world_4';
import { WORLD_5, WORLD_5_LEVELS } from './world_5';

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
];

// Flat list of all registered levels across all worlds
export const LEVELS: LevelDefinition[] = [
  ...WORLD_1_LEVELS,
  ...WORLD_2_LEVELS,
  ...WORLD_3_LEVELS,
  ...WORLD_4_LEVELS,
  ...WORLD_5_LEVELS,
];

export function getWorldById(worldId: number): WorldRegistryEntry {
  const found = WORLDS.find((w) => w.id === worldId);
  return found || WORLDS[0];
}

export function getLevelById(id: number): LevelDefinition {
  const found = LEVELS.find((l) => l.id === id);
  return found || LEVELS[0];
}

export * from './world_1';
export * from './world_2';
export * from './world_3';
export * from './world_4';
export * from './world_5';
