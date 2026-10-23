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
} from 'lucide-react';
import { GameState, HudSnapshot, PowerState, SaveProgress } from './game/types';
import { LEVELS, getLevelById } from './game/levels';
import { loadProgress, saveProgress, recordLevelCompletion, resetAllProgress } from './game/storage';
import { soundManager } from './game/audio';
import { PlatformerEngine, CANVAS_WIDTH, CANVAS_HEIGHT } from './game/engine';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [saveData, setSaveData] = useState<SaveProgress>(() => loadProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [carriedScore, setCarriedScore] = useState<number>(0);
  const [carriedCoins, setCarriedCoins] = useState<number>(0);
  const [carriedLives, setCarriedLives] = useState<number>(3);
  const [carriedPower, setCarriedPower] = useState<PowerState>('SMALL');
  const [runRestartCounter, setRunRestartCounter] = useState<number>(0);

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
            return level.id === 5 ? 'WORLD_VICTORY' : 'LEVEL_COMPLETE';
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

  const totalBestScore = Object.values(saveData.highScores).reduce((a, b) => a + b, 0);
  const completedStagesCount = Object.values(saveData.highScores).filter((score) => score > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {/* 1. CLASSIC GAME HOME SCREEN (Mobile App & Retro Title Screen Feel) */}
        {gameState === 'TITLE_MENU' && (
          <div className="relative w-full max-w-4xl min-h-[540px] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
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
              <span>STAGE PROGRESS: {completedStagesCount} / 5 COMPLETED</span>
            </div>
          </div>
        )}

        {/* 2. COMPACT WORLD SELECT SCREEN */}
        {gameState === 'WORLD_SELECT' && (
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
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

            <div className="flex justify-center">
              <button
                onClick={() => navigateToMenu('LEVEL_SELECT')}
                className="w-56 bg-slate-950 border-2 border-emerald-500/70 hover:border-emerald-400 active:scale-[0.98] rounded-xl p-5 text-center space-y-3 transition-all cursor-pointer shadow-lg"
              >
                <div className="font-pixel text-base text-white">WORLD 1</div>
                <div className="text-xs font-mono-num font-semibold text-emerald-400">
                  {completedStagesCount}/5 STAGES
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-xs font-mono-num text-slate-300">
                  World Score: {totalBestScore.toLocaleString()}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. LEVEL SELECTION SCREEN (Appears after selecting World 1) */}
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
                  WORLD 1: EMERALDIA KINGDOM
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
              {LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= saveData.unlockedLevel;
                const highScore = saveData.highScores[lvl.id] || 0;
                const bestCoins = saveData.bestCoins[lvl.id] || 0;
                const isCompleted = highScore > 0 || bestCoins > 0;

                const buttonLabel = !isUnlocked
                  ? 'Locked'
                  : isCompleted
                  ? 'Play Again'
                  : 'Play Now';

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
                        <span>STAGE 1-{lvl.id}</span>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <h3 className="font-bold text-base text-white">
                        {lvl.name.replace(`Level ${lvl.id}: `, '')}
                      </h3>
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
                    <span>Variable Height Jump</span>
                    <span className="font-mono-num text-amber-300">Space, W, or Up Arrow</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Sprint / Shoot Fireball</span>
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
                  <li>Stomp on Beetles to turn them into shells, then kick the shell into enemy lines!</li>
                  <li>In Level 5, wait for Ironclad King Dredge to tire after his attack, then stomp his head or blast him with Fireballs 5 times to win!</li>
                </ul>
              </div>
            </div>

            {/* Power-Ups Reference Row */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="font-pixel text-xs text-amber-400">POWER-UP ITEMS</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
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
          <div className="flex flex-col items-center w-full max-w-[820px]">
            {/* Top Retro HUD Bar */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-5 font-mono-num">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">SCORE</span>
                  <span className="font-bold text-white text-sm">
                    {hud.score.toString().padStart(6, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-yellow-300 text-sm">
                    ×{hud.coins.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="font-bold text-white text-sm">×{hud.lives}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-slate-300 font-medium hidden sm:block">
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
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
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
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
                    }
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              <div className="w-full bg-red-950/90 border-x border-b border-red-800/80 px-4 py-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                  <Skull className="w-4 h-4 text-red-400" />
                  <span>{hud.boss.name}</span>
                  <span className="text-red-400">·</span>
                  <span className="font-mono-num text-amber-300">
                    {hud.boss.phase === 'VULNERABLE'
                      ? 'VULNERABLE! STOMP OR FIREBALL NOW!'
                      : `PATTERN: ${hud.boss.phase}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 h-3 bg-slate-950 rounded overflow-hidden border border-red-700">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-200"
                      style={{ width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono-num text-xs font-bold text-white">
                    HP: {hud.boss.hp}/{hud.boss.maxHp}
                  </span>
                </div>
              </div>
            )}

            {/* Game Canvas Container */}
            <div className="relative w-full aspect-[800/608] bg-slate-950 border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full block pixelated"
              />

              {/* PAUSE MODAL OVERLAY */}
              {gameState === 'PAUSED' && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
                    <h3 className="font-pixel text-lg text-amber-400">GAME PAUSED</h3>
                    <p className="text-xs text-slate-300">{hud.levelName}</p>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setGameState('PLAYING')}
                        className="w-full min-h-[44px] py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Resume Game
                      </button>
                      <button
                        onClick={() => startLevel(currentLevelId, false)}
                        className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Restart Stage
                      </button>
                      <button
                        onClick={() => navigateToMenu('LEVEL_SELECT')}
                        className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Level Select
                      </button>
                      <button
                        onClick={() => navigateToMenu('TITLE_MENU')}
                        className="w-full min-h-[44px] py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Home Screen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LEVEL COMPLETE OVERLAY */}
              {gameState === 'LEVEL_COMPLETE' && (
                <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
                    <div className="text-xs font-bold text-emerald-400">STAGE CLEARED!</div>
                    <h3 className="font-pixel text-lg text-white">{hud.levelName}</h3>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-around font-mono-num text-xs">
                      <div>
                        <div className="text-slate-400">SCORE</div>
                        <div className="text-base font-bold text-amber-400 mt-1">
                          {carriedScore.toLocaleString()}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <div className="text-slate-400">COINS</div>
                        <div className="text-base font-bold text-yellow-300 mt-1">
                          {carriedCoins}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <div className="text-slate-400">NEXT STAGE</div>
                        <div className="text-base font-bold text-emerald-400 mt-1">
                          Level {Math.min(5, currentLevelId + 1)} Unlocked
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => navigateToMenu('LEVEL_SELECT')}
                        className="min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Level Select
                      </button>
                      <button
                        onClick={() => startLevel(currentLevelId, false)}
                        className="min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Replay Stage
                      </button>
                      <button
                        onClick={() => startLevel(Math.min(5, currentLevelId + 1), false)}
                        className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Next Level</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* GAME OVER OVERLAY */}
              {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
                    <h3 className="font-pixel text-xl text-rose-500">GAME OVER</h3>
                    <p className="text-xs text-slate-300">
                      Ranger Pip ran out of lives in {hud.levelName}.
                    </p>
                    <div className="text-xs text-slate-400 font-mono-num">
                      Final Score: {carriedScore.toLocaleString()} · Coins: {carriedCoins}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => navigateToMenu('LEVEL_SELECT')}
                        className="min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Level Select
                      </button>
                      <button
                        onClick={() => startLevel(currentLevelId, true)}
                        className="min-h-[44px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Try Again (3 Lives)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WORLD VICTORY OVERLAY (AFTER DEFEATING BOSS IN LEVEL 5) */}
              {gameState === 'WORLD_VICTORY' && (
                <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-slate-900 border border-amber-400/60 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
                    <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto">
                      <Crown className="w-6 h-6 text-amber-300" />
                    </div>
                    <div className="text-xs font-bold text-amber-400">
                      IRONCLAD KING DREDGE DEFEATED!
                    </div>
                    <h3 className="font-pixel text-xl text-white leading-relaxed">
                      PEACE RESTORED TO EMERALDIA!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You conquered all five stages of World 1 and recovered the Royal Emerald Crown!
                    </p>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-around font-mono-num text-xs">
                      <div>
                        <div className="text-slate-400">FINAL SCORE</div>
                        <div className="text-lg font-bold text-amber-400 mt-1">
                          {carriedScore.toLocaleString()}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <div className="text-slate-400">COINS COLLECTED</div>
                        <div className="text-lg font-bold text-yellow-300 mt-1">
                          {carriedCoins}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => startLevel(1, true)}
                        className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Replay World 1
                      </button>
                      <button
                        onClick={() => navigateToMenu('LEVEL_SELECT')}
                        className="min-h-[44px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Level Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Controls Bar Underneath Canvas */}
            <div className="w-full pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Move: <span className="text-slate-200 font-medium">A/D or Arrows</span> · Jump (Hold
                for higher): <span className="text-slate-200 font-medium">Space / W / Up</span> ·
                Run & Fireball: <span className="text-slate-200 font-medium">Shift / X</span>
              </div>
              <div>
                Pause: <span className="text-slate-200 font-medium">Esc</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
