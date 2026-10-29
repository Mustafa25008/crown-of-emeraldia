import { SaveProgress } from './types';

const STORAGE_KEY = 'crown_of_emeraldia_save_v1';

const DEFAULT_SAVE: SaveProgress = {
  unlockedLevel: 1,
  highScores: {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
  },
  bestCoins: {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
  },
  totalCoinsCollected: 0,
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
};

export function loadProgress(): SaveProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: Math.max(1, Math.min(15, Number(parsed.unlockedLevel) || 1)),
      highScores: { ...DEFAULT_SAVE.highScores, ...(parsed.highScores || {}) },
      bestCoins: { ...DEFAULT_SAVE.bestCoins, ...(parsed.bestCoins || {}) },
      totalCoinsCollected: Number(parsed.totalCoinsCollected) || 0,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
      volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.7,
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveProgress(progress: SaveProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordLevelCompletion(
  current: SaveProgress,
  levelId: number,
  score: number,
  coins: number
): SaveProgress {
  const nextUnlocked = Math.min(15, Math.max(current.unlockedLevel, levelId + 1));
  const prevBestScore = current.highScores[levelId] || 0;
  const prevBestCoins = current.bestCoins[levelId] || 0;

  const updated: SaveProgress = {
    ...current,
    unlockedLevel: nextUnlocked,
    highScores: {
      ...current.highScores,
      [levelId]: Math.max(prevBestScore, score),
    },
    bestCoins: {
      ...current.bestCoins,
      [levelId]: Math.max(prevBestCoins, coins),
    },
    totalCoinsCollected: current.totalCoinsCollected + coins,
  };

  saveProgress(updated);
  return updated;
}

export function resetAllProgress(): SaveProgress {
  const fresh = { ...DEFAULT_SAVE };
  saveProgress(fresh);
  return fresh;
}
