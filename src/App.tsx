import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Heart,
  Coins,
  Shield,
  Flame,
  Sparkles,
  Lock,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Skull,
  Crown,
  Settings,
  HelpCircle,
  Map,
  ChevronRight,
  Feather,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { GameState, HudSnapshot, PowerState, SaveProgress } from './game/types';
import { LEVELS, WORLDS, getLevelById, getWorldById } from './game/levels';
import { loadProgress, saveProgress, recordLevelCompletion, resetAllProgress } from './game/storage';
import { soundManager } from './game/audio';
import { PlatformerEngine, CANVAS_WIDTH, CANVAS_HEIGHT } from './game/engine';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [saveData, setSaveData] = useState<SaveProgress>(() => loadProgress());
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [carriedScore, setCarriedScore] = useState<number>(0);
  const [carriedCoins, setCarriedCoins] = useState<number>(0);
  const [carriedLives, setCarriedLives] = useState<number>(3);
  const [carriedPower, setCarriedPower] = useState<PowerState>('SMALL');
  const [runRestartCounter, setRunRestartCounter] = useState<number>(0);
  const [activeVirtualKeys, setActiveVirtualKeys] = useState<Record<string, boolean>>({});
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [dismissPortraitWarning, setDismissPortraitWarning] = useState<boolean>(false);

  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    coins: 0,
    lives: 3,
    levelId: 1,
    levelName: LEVELS[0].name,
    powerState: 'SMALL',
    isInvincibleStar: false,
    starTimeRemaining: 0,
    checkpointReached: false,
    boss: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);

  // Sync audio settings with SoundManager
  useEffect(() => {
    soundManager.updateSettings(saveData.soundEnabled, saveData.musicEnabled, saveData.volume);
  }, [saveData.soundEnabled, saveData.musicEnabled, saveData.volume]);

  // Detect mobile portrait orientation and guide user to landscape mode
  useEffect(() => {
    const checkOrientation = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth <= 860 || window.innerHeight <= 860;
      setIsPortraitMobile(hasTouch && isPortrait && isSmallScreen);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const requestLandscapeFullscreen = useCallback(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (
        'screen' in window &&
        'orientation' in window.screen &&
        'lock' in (window.screen.orientation as any)
      ) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {
      // Graceful fallback for browsers without orientation lock support
    }
  }, []);

  const navigateToMenu = useCallback((targetState: GameState) => {
    soundManager.stopMusic();
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    setGameState(targetState);
  }, []);

  const startLevel = useCallback(
    (levelId: number, resetRunStats: boolean = false) => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      const level = getLevelById(levelId);
      setCurrentLevelId(levelId);
      setSelectedWorldId(level.worldId || (levelId > 10 ? 3 : levelId > 5 ? 2 : 1));

      if (resetRunStats) {
        setCarriedScore(0);
        setCarriedCoins(0);
        setCarriedLives(3);
        setCarriedPower('SMALL');
      }

      setGameState('PLAYING');
      setRunRestartCounter((c) => c + 1);
      soundManager.playMusic(level.musicTrack);
    },
    []
  );

  // Mount PlatformerEngine when starting or restarting a level
  useEffect(() => {
    if (runRestartCounter === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const level = getLevelById(currentLevelId);

    const engine = new PlatformerEngine(
      ctx,
      level,
      carriedScore,
      carriedCoins,
      carriedLives,
      carriedPower,
      {
        onHudUpdate: (snapshot) => {
          setHud(snapshot);
          setCarriedPower(snapshot.powerState);
          setCarriedLives(snapshot.lives);
        },
        onLevelComplete: (finalScore, finalCoins) => {
          soundManager.stopMusic();
          setCarriedScore(finalScore);
          setCarriedCoins(finalCoins);
          setSaveData((prev) => recordLevelCompletion(prev, level.id, finalScore, finalCoins));
          setGameState((prev) => {
            if (prev !== 'PLAYING' && prev !== 'PAUSED') return prev;
            return level.id === 5 || level.id === 10 || level.id === 15
              ? 'WORLD_VICTORY'
              : 'LEVEL_COMPLETE';
          });
        },
        onGameOver: (finalScore, finalCoins) => {
          soundManager.stopMusic();
          setCarriedScore(finalScore);
          setCarriedCoins(finalCoins);
          setGameState((prev) => {
            if (prev !== 'PLAYING' && prev !== 'PAUSED') return prev;
            return 'GAME_OVER';
          });
        },
        onPauseToggle: () => {
          setGameState((prev) => {
            if (prev !== 'PLAYING' && prev !== 'PAUSED') return prev;
            const next = prev === 'PLAYING' ? 'PAUSED' : 'PLAYING';
            if (engineRef.current) {
              engineRef.current.setPaused(next === 'PAUSED');
            }
            return next;
          });
        },
      }
    );

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelId, runRestartCounter]);

  // Sync pause and teardown state with engine when gameState changes
  useEffect(() => {
    const isMenuScreen =
      gameState === 'TITLE_MENU' ||
      gameState === 'WORLD_SELECT' ||
      gameState === 'LEVEL_SELECT' ||
      gameState === 'SETTINGS_HUB' ||
      gameState === 'CONTROLS' ||
      gameState === 'SETTINGS';

    if (isMenuScreen && engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
      return;
    }

    if (engineRef.current) {
      engineRef.current.setPaused(gameState !== 'PLAYING');
    }
  }, [gameState]);

  const toggleSound = () => {
    setSaveData((prev) => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      saveProgress(updated);
      return updated;
    });
  };

  const toggleMusic = () => {
    setSaveData((prev) => {
      const updated = { ...prev, musicEnabled: !prev.musicEnabled };
      saveProgress(updated);
      return updated;
    });
  };

  const handleVolumeChange = (val: number) => {
    setSaveData((prev) => {
      const updated = { ...prev, volume: val };
      saveProgress(updated);
      return updated;
    });
  };

  const handleResetSave = () => {
    const fresh = resetAllProgress();
    setSaveData(fresh);
  };

  const handleVirtualInput = useCallback((code: string, pressed: boolean) => {
    engineRef.current?.setVirtualKey(code, pressed);
    setActiveVirtualKeys((prev) => {
      if (!!prev[code] === pressed) return prev;
      return { ...prev, [code]: pressed };
    });
  }, []);

  const bindVirtualButton = (code: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      handleVirtualInput(code, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleVirtualInput(code, false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleVirtualInput(code, false);
    },
    onContextMenu: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    },
  });

  const totalBestScore = Object.values(saveData.highScores).reduce((a, b) => a + b, 0);
  const completedStagesCount = Object.values(saveData.highScores).filter((score) => score > 0).length;
  const activeWorld = getWorldById(selectedWorldId);
  const currentLevelDef = getLevelById(currentLevelId);

  const isStageUnlocked = (lvlId: number): boolean => {
    if (lvlId === 1 || lvlId === 6 || lvlId === 11) return true;
    const prevHigh = saveData.highScores[lvlId - 1] || 0;
    const prevCoins = saveData.bestCoins[lvlId - 1] || 0;
    if (prevHigh > 0 || prevCoins > 0) return true;
    if (lvlId <= 5) {
      return lvlId <= Math.min(5, saveData.unlockedLevel);
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* MOBILE PORTRAIT ROTATE PROMPT (Ensures mobile gameplay is in landscape) */}
      {isPortraitMobile && !dismissPortraitWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-5">
            {/* Animated Rotating Phone Graphic */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping opacity-35" />
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-amber-400/40 flex items-center justify-center shadow-inner">
                <Smartphone className="w-10 h-10 text-amber-400 transition-transform duration-700 animate-pulse -rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 tracking-wider">
                <Crown className="w-4 h-4" />
                <span>LANDSCAPE ORIENTATION REQUIRED</span>
              </div>
              <h2 className="font-pixel text-sm sm:text-base text-white leading-relaxed">
                PLEASE ROTATE YOUR DEVICE
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                Crown of Emeraldia is designed for widescreen landscape play. Turn your phone horizontally for the full 16-bit retro arcade experience!
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                type="button"
                onClick={requestLandscapeFullscreen}
                className="w-full min-h-[46px] py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Enter Fullscreen Landscape</span>
              </button>

              <button
                type="button"
                onClick={() => setDismissPortraitWarning(true)}
                className="w-full min-h-[38px] py-1.5 px-3 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Continue in Portrait Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:px-4 sm:py-6 landscape:p-1 max-w-full overflow-x-hidden">
        {/* 1. CLASSIC GAME HOME SCREEN (Mobile App & Retro Title Screen Feel) */}
        {gameState === 'TITLE_MENU' && (
          <div className="relative w-full max-w-4xl min-h-[360px] sm:min-h-[520px] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
            {/* Pixel Art Scenery Backdrop (Clouds, Sun, Hills, Ground, and Hero Sprite) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Pixel Sun */}
              <div className="absolute top-8 right-10 w-16 h-16 bg-amber-300 border-4 border-amber-200 shadow-lg" />

              {/* Pixel Clouds */}
              <div className="absolute top-10 left-12 w-24 h-8 bg-white/90 shadow-sm" />
              <div className="absolute top-6 left-16 w-14 h-6 bg-white/90" />

              <div className="absolute top-20 left-1/2 -translate-x-12 w-28 h-8 bg-white/85" />
              <div className="absolute top-16 left-1/2 -translate-x-6 w-16 h-6 bg-white/85" />

              <div className="absolute top-14 right-36 w-20 h-7 bg-white/90" />

              {/* Distant Pixel Hills */}
              <div className="absolute bottom-16 -left-10 w-72 h-40 bg-emerald-700 rounded-t-3xl border-t-4 border-emerald-500" />
              <div className="absolute bottom-16 left-48 w-96 h-52 bg-emerald-600 rounded-t-3xl border-t-4 border-emerald-400" />
              <div className="absolute bottom-16 right-20 w-80 h-36 bg-emerald-700 rounded-t-3xl border-t-4 border-emerald-500" />

              {/* Classic Question & Brick Blocks Floating */}
              <div className="hidden sm:flex absolute bottom-44 left-14 items-center">
                <div className="w-10 h-10 bg-orange-700 border-2 border-amber-950 flex items-center justify-center" />
                <div className="w-10 h-10 bg-amber-400 border-2 border-amber-900 flex items-center justify-center font-pixel text-xs text-amber-950">
                  ?
                </div>
                <div className="w-10 h-10 bg-orange-700 border-2 border-amber-950 flex items-center justify-center" />
              </div>

              {/* Classic Green Pipe on Right */}
              <div className="hidden sm:flex flex-col items-center absolute bottom-16 right-16">
                <div className="w-16 h-6 bg-emerald-500 border-2 border-emerald-950" />
                <div className="w-14 h-16 bg-emerald-600 border-x-2 border-emerald-950" />
              </div>

              {/* Ground Tiles */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-amber-900 border-t-8 border-emerald-500" />
            </div>

            {/* Top Status Strip inside Game Screen */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-5 text-xs font-mono-num text-slate-900 font-bold">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-900/15">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>TOP SCORE: {totalBestScore.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-900/15">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>COINS: {saveData.totalCoinsCollected}</span>
              </div>
            </div>

            {/* Center Classic wooden/stone Signboard Title & Mobile App Vertical Buttons */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 text-center">
              <div className="bg-slate-950/90 border-4 border-amber-400 rounded-2xl px-6 py-6 md:px-10 md:py-7 shadow-2xl max-w-xl w-full">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold tracking-widest mb-2">
                  <Crown className="w-4 h-4" />
                  <span>16-BIT EDITION</span>
                </div>
                <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-white leading-snug tracking-tight drop-shadow">
                  CROWN OF EMERALDIA
                </h1>
                <p className="text-xs sm:text-sm text-emerald-300 mt-2 font-medium">
                  Super Kingdom Platformer Adventure
                </p>
              </div>

              {/* Primary Vertical Action Stack: Play Button & Settings Button Below It */}
              <div className="mt-8 flex flex-col items-center gap-3.5 w-full max-w-xs">
                <button
                  onClick={() => navigateToMenu('WORLD_SELECT')}
                  className="w-full min-h-[54px] py-3.5 px-8 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-pixel text-base rounded-2xl border-b-4 border-emerald-700 shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>PLAY</span>
                </button>

                <button
                  onClick={() => navigateToMenu('SETTINGS_HUB')}
                  className="w-full min-h-[50px] py-3 px-8 bg-slate-900/95 hover:bg-slate-800 active:scale-[0.98] text-slate-100 font-pixel text-xs rounded-2xl border-b-4 border-slate-950 shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>SETTINGS</span>
                </button>
              </div>
            </div>

            {/* Bottom Ground Footer Note */}
            <div className="relative z-10 h-16 flex items-center justify-center px-6 text-xs font-mono-num text-amber-100/90">
              <span>STAGE PROGRESS: {completedStagesCount} / {LEVELS.length} COMPLETED</span>
            </div>
          </div>
        )}

        {/* 2. COMPACT WORLD SELECT SCREEN */}
        {gameState === 'WORLD_SELECT' && (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <button
                onClick={() => navigateToMenu('TITLE_MENU')}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <h2 className="font-pixel text-sm sm:text-base text-white text-center">
                SELECT WORLD
              </h2>
              <div className="w-16 hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WORLDS.map((world) => {
                const worldCompletedCount = world.levels.filter(
                  (l) => (saveData.highScores[l.id] || 0) > 0 || (saveData.bestCoins[l.id] || 0) > 0
                ).length;
                const worldScore = world.levels.reduce(
                  (sum, l) => sum + (saveData.highScores[l.id] || 0),
                  0
                );
                const isOceanWorld = world.id === 2;
                const isDesertWorld = world.id === 3;

                return (
                  <button
                    key={world.id}
                    onClick={() => {
                      setSelectedWorldId(world.id);
                      navigateToMenu('LEVEL_SELECT');
                    }}
                    className={`w-full bg-slate-950 border-2 ${
                      isDesertWorld
                        ? 'border-amber-500/70 hover:border-amber-400'
                        : isOceanWorld
                        ? 'border-cyan-500/70 hover:border-cyan-400'
                        : 'border-emerald-500/70 hover:border-emerald-400'
                    } active:scale-[0.98] rounded-xl p-5 text-center space-y-2.5 transition-all cursor-pointer shadow-lg`}
                  >
                    <div className="font-pixel text-base text-white">WORLD {world.id}</div>
                    <div className="text-xs font-semibold text-slate-300">{world.name}</div>
                    <div className="text-[11px] text-slate-400">{world.subtitle}</div>
                    <div
                      className={`text-xs font-mono-num font-semibold ${
                        isDesertWorld
                          ? 'text-amber-400'
                          : isOceanWorld
                          ? 'text-cyan-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {worldCompletedCount}/{world.levels.length} STAGES
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-xs font-mono-num text-slate-300">
                      World Score: {worldScore.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. LEVEL SELECTION SCREEN (Appears after selecting World 1 or World 2) */}
        {gameState === 'LEVEL_SELECT' && (
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateToMenu('WORLD_SELECT')}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Worlds</span>
                </button>
                <h2 className="font-pixel text-base md:text-xl text-white">
                  WORLD {activeWorld.id}: {activeWorld.name.toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => navigateToMenu('TITLE_MENU')}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Home Screen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {activeWorld.levels.map((lvl, idx) => {
                const stageNum = lvl.stageNumber || idx + 1;
                const worldNum = lvl.worldId || activeWorld.id;
                const isUnlocked = isStageUnlocked(lvl.id);
                const highScore = saveData.highScores[lvl.id] || 0;
                const bestCoins = saveData.bestCoins[lvl.id] || 0;
                const isCompleted = highScore > 0 || bestCoins > 0;

                const buttonLabel = !isUnlocked
                  ? 'Locked'
                  : isCompleted
                  ? 'Play Again'
                  : 'Play Now';

                const cleanTitle = lvl.name
                  .replace(`Level ${lvl.id}: `, '')
                  .replace(`Stage ${worldNum}-${stageNum}: `, '');

                return (
                  <div
                    key={lvl.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                      isUnlocked
                        ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/60'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono-num">
                        <span>
                          STAGE {worldNum}-{stageNum}
                        </span>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <h3 className="font-bold text-base text-white">{cleanTitle}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{lvl.subtitle}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
                      <div className="text-xs text-slate-400 font-mono-num flex items-center justify-between">
                        <span>High: {highScore.toLocaleString()}</span>
                        <span>·</span>
                        <span>Coins: {bestCoins}</span>
                      </div>

                      <button
                        disabled={!isUnlocked}
                        onClick={() => startLevel(lvl.id, true)}
                        className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isUnlocked
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SETTINGS HUB PAGE (Opens when clicking Settings on Home Screen, showing Audio Card & Help Card) */}
        {gameState === 'SETTINGS_HUB' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <button
                onClick={() => navigateToMenu('TITLE_MENU')}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <h2 className="font-pixel text-base sm:text-lg text-white">SETTINGS</h2>
              <div className="w-20 hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* AUDIO CARD -> Opens the Audio & Save Settings Page */}
              <button
                onClick={() => navigateToMenu('SETTINGS')}
                className="group text-left bg-slate-950 border-2 border-slate-800 hover:border-emerald-500/70 rounded-2xl p-6 flex flex-col justify-between gap-6 transition-all cursor-pointer shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-pixel text-base text-white group-hover:text-emerald-400 transition-colors">
                      AUDIO
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure sound effects, 16-bit background music, master volume, and saved game data.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs font-semibold text-emerald-400">
                  <span>Open Audio Settings</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* HELP CARD -> Opens the Controls & Mechanics Page */}
              <button
                onClick={() => navigateToMenu('CONTROLS')}
                className="group text-left bg-slate-950 border-2 border-slate-800 hover:border-amber-400/70 rounded-2xl p-6 flex flex-col justify-between gap-6 transition-all cursor-pointer shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-pixel text-base text-white group-hover:text-amber-400 transition-colors">
                      HELP
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      View keyboard controls, power-up guides, platforming tips, and boss battle strategies.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs font-semibold text-amber-400">
                  <span>Open Controls & Help</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 5. HELP / CONTROLS & MECHANICS SCREEN */}
        {gameState === 'CONTROLS' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => navigateToMenu('SETTINGS_HUB')}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Settings</span>
              </button>
              <h2 className="font-pixel text-sm sm:text-base md:text-lg text-white">
                CONTROLS & HELP
              </h2>
              <button
                onClick={() => navigateToMenu('TITLE_MENU')}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Home
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-emerald-400">Keyboard Controls</h3>
                <div className="space-y-2.5 text-slate-300 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Move Left / Right</span>
                    <span className="font-mono-num text-amber-300">A / D or Left / Right Arrows</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Duck / Sit (When Grown)</span>
                    <span className="font-mono-num text-amber-300">S or Down Arrow</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Jump / Fly / Slow Fall</span>
                    <span className="font-mono-num text-amber-300">Space, W, or Up Arrow</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Sprint / Fireball / Tail Attack</span>
                    <span className="font-mono-num text-amber-300">Shift, X, or J</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Pause / Resume Game</span>
                    <span className="font-mono-num text-amber-300">Escape or P</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-amber-400">Platforming Tips</h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li>Hold the Jump key longer for higher leaps across wide chasms.</li>
                  <li>Hold Shift while moving to build sprint momentum and jump farther.</li>
                  <li>In Raccoon form, press Fire/Attack to spin your tail and hit enemies or blocks!</li>
                  <li>In Level 5, wait for Ironclad King Dredge to tire after his attack, then stomp his head, whip your Raccoon tail, or blast him with Fireballs 5 times to win!</li>
                </ul>
              </div>
            </div>

            {/* Power-Ups Reference Row */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="font-pixel text-xs text-amber-400">POWER-UP ITEMS</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Growth Mushroom</div>
                    <div className="text-slate-400">Grows Pip larger, breaks bricks & absorbs 1 hit.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Feather className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Raccoon Feather</div>
                    <div className="text-slate-400">
                      Fly on sprint-jumps, hold Jump to slow-fall, & press Fire/Shift to spin-attack!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Solar Fire Flower</div>
                    <div className="text-slate-400">Press Shift or X to launch bouncing fireballs.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Invincibility Star</div>
                    <div className="text-slate-400">Temporary rainbow armor defeats foes on touch.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. AUDIO & SAVE SETTINGS SCREEN */}
        {gameState === 'SETTINGS' && (
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => navigateToMenu('SETTINGS_HUB')}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Settings</span>
              </button>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h2 className="font-pixel text-sm sm:text-base text-white">AUDIO</h2>
              </div>
              <button
                onClick={() => navigateToMenu('TITLE_MENU')}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Home
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Sound Effects (SFX)</div>
                  <div className="text-xs text-slate-400">Jumps, coins, block breaks, and boss hits</div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    saveData.soundEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">16-Bit Chiptune Music</div>
                  <div className="text-xs text-slate-400">Synthesized stage themes for all 5 levels</div>
                </div>
                <button
                  onClick={toggleMusic}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    saveData.musicEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.musicEnabled ? 'Playing' : 'Muted'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Master Volume</span>
                  <span className="font-mono-num text-amber-400">
                    {Math.round(saveData.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={saveData.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Reset unlocked levels and high scores in localStorage
                </div>
                <button
                  onClick={handleResetSave}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-red-300 bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Save Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. ACTIVE GAMEPLAY VIEWPORT + RETRO HUD */}
        {(gameState === 'PLAYING' ||
          gameState === 'PAUSED' ||
          gameState === 'LEVEL_COMPLETE' ||
          gameState === 'GAME_OVER' ||
          gameState === 'WORLD_VICTORY') && (
          <div className="flex flex-col items-center w-full max-w-[820px] max-h-full">
            {/* Top Retro HUD Bar */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-t-xl px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 text-xs shrink-0">
              <div className="flex items-center gap-3 sm:gap-5 font-mono-num">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400 hidden xs:inline">SCORE</span>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {hud.score.toString().padStart(6, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-yellow-300 text-xs sm:text-sm">
                    ×{hud.coins.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="font-bold text-white text-xs sm:text-sm">×{hud.lives}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-slate-300 font-medium hidden md:block">
                  <span>{hud.levelName}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="font-mono-num text-emerald-400">
                    {hud.isInvincibleStar
                      ? `STAR (${hud.starTimeRemaining}s)`
                      : `POWER: ${hud.powerState}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMusic}
                    title="Toggle Music"
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    {saveData.musicEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => startLevel(currentLevelId, false)}
                    title="Restart Stage"
                    className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
                    }
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs"
                  >
                    {gameState === 'PAUSED' ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Boss Health Bar Banner during Final Castle Fight */}
            {hud.boss && hud.boss.active && (
              <div className="w-full bg-red-950/90 border-x border-b border-red-800/80 px-3 py-1 sm:px-4 sm:py-1.5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-red-200 truncate">
                  <Skull className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">{hud.boss.name}</span>
                  <span className="text-red-400 hidden sm:inline">·</span>
                  <span className="font-mono-num text-amber-300 hidden sm:inline">
                    {hud.boss.phase === 'VULNERABLE'
                      ? 'VULNERABLE! STOMP OR FIREBALL NOW!'
                      : `PATTERN: ${hud.boss.phase}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="w-24 sm:w-40 h-2.5 sm:h-3 bg-slate-950 rounded overflow-hidden border border-red-700">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-200"
                      style={{ width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono-num text-[11px] sm:text-xs font-bold text-white">
                    HP: {hud.boss.hp}/{hud.boss.maxHp}
                  </span>
                </div>
              </div>
            )}

            {/* Game Canvas Container (fits perfectly within mobile landscape height without scrolling) */}
            <div
              className="relative w-full aspect-[800/608] bg-slate-950 border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl mx-auto"
              style={{
                maxHeight: 'calc(100dvh - 52px)',
                maxWidth: 'calc((100dvh - 52px) * (800 / 608))',
              }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full block pixelated"
              />

              {/* OVERLAID TRANSPARENT ON-SCREEN CONTROLLER (Visible directly over the level with icons only) */}
              {gameState === 'PLAYING' && (
                <div className="absolute inset-x-0 bottom-3 sm:bottom-5 px-4 sm:px-6 flex items-end justify-between pointer-events-none select-none touch-none z-10">
                  {/* LEFT SIDE: Directional Controls (Left, Up [Mobile Jump], Down [Sit/Crouch], Right) */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      aria-label="Move Left"
                      {...bindVirtualButton('ArrowLeft')}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                        activeVirtualKeys['ArrowLeft']
                          ? 'bg-white/40 border-white/80 text-white scale-95'
                          : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                      }`}
                    >
                      <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
                    </button>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        aria-label="Up Jump"
                        {...bindVirtualButton('ArrowUp')}
                        className={`md:hidden w-12 h-11 rounded-2xl border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                          activeVirtualKeys['ArrowUp']
                            ? 'bg-white/40 border-white/80 text-white scale-95'
                            : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                        }`}
                      >
                        <ChevronUp className="w-6 h-6 stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        aria-label="Crouch Down"
                        {...bindVirtualButton('ArrowDown')}
                        className={`w-12 h-11 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                          activeVirtualKeys['ArrowDown']
                            ? 'bg-white/40 border-white/80 text-white scale-95'
                            : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                        }`}
                      >
                        <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Move Right"
                      {...bindVirtualButton('ArrowRight')}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                        activeVirtualKeys['ArrowRight']
                          ? 'bg-white/40 border-white/80 text-white scale-95'
                          : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                      }`}
                    >
                      <ChevronRight className="w-7 h-7 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* RIGHT SIDE: Action Buttons (Fire / Spin Attack / Sprint & Jump) */}
                  <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
                    <button
                      type="button"
                      aria-label="Fire and Sprint"
                      {...bindVirtualButton('KeyX')}
                      className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                        activeVirtualKeys['KeyX']
                          ? 'bg-orange-400/50 border-white/85 text-white scale-95'
                          : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                      }`}
                    >
                      <Flame className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                    </button>

                    <button
                      type="button"
                      aria-label="Jump"
                      {...bindVirtualButton('Space')}
                      className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex items-center justify-center transition-transform cursor-pointer select-none touch-none backdrop-blur-[1px] ${
                        activeVirtualKeys['Space']
                          ? 'bg-emerald-400/50 border-white/85 text-white scale-95'
                          : 'bg-white/15 hover:bg-white/25 border-white/35 text-white/90'
                      }`}
                    >
                      <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              {/* PAUSE MODAL OVERLAY (Compact & Centered for Mobile Viewports) */}
              {gameState === 'PAUSED' && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-20">
                  <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-3 sm:p-5 text-center shadow-2xl space-y-2.5 sm:space-y-4 my-auto">
                    <div>
                      <h3 className="font-pixel text-sm sm:text-base text-amber-400">GAME PAUSED</h3>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{hud.levelName}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setGameState('PLAYING')}
                        className="w-full min-h-[38px] py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                      >
                        Resume Game
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startLevel(currentLevelId, false)}
                          className="min-h-[36px] py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Restart
                        </button>
                        <button
                          onClick={() => navigateToMenu('LEVEL_SELECT')}
                          className="min-h-[36px] py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Level Select
                        </button>
                      </div>

                      <button
                        onClick={() => navigateToMenu('TITLE_MENU')}
                        className="w-full min-h-[32px] py-1 px-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-medium text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Home Screen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LEVEL COMPLETE OVERLAY (Compact & Clean for Mobile Screens) */}
              {gameState === 'LEVEL_COMPLETE' && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-20">
                  <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-emerald-500/50 rounded-2xl p-3 sm:p-5 text-center shadow-2xl space-y-2.5 sm:space-y-3.5 my-auto">
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        STAGE CLEARED!
                      </div>
                      <h3 className="font-pixel text-xs sm:text-base text-white mt-1">{hud.levelName}</h3>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 grid grid-cols-3 gap-1 sm:gap-2 text-center font-mono-num text-xs">
                      <div className="px-1">
                        <div className="text-[10px] text-slate-400 truncate">SCORE</div>
                        <div className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5">
                          {carriedScore.toLocaleString()}
                        </div>
                      </div>
                      <div className="px-1 border-x border-slate-800">
                        <div className="text-[10px] text-slate-400 truncate">COINS</div>
                        <div className="text-xs sm:text-sm font-bold text-yellow-300 mt-0.5">
                          {carriedCoins}
                        </div>
                      </div>
                      <div className="px-1">
                        <div className="text-[10px] text-slate-400 truncate">NEXT STAGE</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 truncate">
                          Stage {currentLevelDef.worldId || (currentLevelId > 10 ? 3 : currentLevelId > 5 ? 2 : 1)}-
                          {(currentLevelDef.stageNumber || ((currentLevelId - 1) % 5) + 1) + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => startLevel(Math.min(15, currentLevelId + 1), false)}
                        className="w-full min-h-[38px] flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                      >
                        <span>Next Level</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startLevel(currentLevelId, false)}
                          className="min-h-[36px] py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Replay Stage
                        </button>
                        <button
                          onClick={() => navigateToMenu('LEVEL_SELECT')}
                          className="min-h-[36px] py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Level Select
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GAME OVER OVERLAY (Compact for Mobile) */}
              {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-20">
                  <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-rose-500/50 rounded-2xl p-3 sm:p-5 text-center shadow-2xl space-y-2.5 sm:space-y-3.5 my-auto">
                    <div>
                      <h3 className="font-pixel text-sm sm:text-base text-rose-500">GAME OVER</h3>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Ranger Pip ran out of lives in {hud.levelName}.
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 font-mono-num bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3">
                      Score: {carriedScore.toLocaleString()} · Coins: {carriedCoins}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigateToMenu('LEVEL_SELECT')}
                        className="min-h-[38px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Level Select
                      </button>
                      <button
                        onClick={() => startLevel(currentLevelId, true)}
                        className="min-h-[38px] py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                      >
                        Try Again (3 Lives)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WORLD VICTORY OVERLAY (Compact for Mobile) */}
              {gameState === 'WORLD_VICTORY' && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-20">
                  <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-amber-400/60 rounded-2xl p-3 sm:p-6 text-center shadow-2xl space-y-2 sm:space-y-3.5 my-auto">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto">
                      <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300" />
                    </div>

                    <div>
                      <div className="text-[10px] sm:text-xs font-bold text-amber-400">
                        {currentLevelId >= 11
                          ? 'SOLKAR, THE SAND TITAN DEFEATED!'
                          : currentLevelId >= 6
                          ? 'ABYSSAL WARLORD KRAKENOS DEFEATED!'
                          : 'IRONCLAD KING DREDGE DEFEATED!'}
                      </div>
                      <h3 className="font-pixel text-xs sm:text-base text-white mt-0.5">
                        {currentLevelId >= 11
                          ? 'WORLD 3: SUNSCORCH DESERT CONQUERED!'
                          : currentLevelId >= 6
                          ? 'WORLD 2: CORAL ABYSS CONQUERED!'
                          : 'WORLD 1: EMERALDIA SAVED!'}
                      </h3>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center justify-around font-mono-num text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">FINAL SCORE</div>
                        <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
                          {carriedScore.toLocaleString()}
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400">COINS COLLECTED</div>
                        <div className="text-sm sm:text-base font-bold text-yellow-300 mt-0.5">
                          {carriedCoins}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {currentLevelId === 5 ? (
                        <button
                          onClick={() => startLevel(6, false)}
                          className="min-h-[38px] py-2 px-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                        >
                          Enter World 2
                        </button>
                      ) : currentLevelId === 10 ? (
                        <button
                          onClick={() => startLevel(11, false)}
                          className="min-h-[38px] py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                        >
                          Enter World 3
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            startLevel(
                              currentLevelId >= 11 ? 11 : currentLevelId >= 6 ? 6 : 1,
                              true
                            )
                          }
                          className="min-h-[38px] py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                        >
                          Replay World {currentLevelId >= 11 ? 3 : currentLevelId >= 6 ? 2 : 1}
                        </button>
                      )}
                      <button
                        onClick={() => navigateToMenu('WORLD_SELECT')}
                        className="min-h-[38px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        World Select
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
