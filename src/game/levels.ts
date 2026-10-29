import { LevelDefinition } from './types';
import { WORLD_1, WORLD_1_LEVELS } from './world_1';
import { WORLD_2, WORLD_2_LEVELS } from './world_2';
import { WORLD_3, WORLD_3_LEVELS } from './world_3';

export interface WorldRegistryEntry {
  id: number;
  name: string;
  subtitle: string;
  levels: LevelDefinition[];
}

// Registry of all worlds - easily extendable by importing future worlds (e.g., world_4)
export const WORLDS: WorldRegistryEntry[] = [
  WORLD_1,
  WORLD_2,
  WORLD_3,
];

// Flat list of all registered levels across all worlds
export const LEVELS: LevelDefinition[] = [
  ...WORLD_1_LEVELS,
  ...WORLD_2_LEVELS,
  ...WORLD_3_LEVELS,
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


