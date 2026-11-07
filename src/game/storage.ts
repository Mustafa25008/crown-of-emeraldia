import { SaveProgress } from './types';

const STORAGE_KEY = 'crown_of_emeraldia_save_v1';

const DEFAULT_SAVE: SaveProgress = {
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SAVE,
        highScores: {},
        bestCoins: {},
      };
    }
    const parsed = JSON.parse(raw);
    const loaded: SaveProgress = {
      unlockedLevel: Math.max(1, Math.min(50, Number(parsed.unlockedLevel) || 1)),
      highScores: sanitizeNumericMap(parsed.highScores),
      bestCoins: sanitizeNumericMap(parsed.bestCoins),
      totalCoinsCollected: Math.max(0, Math.floor(Number(parsed.totalCoinsCollected) || 0)),
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
      volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.7,
    };
    lastSavedJson = serializeCompact(loaded);
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
    const serialized = serializeCompact(progress);
    if (serialized === lastSavedJson) return;
    localStorage.setItem(STORAGE_KEY, serialized);
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
  const fresh: SaveProgress = {
    ...DEFAULT_SAVE,
    highScores: {},
    bestCoins: {},
  };
  saveProgress(fresh);
  return fresh;
}
