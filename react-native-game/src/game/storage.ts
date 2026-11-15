import { SaveProgress } from './types';

export const STORAGE_KEY = 'crown_of_emeraldia_save_v1';
export const STORAGE_KEY_V2 = 'crown_of_emeraldia_save_v2';

export const DEFAULT_SAVE: SaveProgress = {
  unlockedLevel: 1,
  highScores: {},
  bestCoins: {},
  totalCoinsCollected: 0,
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
};

let lastSavedJson = '';
let debounceTimer: number | null = null;

function sanitizeNumericMap(rawMap: unknown): Record<number, number> {
  const clean: Record<number, number> = {};
  if (!rawMap || typeof rawMap !== 'object') return clean;
  for (const [k, v] of Object.entries(rawMap as Record<string, unknown>)) {
    const id = Number(k);
    const num = Number(v);
    if (Number.isInteger(id) && id >= 1 && num > 0) {
      clean[id] = Math.floor(num);
    }
  }
  return clean;
}

/**
 * Non-destructively merges two SaveProgress objects so unlocked stages, high scores,
 * best coins, and total coins collected can NEVER be downgraded or accidentally overwritten.
 */
export function mergeSaveProgress(
  base: SaveProgress,
  incoming?: Partial<SaveProgress> | null
): SaveProgress {
  if (!incoming || typeof incoming !== 'object') {
    return {
      ...base,
      highScores: sanitizeNumericMap(base.highScores),
      bestCoins: sanitizeNumericMap(base.bestCoins),
    };
  }

  const baseHighScores = sanitizeNumericMap(base.highScores);
  const incHighScores = sanitizeNumericMap(incoming.highScores);
  const mergedHighScores: Record<number, number> = { ...baseHighScores };
  for (const [k, v] of Object.entries(incHighScores)) {
    const id = Number(k);
    mergedHighScores[id] = Math.max(mergedHighScores[id] || 0, v);
  }

  const baseBestCoins = sanitizeNumericMap(base.bestCoins);
  const incBestCoins = sanitizeNumericMap(incoming.bestCoins);
  const mergedBestCoins: Record<number, number> = { ...baseBestCoins };
  for (const [k, v] of Object.entries(incBestCoins)) {
    const id = Number(k);
    mergedBestCoins[id] = Math.max(mergedBestCoins[id] || 0, v);
  }

  const baseUnlocked = Math.max(1, Math.min(50, Number(base.unlockedLevel) || 1));
  const incUnlocked = Math.max(1, Math.min(50, Number(incoming.unlockedLevel) || 1));

  // Also infer minimum unlocked level from completed stages in mergedHighScores / mergedBestCoins
  let highestCompletedStage = 0;
  for (const idStr of Object.keys(mergedHighScores)) {
    const id = Number(idStr);
    if (mergedHighScores[id] > 0 && id > highestCompletedStage) {
      highestCompletedStage = id;
    }
  }
  for (const idStr of Object.keys(mergedBestCoins)) {
    const id = Number(idStr);
    if (mergedBestCoins[id] > 0 && id > highestCompletedStage) {
      highestCompletedStage = id;
    }
  }
  const inferredUnlocked = highestCompletedStage > 0 ? Math.min(50, highestCompletedStage + 1) : 1;

  const baseTotalCoins = Math.max(0, Math.floor(Number(base.totalCoinsCollected) || 0));
  const incTotalCoins = Math.max(0, Math.floor(Number(incoming.totalCoinsCollected) || 0));

  return {
    unlockedLevel: Math.max(baseUnlocked, incUnlocked, inferredUnlocked),
    highScores: mergedHighScores,
    bestCoins: mergedBestCoins,
    totalCoinsCollected: Math.max(baseTotalCoins, incTotalCoins),
    soundEnabled:
      typeof incoming.soundEnabled === 'boolean'
        ? incoming.soundEnabled
        : typeof base.soundEnabled === 'boolean'
        ? base.soundEnabled
        : true,
    musicEnabled:
      typeof incoming.musicEnabled === 'boolean'
        ? incoming.musicEnabled
        : typeof base.musicEnabled === 'boolean'
        ? base.musicEnabled
        : true,
    volume:
      typeof incoming.volume === 'number' && Number.isFinite(incoming.volume)
        ? Math.max(0, Math.min(1, incoming.volume))
        : typeof base.volume === 'number' && Number.isFinite(base.volume)
        ? Math.max(0, Math.min(1, base.volume))
        : 0.7,
  };
}

function parseRawSave(raw: string | null): Partial<SaveProgress> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<SaveProgress>;
  } catch {
    return null;
  }
}

function serializeCompact(progress: SaveProgress): string {
  return JSON.stringify({
    unlockedLevel: progress.unlockedLevel,
    highScores: sanitizeNumericMap(progress.highScores),
    bestCoins: sanitizeNumericMap(progress.bestCoins),
    totalCoinsCollected: progress.totalCoinsCollected,
    soundEnabled: progress.soundEnabled,
    musicEnabled: progress.musicEnabled,
    volume: Number(progress.volume.toFixed(2)),
  });
}

export function loadProgress(): SaveProgress {
  try {
    const rawV1 = localStorage.getItem(STORAGE_KEY);
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    const parsedV1 = parseRawSave(rawV1);
    const parsedV2 = parseRawSave(rawV2);

    if (!parsedV1 && !parsedV2) {
      return {
        ...DEFAULT_SAVE,
        highScores: {},
        bestCoins: {},
      };
    }

    const baseSave: SaveProgress = {
      ...DEFAULT_SAVE,
      highScores: {},
      bestCoins: {},
    };
    const mergedV1 = mergeSaveProgress(baseSave, parsedV1);
    const loaded = mergeSaveProgress(mergedV1, parsedV2);

    const serialized = serializeCompact(loaded);
    lastSavedJson = serialized;
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY_V2, serialized);
    return loaded;
  } catch {
    return {
      ...DEFAULT_SAVE,
      highScores: {},
      bestCoins: {},
    };
  }
}

export function saveProgress(progress: SaveProgress): void {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  try {
    // Non-destructive guard: always merge with any existing stored progress in localStorage
    // so an unhydrated mount state can never overwrite higher saved progress
    const existingV1 = parseRawSave(localStorage.getItem(STORAGE_KEY));
    const existingV2 = parseRawSave(localStorage.getItem(STORAGE_KEY_V2));
    let safeProgress = mergeSaveProgress(
      { ...DEFAULT_SAVE, highScores: {}, bestCoins: {} },
      existingV1
    );
    safeProgress = mergeSaveProgress(safeProgress, existingV2);
    safeProgress = mergeSaveProgress(safeProgress, progress);

    const serialized = serializeCompact(safeProgress);
    if (serialized === lastSavedJson) return;
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY_V2, serialized);
    lastSavedJson = serialized;
  } catch {
    // Ignore storage quota errors
  }
}

export function saveProgressDebounced(progress: SaveProgress, delayMs: number = 150): void {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;
    saveProgress(progress);
  }, delayMs);
}

export function recordLevelCompletion(
  current: SaveProgress,
  levelId: number,
  score: number,
  coins: number
): SaveProgress {
  const nextUnlocked = Math.min(50, Math.max(current.unlockedLevel, levelId + 1));
  const prevBestScore = current.highScores[levelId] || 0;
  const prevBestCoins = current.bestCoins[levelId] || 0;
  const bestScore = Math.max(prevBestScore, score);
  const bestCoinCount = Math.max(prevBestCoins, coins);

  const nextHighScores = { ...current.highScores };
  if (bestScore > 0) nextHighScores[levelId] = bestScore;

  const nextBestCoins = { ...current.bestCoins };
  if (bestCoinCount > 0) nextBestCoins[levelId] = bestCoinCount;

  const updated: SaveProgress = {
    ...current,
    unlockedLevel: nextUnlocked,
    highScores: nextHighScores,
    bestCoins: nextBestCoins,
    totalCoinsCollected: current.totalCoinsCollected + coins,
  };

  saveProgress(updated);
  return updated;
}

export function resetAllProgress(): SaveProgress {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  const fresh: SaveProgress = {
    ...DEFAULT_SAVE,
    highScores: {},
    bestCoins: {},
  };
  try {
    const serialized = serializeCompact(fresh);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY_V2, serialized);
    lastSavedJson = serialized;
  } catch {
    // Ignore storage errors
  }
  return fresh;
}
