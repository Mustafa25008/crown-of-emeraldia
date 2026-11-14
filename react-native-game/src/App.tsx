import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
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
  ChevronRight,
  Feather,
  ArrowUp,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { GameState, HudSnapshot, PowerState, SaveProgress, TileType } from './game/types';
import { LEVELS, WORLDS, getLevelById, getWorldById } from './game/levels';
import {
  loadProgress,
  saveProgress,
  saveProgressDebounced,
  recordLevelCompletion,
  resetAllProgress,
} from './game/storage';
import { soundManager } from './game/audio';
import { PlatformerEngine, CANVAS_WIDTH, CANVAS_HEIGHT } from './game/engine';
import { drawParallaxBackground, drawTile } from './game/renderer';

function GoldCoinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="5" stroke="#FEF08A" strokeWidth="1" strokeOpacity="0.85" />
      <rect x="7" y="4.5" width="2" height="7" rx="1" fill="#FEF08A" />
    </svg>
  );
}

/**
 * Renders the exact active gameplay environment (Stage 1-1 'HILLS' parallax sky, pixel clouds,
 * stepped 16-bit hills, bushes, 32x32 ground tiles, floating [BRICK, QUESTION_COIN, BRICK] formation,
 * and 2x2 green warp pipe) using the identical renderer functions used during active gameplay.
 */
function GameplayEnvironmentBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderBackdrop = () => {
      const rect = canvas.getBoundingClientRect();
      const TILE = 32;
      const rows = 19; // Exact 19-row height of active gameplay levels (608px)
      const canvasH = rows * TILE;
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : CANVAS_WIDTH / CANVAS_HEIGHT;
      const cols = Math.max(11, Math.ceil((canvasH * aspect) / TILE));
      const canvasW = cols * TILE;

      if (canvas.width !== canvasW || canvas.height !== canvasH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;

      // 1. Exact gameplay parallax background (pass Math.max(CANVAS_WIDTH, canvasW) so clouds/hills never wrap/repeat awkwardly on narrower viewports)
      const parallaxSpanWidth = Math.max(CANVAS_WIDTH, canvasW);
      drawParallaxBackground(ctx, 'HILLS', 0, parallaxSpanWidth, canvasH, 0);

      // 2. Seal bottom 3 rows with deep earth base and draw exact gameplay ground tiles (row 16 top grass + rows 17-18 deep soil) flush to the very bottom
      const groundTopRow = rows - 3;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, groundTopRow * TILE, canvasW, canvasH - groundTopRow * TILE);
      for (let c = 0; c <= cols; c++) {
        drawTile(ctx, TileType.GROUND_TOP, c * TILE, groundTopRow * TILE, 'HILLS', 0);
        drawTile(ctx, TileType.GROUND_DEEP, c * TILE, (groundTopRow + 1) * TILE, 'HILLS', 0);
        drawTile(ctx, TileType.GROUND_DEEP, c * TILE, (groundTopRow + 2) * TILE, 'HILLS', 0);
      }

      // 3. Exact gameplay floating Question Block & Brick formation on the left side
      const blockStartCol = cols >= 20 ? 2 : 1;
      const blockRow = groundTopRow - 4; // 4 tiles above ground
      drawTile(ctx, TileType.BRICK, blockStartCol * TILE, blockRow * TILE, 'HILLS', 0);
      drawTile(ctx, TileType.QUESTION_COIN, (blockStartCol + 1) * TILE, blockRow * TILE, 'HILLS', 0);
      drawTile(ctx, TileType.BRICK, (blockStartCol + 2) * TILE, blockRow * TILE, 'HILLS', 0);

      // 4. Exact gameplay Green Warp Pipe on the right side sitting flush on row 16 ground
      const pipeLeftCol = cols >= 20 ? cols - 4 : Math.max(5, cols - 3);
      drawTile(ctx, TileType.PIPE_TOP_L, pipeLeftCol * TILE, (groundTopRow - 2) * TILE, 'HILLS', 0);
      drawTile(ctx, TileType.PIPE_TOP_R, (pipeLeftCol + 1) * TILE, (groundTopRow - 2) * TILE, 'HILLS', 0);
      drawTile(ctx, TileType.PIPE_BODY_L, pipeLeftCol * TILE, (groundTopRow - 1) * TILE, 'HILLS', 0);
      drawTile(ctx, TileType.PIPE_BODY_R, (pipeLeftCol + 1) * TILE, (groundTopRow - 1) * TILE, 'HILLS', 0);
    };

    renderBackdrop();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        renderBackdrop();
      });
      resizeObserver.observe(canvas);
    }
    window.addEventListener('resize', renderBackdrop);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', renderBackdrop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full block pixelated pointer-events-none select-none z-0"
    />
  );
}

type OutcomeModalVariant = 'stage_cleared' | 'game_over' | 'time_out';

interface StageOutcomeModalProps {
  variant: OutcomeModalVariant;
  isWorldVictory?: boolean;
  isMobileTouch: boolean;
  currentLevelId: number;
  levelName: string;
  score: number;
  coins: number;
  isWatchingAd: boolean;
  onPrimaryAction: () => void;
  onSecondaryRetry: () => void;
  onLevelSelect: () => void;
}

function StageOutcomeModal({
  variant,
  isWorldVictory = false,
  isMobileTouch,
  currentLevelId,
  levelName,
  score,
  coins,
  isWatchingAd,
  onPrimaryAction,
  onSecondaryRetry,
  onLevelSelect,
}: StageOutcomeModalProps) {
  const isSuccess = variant === 'stage_cleared';
  const isTimeOut = variant === 'time_out';

  const borderColorClass = isSuccess
    ? isWorldVictory
      ? 'border-amber-400/60'
      : 'border-emerald-500/50'
    : isTimeOut
    ? 'border-amber-500/60'
    : 'border-rose-500/50';

  const bossDefeatedSubtitle =
    currentLevelId >= 46
      ? 'AZHURAK, THE ANCIENT COLOSSUS DEFEATED!'
      : currentLevelId >= 41
      ? 'CRYSTALIS, THE CRYSTAL GUARDIAN DEFEATED!'
      : currentLevelId >= 36
      ? 'NOCTHAR, THE SHADOW KING DEFEATED!'
      : currentLevelId >= 31
      ? 'CHRONOS, THE TIMEKEEPER DEFEATED!'
      : currentLevelId >= 26
      ? 'AETHERION, THE STORM SOVEREIGN DEFEATED!'
      : currentLevelId >= 21
      ? 'IGNAROK, THE INFERNO KING DEFEATED!'
      : currentLevelId >= 16
      ? 'GLACIOR, THE FROST DRAGON DEFEATED!'
      : currentLevelId >= 11
      ? 'SOLKAR, THE SAND TITAN DEFEATED!'
      : currentLevelId >= 6
      ? 'ABYSSAL WARLORD KRAKENOS DEFEATED!'
      : 'IRONCLAD KING DREDGE DEFEATED!';

  const worldConqueredTitle =
    currentLevelId >= 46
      ? 'WORLD 10: ANCIENT RUINS CONQUERED!'
      : currentLevelId >= 41
      ? 'WORLD 9: CRYSTAL CAVERNS CONQUERED!'
      : currentLevelId >= 36
      ? 'WORLD 8: SHADOWVEIL KINGDOM CONQUERED!'
      : currentLevelId >= 31
      ? 'WORLD 7: CHRONOS REALM CONQUERED!'
      : currentLevelId >= 26
      ? 'WORLD 6: CELESTIA KINGDOM CONQUERED!'
      : currentLevelId >= 21
      ? 'WORLD 5: INFERNO KINGDOM CONQUERED!'
      : currentLevelId >= 16
      ? 'WORLD 4: FROSTFALL KINGDOM CONQUERED!'
      : currentLevelId >= 11
      ? 'WORLD 3: SUNSCORCH DESERT CONQUERED!'
      : currentLevelId >= 6
      ? 'WORLD 2: CORAL ABYSS CONQUERED!'
      : 'WORLD 1: EMERALDIA SAVED!';

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] flex items-center justify-center p-2 overflow-hidden z-20">
      <div
        className={`w-full bg-slate-900 border ${borderColorClass} rounded-2xl text-center shadow-2xl my-auto ${
          isMobileTouch
            ? 'max-w-[300px] p-2.5 space-y-2'
            : 'max-w-md p-5 space-y-3.5'
        }`}
      >
        {isSuccess && isWorldVictory && !isMobileTouch && (
          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
        )}

        <div className="min-w-0">
          {isSuccess ? (
            <>
              <div
                className={`font-bold uppercase tracking-wider truncate ${
                  isMobileTouch ? 'text-[10px]' : 'text-xs'
                } ${isWorldVictory ? 'text-amber-400' : 'text-emerald-400'}`}
              >
                {isWorldVictory && isMobileTouch && (
                  <Crown className="w-3 h-3 text-amber-300 inline-block mr-1 -mt-0.5" />
                )}
                {isWorldVictory ? bossDefeatedSubtitle : 'STAGE CLEARED!'}
              </div>
              <h3
                className={`font-pixel text-white truncate ${
                  isMobileTouch ? 'text-[11px] mt-0.5' : 'text-base mt-1'
                }`}
              >
                {isWorldVictory ? worldConqueredTitle : levelName}
              </h3>
            </>
          ) : isTimeOut ? (
            <>
              <h3
                className={`font-pixel text-amber-400 ${
                  isMobileTouch ? 'text-xs' : 'text-base'
                }`}
              >
                TIME UP!
              </h3>
              <p
                className={`text-slate-300 truncate ${
                  isMobileTouch ? 'text-[10px] mt-0.5' : 'text-xs mt-1'
                }`}
              >
                Time ran out in {levelName}.
              </p>
            </>
          ) : (
            <>
              <h3
                className={`font-pixel text-rose-500 ${
                  isMobileTouch ? 'text-xs' : 'text-base'
                }`}
              >
                GAME OVER
              </h3>
              <p
                className={`text-slate-300 truncate ${
                  isMobileTouch ? 'text-[10px] mt-0.5' : 'text-xs mt-1'
                }`}
              >
                Ranger Pip ran out of lives in {levelName}.
              </p>
            </>
          )}
        </div>

        <div
          className={`bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 gap-2 text-center font-mono-num text-xs ${
            isMobileTouch ? 'p-1.5' : 'p-3'
          }`}
        >
          <div className="px-1">
            <div className="text-[10px] text-slate-400 truncate">SCORE</div>
            <div
              className={`font-bold text-amber-400 ${
                isMobileTouch ? 'text-xs mt-0' : 'text-sm mt-0.5'
              }`}
            >
              {score.toLocaleString()}
            </div>
          </div>
          <div className="px-1 border-l border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">COINS</div>
            <div
              className={`font-bold text-yellow-300 ${
                isMobileTouch ? 'text-xs mt-0' : 'text-sm mt-0.5'
              }`}
            >
              {coins}
            </div>
          </div>
        </div>

        {/* Unified 2-Row Button Layout Structure */}
        <div className={`flex flex-col ${isMobileTouch ? 'gap-1.5' : 'gap-2'}`}>
          {/* Row 1 (Primary, full-width) */}
          <button
            type="button"
            disabled={isWatchingAd}
            onClick={onPrimaryAction}
            className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl shadow transition-all cursor-pointer ${
              isMobileTouch
                ? 'min-h-[34px] py-1.5 px-3 text-[11px]'
                : 'min-h-[40px] py-2.5 px-4 text-xs'
            } ${
              isSuccess
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-60'
            }`}
          >
            {isSuccess ? (
              <span>Next Level ➔</span>
            ) : isWatchingAd ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Loading...</span>
              </>
            ) : (
              <span>▶ Watch Ad & Revive</span>
            )}
          </button>

          {/* Row 2 (Secondary Grid - 2 buttons side-by-side) */}
          <div className={`grid grid-cols-2 ${isMobileTouch ? 'gap-1.5' : 'gap-2'}`}>
            <button
              type="button"
              disabled={isWatchingAd}
              onClick={onSecondaryRetry}
              className={`bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
                isMobileTouch
                  ? 'min-h-[32px] py-1.5 px-2.5 text-[11px]'
                  : 'min-h-[38px] py-2 px-3 text-xs'
              }`}
            >
              {isSuccess ? 'Replay' : 'Try Again'}
            </button>
            <button
              type="button"
              disabled={isWatchingAd}
              onClick={onLevelSelect}
              className={`bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
                isMobileTouch
                  ? 'min-h-[32px] py-1.5 px-2.5 text-[11px]'
                  : 'min-h-[38px] py-2 px-3 text-xs'
              }`}
            >
              Level Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [storeToastVisible, setStoreToastVisible] = useState<boolean>(false);
  const storeToastTimerRef = useRef<number | null>(null);

  const handleStoreButtonClick = useCallback(() => {
    soundManager.playCoin();
    setStoreToastVisible(true);
    if (storeToastTimerRef.current !== null) {
      window.clearTimeout(storeToastTimerRef.current);
    }
    storeToastTimerRef.current = window.setTimeout(() => {
      setStoreToastVisible(false);
      storeToastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (storeToastTimerRef.current !== null) {
        window.clearTimeout(storeToastTimerRef.current);
      }
    };
  }, []);

  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    coins: 0,
    lives: 3,
    timeRemaining: 180,
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
  const isLandscapeLockedRef = useRef<boolean>(false);
  const worldCarouselDragRef = useRef<{
    isDown: boolean;
    startX: number;
    scrollLeft: number;
    hasDragged: boolean;
  }>({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });

  const postToReactNative = useCallback((payload: Record<string, unknown>) => {
    try {
      const anyWin = window as unknown as {
        ReactNativeWebView?: { postMessage?: (msg: string) => void };
      };
      if (anyWin.ReactNativeWebView?.postMessage) {
        anyWin.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    } catch {
      // Ignore when running in standard desktop/mobile browser
    }
  }, []);

  // Sync audio settings with SoundManager
  useEffect(() => {
    soundManager.updateSettings(saveData.soundEnabled, saveData.musicEnabled, saveData.volume);
  }, [saveData.soundEnabled, saveData.musicEnabled, saveData.volume]);

  // Sync save progress with React Native AsyncStorage host when running inside Expo
  useEffect(() => {
    postToReactNative({
      type: 'SAVE_PROGRESS_SYNC',
      saveData,
    });
  }, [saveData, postToReactNative]);

  const isMobileTouchDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const anyWin = window as unknown as { ReactNativeWebView?: unknown };
    if (anyWin.ReactNativeWebView) return true;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    const maxDim = Math.max(window.innerWidth, window.innerHeight);
    return (hasTouch || coarsePointer) && minDim <= 920 && maxDim <= 1400;
  }, []);

  const [isMobileTouch, setIsMobileTouch] = useState<boolean>(() => isMobileTouchDevice());

  useEffect(() => {
    const updateMobileStatus = () => {
      setIsMobileTouch(isMobileTouchDevice());
    };
    updateMobileStatus();
    window.addEventListener('resize', updateMobileStatus);
    window.addEventListener('orientationchange', updateMobileStatus);
    return () => {
      window.removeEventListener('resize', updateMobileStatus);
      window.removeEventListener('orientationchange', updateMobileStatus);
    };
  }, [isMobileTouchDevice]);

  const lockMobileLandscape = useCallback(() => {
    postToReactNative({ type: 'SET_ORIENTATION', orientation: 'landscape' });
    if (!isMobileTouchDevice() || isLandscapeLockedRef.current) return;
    isLandscapeLockedRef.current = true;
    try {
      const anyWin = window as unknown as {
        AndroidBridge?: { setOrientation?: (mode: string) => void };
        webkit?: { messageHandlers?: { orientation?: { postMessage?: (mode: string) => void } } };
      };
      anyWin.AndroidBridge?.setOrientation?.('landscape');
      anyWin.webkit?.messageHandlers?.orientation?.postMessage?.('landscape');

      const docEl = document.documentElement;
      const lockOrientation = () => {
        const screenOrientation = (window.screen as unknown as {
          orientation?: { lock?: (o: string) => Promise<void> };
        })?.orientation;
        if (screenOrientation?.lock) {
          screenOrientation.lock('landscape').catch(() => {});
        }
      };

      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl
          .requestFullscreen()
          .then(() => lockOrientation())
          .catch(() => lockOrientation());
      } else {
        lockOrientation();
      }
    } catch {
      // Graceful fallback for browsers without orientation lock support
    }
  }, [isMobileTouchDevice, postToReactNative]);

  const unlockMobileToPortrait = useCallback(() => {
    postToReactNative({ type: 'SET_ORIENTATION', orientation: 'portrait' });
    if (!isMobileTouchDevice() || !isLandscapeLockedRef.current) return;
    isLandscapeLockedRef.current = false;
    try {
      const anyWin = window as unknown as {
        AndroidBridge?: { setOrientation?: (mode: string) => void };
        webkit?: { messageHandlers?: { orientation?: { postMessage?: (mode: string) => void } } };
      };
      anyWin.AndroidBridge?.setOrientation?.('portrait');
      anyWin.webkit?.messageHandlers?.orientation?.postMessage?.('portrait');

      const screenOrientation = (window.screen as unknown as {
        orientation?: {
          lock?: (o: string) => Promise<void>;
          unlock?: () => void;
        };
      })?.orientation;

      if (screenOrientation?.lock) {
        screenOrientation.lock('portrait').catch(() => {
          screenOrientation.unlock?.();
        });
      } else {
        screenOrientation?.unlock?.();
      }

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Graceful fallback for browsers without orientation lock support
    }
  }, [isMobileTouchDevice, postToReactNative]);

  const navigateToMenu = useCallback(
    (targetState: GameState) => {
      soundManager.stopMusic();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      unlockMobileToPortrait();
      setGameState(targetState);
    },
    [unlockMobileToPortrait]
  );

  // Native Android Hardware/Software Back Button & History Navigation Handler
  const handleAndroidBackPress = useCallback((): boolean => {
    if (gameState === 'PLAYING') {
      if (engineRef.current) {
        engineRef.current.setPaused(true);
      }
      soundManager.pauseAllAudio();
      setGameState('PAUSED');
      return true;
    }
    if (gameState === 'PAUSED') {
      if (engineRef.current) {
        engineRef.current.setPaused(false);
      }
      soundManager.resumeAudio();
      setGameState('PLAYING');
      return true;
    }
    if (
      gameState === 'LEVEL_COMPLETE' ||
      gameState === 'WORLD_VICTORY' ||
      gameState === 'GAME_OVER' ||
      gameState === 'TIME_OUT'
    ) {
      soundManager.playCoin();
      navigateToMenu('LEVEL_SELECT');
      return true;
    }
    if (gameState === 'SETTINGS' || gameState === 'CONTROLS') {
      soundManager.playCoin();
      navigateToMenu('SETTINGS_HUB');
      return true;
    }
    if (gameState === 'LEVEL_SELECT') {
      soundManager.playCoin();
      navigateToMenu('WORLD_SELECT');
      return true;
    }
    if (gameState === 'WORLD_SELECT' || gameState === 'SETTINGS_HUB') {
      soundManager.playCoin();
      navigateToMenu('TITLE_MENU');
      return true;
    }
    postToReactNative({ type: 'BACK_AT_ROOT' });
    return false;
  }, [gameState, navigateToMenu, postToReactNative]);

  const pendingRewardReviveRef = useRef<((rewarded: boolean) => void) | null>(null);

  const isNativeExpoApp = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView);
  }, []);

  useEffect(() => {
    const anyWin = window as unknown as {
      __handleAndroidBackPress?: () => boolean;
      __onNativeRewardedAdResult?: (rewarded: boolean) => void;
    };
    anyWin.__handleAndroidBackPress = handleAndroidBackPress;
    anyWin.__onNativeRewardedAdResult = (rewarded: boolean) => {
      if (pendingRewardReviveRef.current) {
        pendingRewardReviveRef.current(rewarded);
      }
    };

    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!raw || typeof raw !== 'object') return;
        if (raw.type === 'ANDROID_BACK_PRESS') {
          handleAndroidBackPress();
        } else if (raw.type === 'HYDRATE_NATIVE_SAVE' && raw.saveData) {
          setSaveData((prev) => {
            const merged = { ...prev, ...raw.saveData };
            saveProgress(merged);
            return merged;
          });
        } else if (raw.type === 'REWARDED_AD_RESULT') {
          if (pendingRewardReviveRef.current) {
            pendingRewardReviveRef.current(Boolean(raw.rewarded));
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleNativeMessage);
    document.addEventListener('message', handleNativeMessage as EventListener);
    return () => {
      window.removeEventListener('message', handleNativeMessage);
      document.removeEventListener('message', handleNativeMessage as EventListener);
    };
  }, [handleAndroidBackPress]);

  // Sync browser/WebView history state so Android swipe-back / browser back navigates screens instead of closing the app
  useEffect(() => {
    postToReactNative({
      type: 'GAME_STATE_CHANGE',
      gameState,
      isAtRoot: gameState === 'TITLE_MENU',
    });
    if (gameState !== 'TITLE_MENU') {
      try {
        window.history.pushState({ gameState }, '');
      } catch {
        // Ignore in restricted sandbox contexts
      }
    }
  }, [gameState, postToReactNative]);

  useEffect(() => {
    const onPopState = () => {
      if (gameState !== 'TITLE_MENU') {
        handleAndroidBackPress();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [gameState, handleAndroidBackPress]);

  const startLevel = useCallback(
    (levelId: number, resetRunStats: boolean = false) => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      const level = getLevelById(levelId);
      setCurrentLevelId(levelId);
      setSelectedWorldId(
        level.worldId ||
          (levelId > 45
            ? 10
            : levelId > 40
            ? 9
            : levelId > 35
            ? 8
            : levelId > 30
            ? 7
            : levelId > 25
            ? 6
            : levelId > 20
            ? 5
            : levelId > 15
            ? 4
            : levelId > 10
            ? 3
            : levelId > 5
            ? 2
            : 1)
      );

      if (resetRunStats) {
        setCarriedScore(0);
        setCarriedCoins(0);
        setCarriedLives(3);
        setCarriedPower('SMALL');
      }

      lockMobileLandscape();
      setGameState('PLAYING');
      setRunRestartCounter((c) => c + 1);
      soundManager.playMusic(level.musicTrack);
    },
    [lockMobileLandscape]
  );

  // Mount PlatformerEngine when starting or restarting a level
  useEffect(() => {
    if (runRestartCounter === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }) || canvas.getContext('2d');
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
            return level.id === 5 ||
              level.id === 10 ||
              level.id === 15 ||
              level.id === 20 ||
              level.id === 25 ||
              level.id === 30 ||
              level.id === 35 ||
              level.id === 40 ||
              level.id === 45 ||
              level.id === 50
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
        onTimeOut: (finalScore, finalCoins) => {
          soundManager.stopMusic();
          setCarriedScore(finalScore);
          setCarriedCoins(finalCoins);
          setGameState((prev) => {
            if (prev !== 'PLAYING' && prev !== 'PAUSED') return prev;
            return 'TIME_OUT';
          });
        },
        onPauseToggle: () => {
          setGameState((prev) => {
            if (prev !== 'PLAYING' && prev !== 'PAUSED') return prev;
            const next = prev === 'PLAYING' ? 'PAUSED' : 'PLAYING';
            if (engineRef.current) {
              engineRef.current.setPaused(next === 'PAUSED');
            }
            if (next === 'PAUSED') {
              soundManager.pauseAllAudio();
            } else {
              soundManager.resumeAudio();
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

  // Sync pause and teardown state with engine & audio when gameState changes
  useEffect(() => {
    const isMenuScreen =
      gameState === 'TITLE_MENU' ||
      gameState === 'WORLD_SELECT' ||
      gameState === 'LEVEL_SELECT' ||
      gameState === 'SETTINGS_HUB' ||
      gameState === 'CONTROLS' ||
      gameState === 'SETTINGS';

    if (isMenuScreen) {
      unlockMobileToPortrait();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      return;
    }

    lockMobileLandscape();

    if (engineRef.current) {
      const shouldPause = gameState !== 'PLAYING';
      engineRef.current.setPaused(shouldPause);
      if (gameState === 'PAUSED') {
        soundManager.pauseAllAudio();
      } else if (gameState === 'PLAYING') {
        soundManager.resumeAudio();
      }
    }
  }, [gameState, lockMobileLandscape, unlockMobileToPortrait]);

  const handleWatchAdAndRevive = useCallback(() => {
    if (isWatchingAd) return;
    setIsWatchingAd(true);
    soundManager.pauseAllAudio();

    const completeRewardRevive = () => {
      pendingRewardReviveRef.current = null;
      setIsWatchingAd(false);
      setCarriedLives(3);
      if (engineRef.current) {
        engineRef.current.revivePlayer(3);
      }
      setGameState('PLAYING');
      const level = getLevelById(currentLevelId);
      soundManager.playMusic(level.musicTrack);
    };

    const anyWin = window as unknown as {
      ReactNativeWebView?: { postMessage?: (msg: string) => void };
      AdMob?: { showRewardVideoAd?: () => Promise<unknown> };
      AndroidAdMob?: { showRewardedAd?: (cb?: () => void) => void };
    };

    // 1. Native Expo / React Native Google Mobile Ads Rewarded Ad bridge
    if (anyWin.ReactNativeWebView?.postMessage) {
      pendingRewardReviveRef.current = (rewarded: boolean) => {
        pendingRewardReviveRef.current = null;
        if (rewarded) {
          completeRewardRevive();
        } else {
          setIsWatchingAd(false);
        }
      };
      postToReactNative({
        type: 'SHOW_REWARDED_AD',
        levelId: currentLevelId,
      });
      return;
    }

    // 2. Legacy WebView AdMob wrappers
    if (anyWin.AdMob?.showRewardVideoAd) {
      anyWin.AdMob.showRewardVideoAd()
        .then(() => completeRewardRevive())
        .catch(() => completeRewardRevive());
      return;
    }
    if (anyWin.AndroidAdMob?.showRewardedAd) {
      anyWin.AndroidAdMob.showRewardedAd(() => completeRewardRevive());
      return;
    }

    // 3. Web browser fallback timer
    window.setTimeout(() => {
      completeRewardRevive();
    }, 1400);
  }, [currentLevelId, isWatchingAd, postToReactNative]);

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
      saveProgressDebounced(updated);
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

  const joystickKnobRef = useRef<HTMLDivElement | null>(null);
  const activeJoystickPointerRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number; maxRadius: number }>({
    x: 0,
    y: 0,
    maxRadius: 38,
  });

  const cacheJoystickBounds = useCallback((padEl: HTMLDivElement) => {
    const rect = padEl.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      maxRadius: rect.width * 0.31,
    };
  }, []);

  const updateJoystickFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const { x: centerX, y: centerY, maxRadius } = joystickCenterRef.current;
      const rawDx = clientX - centerX;
      const rawDy = clientY - centerY;
      const dist = Math.hypot(rawDx, rawDy);

      let clampedX = rawDx;
      let clampedY = rawDy;
      if (dist > maxRadius && dist > 0) {
        const scale = maxRadius / dist;
        clampedX = rawDx * scale;
        clampedY = rawDy * scale;
      }

      if (joystickKnobRef.current) {
        joystickKnobRef.current.style.transition = 'none';
        joystickKnobRef.current.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
      }

      const deadzone = 6;
      if (dist < deadzone) {
        handleVirtualInput('ArrowLeft', false);
        handleVirtualInput('ArrowRight', false);
        handleVirtualInput('ArrowDown', false);
        return;
      }

      const isPureDown = rawDy > 10 && Math.abs(rawDx) < rawDy * 0.55;
      const wantLeft = !isPureDown && rawDx < -deadzone;
      const wantRight = !isPureDown && rawDx > deadzone;
      const wantDown = rawDy > 10 && rawDy > Math.abs(rawDx) * 0.65;

      handleVirtualInput('ArrowLeft', wantLeft);
      handleVirtualInput('ArrowRight', wantRight);
      handleVirtualInput('ArrowDown', wantDown);
    },
    [handleVirtualInput]
  );

  const resetJoystick = useCallback(() => {
    activeJoystickPointerRef.current = null;
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transition = 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)';
      joystickKnobRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    handleVirtualInput('ArrowLeft', false);
    handleVirtualInput('ArrowRight', false);
    handleVirtualInput('ArrowDown', false);
  }, [handleVirtualInput]);

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

  const totalBestScore = useMemo(() => {
    let sum = 0;
    for (const score of Object.values(saveData.highScores)) {
      if (score > 0) {
        sum += score;
      }
    }
    return sum;
  }, [saveData.highScores]);

  const activeWorld = getWorldById(selectedWorldId);
  const currentLevelDef = getLevelById(currentLevelId);
  const activeWorldNum =
    currentLevelDef.worldId || Math.floor((currentLevelId - 1) / 5) + 1;
  const activeStageNum =
    currentLevelDef.stageNumber || ((currentLevelId - 1) % 5) + 1;

  const isStageUnlocked = (lvlId: number): boolean => {
    if (
      lvlId === 1 ||
      lvlId === 6 ||
      lvlId === 11 ||
      lvlId === 16 ||
      lvlId === 21 ||
      lvlId === 26 ||
      lvlId === 31 ||
      lvlId === 36 ||
      lvlId === 41 ||
      lvlId === 46
    )
      return true;
    const prevHigh = saveData.highScores[lvlId - 1] || 0;
    const prevCoins = saveData.bestCoins[lvlId - 1] || 0;
    if (prevHigh > 0 || prevCoins > 0) return true;
    if (lvlId <= 5) {
      return lvlId <= Math.min(5, saveData.unlockedLevel);
    }
    return false;
  };

  const isGameplayView =
    gameState === 'PLAYING' ||
    gameState === 'PAUSED' ||
    gameState === 'LEVEL_COMPLETE' ||
    gameState === 'GAME_OVER' ||
    gameState === 'TIME_OUT' ||
    gameState === 'WORLD_VICTORY';

  const isPrimaryMenuScreen =
    gameState === 'TITLE_MENU' ||
    gameState === 'WORLD_SELECT' ||
    gameState === 'LEVEL_SELECT' ||
    gameState === 'SETTINGS_HUB' ||
    gameState === 'SETTINGS' ||
    gameState === 'CONTROLS';

  const isScrollLockedScreen = isGameplayView || isPrimaryMenuScreen;

  return (
    <div
      className={`${
        isScrollLockedScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      } flex flex-col bg-slate-950 text-slate-100 select-none`}
    >
      <main
        className={`flex-1 min-h-0 w-full flex flex-col items-center justify-center ${
          isGameplayView
            ? 'p-1 sm:px-3 sm:py-2 overflow-hidden'
            : isPrimaryMenuScreen
            ? 'p-2 sm:px-4 sm:py-6 overflow-hidden'
            : 'p-2 sm:px-4 sm:py-6 landscape:p-1 overflow-x-hidden'
        } max-w-full`}
      >
        {/* UNIFIED LOCKED PRIMARY SCREEN SHELL (Home, World Select, Level Select, Settings Hub, Audio Settings, and Controls & Help) */}
        {isPrimaryMenuScreen && (
          <div className="w-full h-full max-w-4xl sm:max-h-[640px] flex flex-col justify-between overflow-hidden">
            <div className="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between bg-slate-950">
              {/* Persistent Exact Gameplay Environment Background (Locked to viewport container: sky on top, ground floor sealed at the very bottom) */}
              <GameplayEnvironmentBackdrop />

              {/* 1. CLASSIC GAME HOME SCREEN (Sleek Glassmorphic Styling & Consistent 16-Bit Pixel Font) */}
              {gameState === 'TITLE_MENU' && (
                <>
                  {/* In-Game Toast Notification for Store */}
                  {storeToastVisible && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-950/65 backdrop-blur-md border-2 border-amber-400/85 text-amber-300 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-pixel whitespace-nowrap animate-bounce"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Store — Coming Soon!</span>
                    </div>
                  )}

                  {/* Top Status Strip: 100% Transparent Header Bar with Glassmorphic Top Score (Top-Left) & Coins (Top-Right) */}
                  <div className="relative z-10 flex items-center justify-between gap-2 px-3.5 pt-3.5 sm:px-6 sm:pt-5 bg-transparent border-0 shadow-none text-[9px] sm:text-[10px] font-pixel text-white shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/55 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-white/30 shadow-lg">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        TOP SCORE: {totalBestScore.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/55 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-white/30 shadow-lg">
                      <GoldCoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        COINS: {saveData.totalCoinsCollected}
                      </span>
                    </div>
                  </div>

                  {/* Center Compact Glassmorphic Signboard Title Card & Balanced Action Buttons */}
                  <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-2 sm:py-6 text-center">
                    <div className="bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 rounded-2xl px-4 py-2.5 sm:px-8 sm:py-4 md:px-10 md:py-5 shadow-2xl max-w-[300px] sm:max-w-lg w-full">
                      <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl text-white leading-snug tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        CROWN OF EMERALDIA
                      </h1>
                    </div>

                    {/* Balanced Vertical Action Stack: Glassmorphic Play, Store, and Settings */}
                    <div className="mt-5 sm:mt-7 flex flex-col items-center gap-2.5 sm:gap-3 w-full max-w-[210px] sm:max-w-[260px]">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playCoin();
                          navigateToMenu('WORLD_SELECT');
                        }}
                        className="w-full min-h-[46px] sm:min-h-[52px] py-2.5 sm:py-3 px-6 bg-emerald-500/65 hover:bg-emerald-500/80 active:scale-[0.98] backdrop-blur-md text-white font-pixel text-sm sm:text-base rounded-2xl border-2 border-emerald-300/80 shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]" />
                        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">PLAY</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStoreButtonClick}
                        className="w-full min-h-[44px] sm:min-h-[48px] py-2.5 px-6 bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md text-white font-pixel text-xs rounded-2xl border-2 border-white/25 hover:border-emerald-400/75 shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">STORE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playCoin();
                          navigateToMenu('SETTINGS_HUB');
                        }}
                        className="w-full min-h-[44px] sm:min-h-[48px] py-2.5 px-6 bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md text-white font-pixel text-xs rounded-2xl border-2 border-white/25 hover:border-amber-400/75 shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Settings className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">SETTINGS</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Ground Footer Legal Links (100% Transparent Background, Right Above Reserved Banner Ad Space) */}
                  <div
                    style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                    className="relative z-10 h-12 sm:h-16 bg-transparent border-0 shadow-none flex items-center justify-center gap-3 sm:gap-4 px-4 text-[8px] sm:text-[10px] font-pixel shrink-0"
                  >
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ backgroundColor: 'transparent' }}
                      className="bg-transparent text-amber-100 hover:text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] underline-offset-4 hover:underline transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </a>
                    <span className="text-amber-200/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] select-none">•</span>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ backgroundColor: 'transparent' }}
                      className="bg-transparent text-amber-100 hover:text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] underline-offset-4 hover:underline transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </a>
                  </div>
                </>
              )}

              {/* 2. SELECT WORLD SCREEN (Transparent Top Header Bar, Repositioned Title, Horizontal Scrollbar-Free Carousel, Vertical Card Stack & 16-Bit Pixel Font) */}
              {gameState === 'WORLD_SELECT' && (
                <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col p-3.5 sm:p-5 overflow-hidden">
                  {/* Top Navigation Header (Completely Transparent/Invisible Header Bar, Home Button Only) */}
                  <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-transparent border-0 shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('TITLE_MENU');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>HOME</span>
                    </button>
                  </div>

                  {/* Repositioned Prominent Section Title Right Below Header & Above Horizontal World Cards Stack */}
                  <div className="shrink-0 mt-3 sm:mt-4 mb-1 sm:mb-2 flex items-center justify-center">
                    <div className="px-5 py-2 sm:px-7 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl">
                      <h2 className="font-pixel text-xs sm:text-base md:text-lg text-white text-center tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        SELECT WORLD
                      </h2>
                    </div>
                  </div>

                  {/* Horizontal Scrolling World Cards Carousel (Zero Visible Scrollbars, Touch Swipe + Mouse Wheel + Drag Support) */}
                  <div
                    onWheel={(e) => {
                      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.currentTarget.scrollLeft += e.deltaY;
                      }
                    }}
                    onPointerDown={(e) => {
                      if (e.pointerType === 'touch') return;
                      worldCarouselDragRef.current = {
                        isDown: true,
                        startX: e.clientX,
                        scrollLeft: e.currentTarget.scrollLeft,
                        hasDragged: false,
                      };
                    }}
                    onPointerMove={(e) => {
                      if (!worldCarouselDragRef.current.isDown) return;
                      const dx = e.clientX - worldCarouselDragRef.current.startX;
                      if (Math.abs(dx) > 6) {
                        worldCarouselDragRef.current.hasDragged = true;
                      }
                      e.currentTarget.scrollLeft = worldCarouselDragRef.current.scrollLeft - dx;
                    }}
                    onPointerUp={() => {
                      worldCarouselDragRef.current.isDown = false;
                    }}
                    onPointerLeave={() => {
                      worldCarouselDragRef.current.isDown = false;
                    }}
                    className="flex-1 min-h-0 w-full flex flex-row items-center gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory px-2 sm:px-4 py-2 select-none touch-pan-x cursor-grab active:cursor-grabbing"
                  >
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
                      const isFrostWorld = world.id === 4;
                      const isInfernoWorld = world.id === 5;
                      const isCelestiaWorld = world.id === 6;
                      const isChronosWorld = world.id === 7;
                      const isShadowveilWorld = world.id === 8;
                      const isCrystalWorld = world.id === 9;
                      const isRuinsWorld = world.id === 10;

                      const themeBorderClass = isRuinsWorld
                        ? 'border-lime-400/60 hover:border-lime-300'
                        : isCrystalWorld
                        ? 'border-fuchsia-400/60 hover:border-fuchsia-300'
                        : isShadowveilWorld
                        ? 'border-purple-400/60 hover:border-purple-300'
                        : isChronosWorld
                        ? 'border-yellow-400/60 hover:border-yellow-300'
                        : isCelestiaWorld
                        ? 'border-indigo-400/60 hover:border-indigo-300'
                        : isInfernoWorld
                        ? 'border-orange-400/60 hover:border-orange-300'
                        : isFrostWorld
                        ? 'border-sky-400/60 hover:border-sky-300'
                        : isDesertWorld
                        ? 'border-amber-400/60 hover:border-amber-300'
                        : isOceanWorld
                        ? 'border-cyan-400/60 hover:border-cyan-300'
                        : 'border-emerald-400/60 hover:border-emerald-300';

                      const themeColorClass = isRuinsWorld
                        ? 'text-lime-300'
                        : isCrystalWorld
                        ? 'text-fuchsia-300'
                        : isShadowveilWorld
                        ? 'text-purple-300'
                        : isChronosWorld
                        ? 'text-yellow-300'
                        : isCelestiaWorld
                        ? 'text-indigo-300'
                        : isInfernoWorld
                        ? 'text-orange-300'
                        : isFrostWorld
                        ? 'text-sky-300'
                        : isDesertWorld
                        ? 'text-amber-300'
                        : isOceanWorld
                        ? 'text-cyan-300'
                        : 'text-emerald-300';

                      const cleanWorldName = world.name.replace(/^World\s+\d+\s*:\s*/i, '').trim();

                      return (
                        <button
                          type="button"
                          key={world.id}
                          onClick={() => {
                            if (worldCarouselDragRef.current.hasDragged) {
                              worldCarouselDragRef.current.hasDragged = false;
                              return;
                            }
                            soundManager.playCoin();
                            setSelectedWorldId(world.id);
                            navigateToMenu('LEVEL_SELECT');
                          }}
                          className={`shrink-0 w-[210px] sm:w-[236px] min-h-[205px] sm:min-h-[230px] snap-center bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 ${themeBorderClass} active:scale-[0.98] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all cursor-pointer shadow-2xl`}
                        >
                          {/* 1. Number: WORLD X */}
                          <div className={`font-pixel text-sm sm:text-base ${themeColorClass} drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]`}>
                            WORLD {world.id}
                          </div>

                          {/* 2. Name: [Kingdom / Region Name] */}
                          <div className="font-pixel text-[10px] sm:text-xs text-white leading-relaxed line-clamp-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] my-2">
                            {cleanWorldName.toUpperCase()}
                          </div>

                          {/* 3. Stages & 4. Score (Vertical Stack) */}
                          <div className="w-full pt-3 border-t border-white/20 flex flex-col items-center gap-2">
                            <div className={`font-pixel text-[9px] sm:text-[10px] ${themeColorClass} drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}>
                              {worldCompletedCount}/{world.levels.length} STAGES
                            </div>
                            <div className="font-pixel text-[9px] sm:text-[10px] text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              SCORE: {worldScore.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. LEVEL SELECTION SCREEN (Transparent Top Header Bar, Repositioned Title, Scrollbar-Free Grid & 16-Bit Pixel Font) */}
              {gameState === 'LEVEL_SELECT' && (
                <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col p-3.5 sm:p-5 overflow-hidden">
                  {/* Top Navigation Header (Completely Transparent/Invisible Header Bar) */}
                  <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-transparent border-0 shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('WORLD_SELECT');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>WORLDS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('TITLE_MENU');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      HOME
                    </button>
                  </div>

                  {/* Repositioned Prominent Section Title Right Below Header */}
                  <div className="shrink-0 mt-3 sm:mt-4 mb-1 sm:mb-2 flex items-center justify-center">
                    <div className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl max-w-full">
                      <h2 className="font-pixel text-[10px] sm:text-sm md:text-base text-white text-center tracking-wide truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        WORLD {activeWorld.id}: {activeWorld.name.replace(/^World\s+\d+\s*:\s*/i, '').toUpperCase()}
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain mt-2 pr-0.5 flex flex-col">
                    <div className="my-auto grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-3.5">
                      {activeWorld.levels.map((lvl, idx) => {
                        const stageNum = lvl.stageNumber || idx + 1;
                        const worldNum = lvl.worldId || activeWorld.id;
                        const isUnlocked = isStageUnlocked(lvl.id);
                        const highScore = saveData.highScores[lvl.id] || 0;
                        const bestCoins = saveData.bestCoins[lvl.id] || 0;
                        const isCompleted = highScore > 0 || bestCoins > 0;

                        const buttonLabel = !isUnlocked
                          ? 'LOCKED'
                          : isCompleted
                          ? 'REPLAY'
                          : 'PLAY';

                        const cleanTitle = lvl.name
                          .replace(`Level ${lvl.id}: `, '')
                          .replace(`Stage ${worldNum}-${stageNum}: `, '');

                        return (
                          <div
                            key={lvl.id}
                            className={`flex flex-col justify-between rounded-2xl backdrop-blur-md border-2 p-3.5 sm:p-4 transition-all ${
                              isUnlocked
                                ? 'bg-slate-950/55 border-white/25 hover:border-emerald-400/80 shadow-xl'
                                : 'bg-slate-950/40 border-white/15 opacity-75 shadow-md'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between font-pixel text-[9px] sm:text-[10px] text-amber-300">
                                <span>
                                  STAGE {worldNum}-{stageNum}
                                </span>
                                {isUnlocked ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                              </div>

                              <h3 className="font-pixel text-[10px] sm:text-xs text-white leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {cleanTitle.toUpperCase()}
                              </h3>
                              <p className="text-[11px] text-slate-200/90 leading-relaxed">{lvl.subtitle}</p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-white/20 space-y-2.5">
                              <div className="font-pixel text-[8px] sm:text-[9px] text-amber-200 flex items-center justify-between gap-1">
                                <span>TOP: {highScore.toLocaleString()}</span>
                                <span>COINS: {bestCoins}</span>
                              </div>

                              <button
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => {
                                  soundManager.playCoin();
                                  startLevel(lvl.id, true);
                                }}
                                className={`w-full min-h-[40px] sm:min-h-[42px] py-2 px-3 rounded-xl font-pixel text-[10px] transition-all whitespace-nowrap shrink-0 ${
                                  isUnlocked
                                    ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 border-b-4 border-emerald-700 cursor-pointer shadow-lg'
                                    : 'bg-slate-800/80 text-slate-400 border border-white/10 cursor-not-allowed'
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
                </div>
              )}

              {/* 4. SETTINGS HUB PAGE (Transparent Top Header Bar, Repositioned Title & Frosted Cards) */}
              {gameState === 'SETTINGS_HUB' && (
                <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col p-3.5 sm:p-5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-transparent border-0 shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('TITLE_MENU');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>HOME</span>
                    </button>
                    <div className="w-10" />
                  </div>

                  <div className="shrink-0 mt-3 sm:mt-4 mb-1 sm:mb-2 flex items-center justify-center">
                    <div className="px-5 py-2 sm:px-7 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl">
                      <h2 className="font-pixel text-xs sm:text-base md:text-lg text-white text-center tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        SETTINGS
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain mt-2 pr-0.5 flex flex-col">
                    <div className="my-auto w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* AUDIO CARD -> Opens the Audio & Save Settings Page */}
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playCoin();
                          navigateToMenu('SETTINGS');
                        }}
                        className="group text-left bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25 hover:border-emerald-400/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all cursor-pointer shadow-2xl"
                      >
                        <div className="space-y-3.5">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-pixel text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">
                              AUDIO
                            </h3>
                            <p className="text-xs text-slate-200/90 leading-relaxed">
                              Configure sound effects, 16-bit background music, master volume, and saved game data.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3.5 border-t border-white/20 font-pixel text-[9px] sm:text-[10px] text-emerald-300">
                          <span>OPEN AUDIO</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      {/* HELP CARD -> Opens the Controls & Mechanics Page */}
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playCoin();
                          navigateToMenu('CONTROLS');
                        }}
                        className="group text-left bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25 hover:border-amber-400/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all cursor-pointer shadow-2xl"
                      >
                        <div className="space-y-3.5">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-pixel text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                              HELP
                            </h3>
                            <p className="text-xs text-slate-200/90 leading-relaxed">
                              View keyboard controls, power-up guides, platforming tips, and boss battle strategies.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3.5 border-t border-white/20 font-pixel text-[9px] sm:text-[10px] text-amber-300">
                          <span>OPEN HELP</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. HELP / CONTROLS & MECHANICS SCREEN (Transparent Top Header Bar) */}
              {gameState === 'CONTROLS' && (
                <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col p-3.5 sm:p-5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-transparent border-0 shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('SETTINGS_HUB');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>BACK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('TITLE_MENU');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      HOME
                    </button>
                  </div>

                  <div className="shrink-0 mt-3 sm:mt-4 mb-1 sm:mb-2 flex items-center justify-center">
                    <div className="px-5 py-2 sm:px-7 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl">
                      <h2 className="font-pixel text-xs sm:text-base text-white text-center tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        CONTROLS & HELP
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain mt-2 pr-0.5 space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                      <div className="space-y-2.5 bg-slate-950/55 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20 shadow-xl">
                        <h3 className="font-pixel text-[10px] sm:text-xs text-emerald-300">KEYBOARD CONTROLS</h3>
                        <div className="space-y-2 text-slate-200 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-white/15">
                            <span>Move Left / Right</span>
                            <span className="font-mono-num text-amber-300">A / D or Left / Right Arrows</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/15">
                            <span>Duck / Sit (When Grown)</span>
                            <span className="font-mono-num text-amber-300">S or Down Arrow</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/15">
                            <span>Charged Super Jump (Big / Fire)</span>
                            <span className="font-mono-num text-amber-300">Hold Down (1.5s) + Jump</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/15">
                            <span>Jump / Fly / Slow Fall</span>
                            <span className="font-mono-num text-amber-300">Space, W, or Up Arrow</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/15">
                            <span>Sprint / Fireball / Tail Attack</span>
                            <span className="font-mono-num text-amber-300">Shift, X, or J</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span>Pause / Resume Game</span>
                            <span className="font-mono-num text-amber-300">Escape or P</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 bg-slate-950/55 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20 shadow-xl">
                        <h3 className="font-pixel text-[10px] sm:text-xs text-amber-300">PLATFORMING TIPS</h3>
                        <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                          <li>Hold the Jump key longer for higher leaps across wide chasms.</li>
                          <li>Hold Shift while moving to build sprint momentum and jump farther.</li>
                          <li>In Big or Fire form, hold Down for 1.5 seconds until your character blinks, then press Jump for a massive Charged Super Jump!</li>
                          <li>In Raccoon form, press Fire/Attack to spin your tail and hit enemies or blocks!</li>
                          <li>In boss stages, wait for the boss to tire after attacking, then stomp its head, whip your Raccoon tail, or blast it with Fireballs to win!</li>
                        </ul>
                      </div>
                    </div>

                    {/* Power-Ups Reference Row */}
                    <div className="bg-slate-950/55 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 space-y-2.5 shadow-xl">
                      <div className="font-pixel text-[10px] sm:text-xs text-amber-300">POWER-UP ITEMS</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-red-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">Growth Mushroom</div>
                            <div className="text-slate-300">Grows Pip larger, breaks bricks & absorbs 1 hit.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                            <Feather className="w-4 h-4 text-amber-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">Raccoon Feather</div>
                            <div className="text-slate-300">
                              Fly on sprint-jumps, hold Jump to slow-fall, & press Fire/Shift to spin-attack!
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shrink-0">
                            <Flame className="w-4 h-4 text-orange-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">Solar Fire Flower</div>
                            <div className="text-slate-300">Press Shift or X to launch bouncing fireballs.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-amber-200" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">Invincibility Star</div>
                            <div className="text-slate-300">Temporary rainbow armor defeats foes on touch.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. AUDIO & SAVE SETTINGS SCREEN (Transparent Top Header Bar) */}
              {gameState === 'SETTINGS' && (
                <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col p-3.5 sm:p-5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-transparent border-0 shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('SETTINGS_HUB');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>BACK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCoin();
                        navigateToMenu('TITLE_MENU');
                      }}
                      className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 font-pixel text-[10px] sm:text-xs text-white bg-slate-950/55 hover:bg-slate-900/65 active:scale-[0.98] backdrop-blur-md border-2 border-white/25 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                    >
                      HOME
                    </button>
                  </div>

                  <div className="shrink-0 mt-3 sm:mt-4 mb-1 sm:mb-2 flex items-center justify-center">
                    <div className="px-5 py-2 sm:px-7 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-emerald-300 shrink-0" />
                      <h2 className="font-pixel text-xs sm:text-base text-white text-center tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        AUDIO SETTINGS
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain mt-2 pr-0.5 flex flex-col">
                    <div className="my-auto w-full max-w-xl mx-auto space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/55 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-xl gap-3">
                        <div>
                          <div className="font-pixel text-[10px] sm:text-xs text-white">SOUND EFFECTS</div>
                          <div className="text-[11px] sm:text-xs text-slate-200/90 mt-1">Jumps, coins, block breaks & boss hits</div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleSound}
                          className={`min-h-[38px] sm:min-h-[42px] px-4 py-2 rounded-xl font-pixel text-[10px] transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            saveData.soundEnabled
                              ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700 shadow-md'
                              : 'bg-white/15 text-slate-200 border border-white/25'
                          }`}
                        >
                          {saveData.soundEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/55 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-xl gap-3">
                        <div>
                          <div className="font-pixel text-[10px] sm:text-xs text-white">16-BIT MUSIC</div>
                          <div className="text-[11px] sm:text-xs text-slate-200/90 mt-1">Synthesized chiptune stage themes</div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleMusic}
                          className={`min-h-[38px] sm:min-h-[42px] px-4 py-2 rounded-xl font-pixel text-[10px] transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            saveData.musicEnabled
                              ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700 shadow-md'
                              : 'bg-white/15 text-slate-200 border border-white/25'
                          }`}
                        >
                          {saveData.musicEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="p-3.5 sm:p-4 bg-slate-950/55 backdrop-blur-md rounded-2xl border-2 border-white/20 space-y-2 shadow-xl">
                        <div className="flex items-center justify-between font-pixel text-[10px] sm:text-xs">
                          <span className="text-white">MASTER VOLUME</span>
                          <span className="text-amber-300">
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

                      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/55 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-xl gap-3">
                        <div className="text-[11px] sm:text-xs text-slate-200/90">
                          Reset unlocked levels and high scores in localStorage
                        </div>
                        <button
                          type="button"
                          onClick={handleResetSave}
                          className="min-h-[38px] sm:min-h-[42px] px-3.5 py-2 font-pixel text-[9px] sm:text-[10px] text-red-200 bg-red-950/65 hover:bg-red-900/75 border border-red-400/50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          RESET SAVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Portrait Bottom Ad Banner Placeholder (Rendered on Web; in Native Expo, the real AdMob BannerAd component mounts in this bottom slot) */}
            {!isNativeExpoApp && (
              <div
                id="mobile-home-ad-banner-slot"
                data-ad-slot="HOME_BOTTOM_BANNER"
                role="region"
                aria-label="Advertisement Banner Placeholder"
                className="mt-1.5 w-full h-[50px] sm:hidden shrink-0 rounded-xl bg-slate-950/55 backdrop-blur-md border border-white/20 flex items-center justify-center px-3 shadow-inner"
              >
                <span className="font-pixel text-[8px] tracking-widest uppercase text-slate-300/90 select-none">
                  Ad Banner Space
                </span>
              </div>
            )}
          </div>
        )}

        {/* 7. ACTIVE GAMEPLAY VIEWPORT + RETRO HUD + SIDE-MARGIN MOBILE CONTROLLERS */}
        {(gameState === 'PLAYING' ||
          gameState === 'PAUSED' ||
          gameState === 'LEVEL_COMPLETE' ||
          gameState === 'GAME_OVER' ||
          gameState === 'TIME_OUT' ||
          gameState === 'WORLD_VICTORY') && (
          <div className="w-full max-w-full flex items-end sm:items-center justify-center gap-1.5 sm:gap-3">
            {/* LEFT EMPTY SIDE MARGIN: Clean Virtual Joystick / Thumbstick — Strictly Hidden on Desktop/PC */}
            {isMobileTouch && gameState === 'PLAYING' && (
              <div className="mobile-touch-controls w-[126px] sm:w-[144px] shrink-0 self-end flex flex-col items-center justify-end pb-3 sm:pb-5 select-none touch-none pointer-events-none z-10">
                <div
                  role="group"
                  aria-label="Virtual Thumbstick"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    activeJoystickPointerRef.current = e.pointerId;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    cacheJoystickBounds(e.currentTarget);
                    updateJoystickFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (activeJoystickPointerRef.current !== e.pointerId) return;
                    e.preventDefault();
                    updateJoystickFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerUp={(e) => {
                    if (activeJoystickPointerRef.current !== e.pointerId) return;
                    e.preventDefault();
                    resetJoystick();
                  }}
                  onPointerCancel={(e) => {
                    if (activeJoystickPointerRef.current !== e.pointerId) return;
                    e.preventDefault();
                    resetJoystick();
                  }}
                  onLostPointerCapture={() => {
                    resetJoystick();
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="pointer-events-auto relative w-[116px] h-[116px] sm:w-[130px] sm:h-[130px] rounded-full bg-slate-900/70 border-2 border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.65),inset_0_2px_6px_rgba(255,255,255,0.16)] flex items-center justify-center cursor-pointer select-none touch-none"
                >
                  {/* Sleek Centered Inner Knob / Handle (Moves smoothly Left, Right, or Down) */}
                  <div
                    ref={joystickKnobRef}
                    style={{ willChange: 'transform' }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 pointer-events-none shadow-[0_4px_14px_rgba(0,0,0,0.65),inset_0_2px_3px_rgba(255,255,255,0.45)] ${
                      activeVirtualKeys['ArrowDown']
                        ? 'bg-gradient-to-b from-amber-400/60 to-amber-600/35 border-white/95'
                        : activeVirtualKeys['ArrowLeft'] || activeVirtualKeys['ArrowRight']
                        ? 'bg-gradient-to-b from-emerald-400/60 to-emerald-600/35 border-white/95'
                        : 'bg-gradient-to-b from-white/35 to-white/15 border-white/60'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* CENTER GAMEPLAY COLUMN: Top Header Bar + Boss Health Bar + Unobstructed 896x608 Native Pixel Canvas */}
            <div
              className="flex flex-col items-center w-full max-w-[920px] max-h-full min-w-0"
              style={{
                maxWidth: isMobileTouch
                  ? 'min(calc(100vw - 264px), calc((100dvh - 46px) * (896 / 608)))'
                  : 'calc((100dvh - 52px) * (896 / 608))',
              }}
            >
              {/* Top Retro HUD Bar - strictly hidden whenever any modal (Pause, Success, Failure, Timeout) is active */}
              {gameState === 'PLAYING' && (
                <div className="relative z-30 pointer-events-auto w-full bg-slate-900 border border-slate-800 rounded-t-xl px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 text-xs whitespace-nowrap overflow-hidden shrink-0">
                  <div
                    className={`flex items-center ${
                      isMobileTouch ? 'gap-2 sm:gap-3' : 'gap-4'
                    } font-mono-num min-w-0 whitespace-nowrap`}
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                      <span
                        className={`font-bold text-white ${
                          isMobileTouch ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                        }`}
                      >
                        {hud.score.toString().padStart(6, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <GoldCoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span
                        className={`font-bold text-yellow-300 ${
                          isMobileTouch ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                        }`}
                      >
                        ×{hud.coins.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                        hud.timeRemaining <= 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                      }`}
                      title="Remaining Stage Time"
                    >
                      <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span
                        className={`font-bold ${
                          isMobileTouch ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                        }`}
                      >
                        {Math.floor(hud.timeRemaining / 60)}:
                        {(hud.timeRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {isMobileTouch ? (
                      <div
                        className="flex items-center gap-1 shrink-0"
                        aria-label={`Health: ${hud.lives}`}
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                        <span className="font-bold text-white text-[11px] sm:text-xs">
                          x{hud.lives}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-0.5 sm:gap-1 shrink-0"
                        aria-label={`Health: ${hud.lives}`}
                      >
                        {Array.from({ length: Math.max(3, Math.min(5, hud.lives)) }).map(
                          (_, idx) => {
                            const isFilled = idx < hud.lives;
                            return (
                              <Heart
                                key={idx}
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                                  isFilled
                                    ? 'text-rose-500 fill-rose-500'
                                    : 'text-slate-600 fill-slate-800'
                                }`}
                              />
                            );
                          }
                        )}
                        {hud.lives > 5 && (
                          <span className="font-bold text-white text-xs sm:text-sm ml-0.5">
                            ×{hud.lives}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center ${
                      isMobileTouch ? 'gap-2' : 'gap-3.5'
                    } shrink-0 whitespace-nowrap`}
                  >
                    <div
                      className={`text-slate-200 font-bold font-mono-num ${
                        isMobileTouch ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                      } whitespace-nowrap`}
                    >
                      World {activeWorldNum}-{activeStageNum}
                    </div>

                    <div className="flex items-center shrink-0">
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          if (engineRef.current) {
                            engineRef.current.setPaused(true);
                          }
                          soundManager.pauseAllAudio();
                          setGameState('PAUSED');
                        }}
                        title="Pause Game"
                        aria-label="Pause Game"
                        className={`pointer-events-auto touch-manipulation flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer text-xs ${
                          isMobileTouch
                            ? 'p-1.5 sm:p-2'
                            : 'gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2'
                        }`}
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        {!isMobileTouch && <span>Pause</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boss Health Bar Banner during Final Castle Fight (Also hidden when modal is active) */}
              {gameState === 'PLAYING' && hud.boss && hud.boss.active && (
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
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (hud.boss.hp / Math.max(1, hud.boss.maxHp)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono-num text-[11px] sm:text-xs font-bold text-white">
                      HP: {hud.boss.hp}/{hud.boss.maxHp}
                    </span>
                  </div>
                </div>
              )}

              {/* Game Canvas Container (28x19 tiles = 896x608 native 1:1 pixel ratio — no stretching or distortion) */}
              <div
                className={`relative w-full aspect-[896/608] bg-slate-950 border-slate-800 overflow-hidden shadow-2xl mx-auto ${
                  gameState === 'PLAYING'
                    ? 'border-x border-b rounded-b-xl'
                    : 'border rounded-xl'
                }`}
                style={{
                  maxHeight: 'calc(100dvh - 46px)',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full h-full block pixelated"
                />

                {/* PAUSE MODAL OVERLAY (Freezes timer, pauses audio, hides main header) */}
                {gameState === 'PAUSED' && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex items-center justify-center p-2 overflow-hidden z-20">
                    <div
                      className={`w-full bg-slate-900 border border-slate-700 rounded-2xl text-center shadow-2xl my-auto ${
                        isMobileTouch
                          ? 'max-w-[280px] p-2.5 space-y-2'
                          : 'max-w-sm p-5 space-y-3.5'
                      }`}
                    >
                      <div className="min-w-0">
                        <h3
                          className={`font-pixel text-amber-400 ${
                            isMobileTouch ? 'text-xs' : 'text-base'
                          }`}
                        >
                          GAME PAUSED
                        </h3>
                        <p
                          className={`text-slate-300 truncate ${
                            isMobileTouch ? 'text-[10px] mt-0.5' : 'text-xs mt-1'
                          }`}
                        >
                          {hud.levelName}
                        </p>
                      </div>

                      <div className={`flex flex-col ${isMobileTouch ? 'gap-1.5' : 'gap-2'}`}>
                        <button
                          type="button"
                          onClick={() => {
                            if (engineRef.current) {
                              engineRef.current.setPaused(false);
                            }
                            soundManager.resumeAudio();
                            setGameState('PLAYING');
                          }}
                          className={`w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow transition-colors cursor-pointer ${
                            isMobileTouch
                              ? 'min-h-[34px] py-1.5 px-3 text-[11px]'
                              : 'min-h-[38px] py-2 px-4 text-xs'
                          }`}
                        >
                          Resume Game
                        </button>

                        <div className={`grid grid-cols-2 ${isMobileTouch ? 'gap-1.5' : 'gap-2'}`}>
                          <button
                            type="button"
                            onClick={() => startLevel(currentLevelId, false)}
                            className={`bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition-colors cursor-pointer ${
                              isMobileTouch
                                ? 'min-h-[32px] py-1.5 px-2.5 text-[11px]'
                                : 'min-h-[36px] py-1.5 px-3 text-xs'
                            }`}
                          >
                            Restart
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateToMenu('LEVEL_SELECT')}
                            className={`bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer ${
                              isMobileTouch
                                ? 'min-h-[32px] py-1.5 px-2.5 text-[11px]'
                                : 'min-h-[36px] py-1.5 px-3 text-xs'
                            }`}
                          >
                            Level Select
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigateToMenu('TITLE_MENU')}
                          className={`w-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-medium rounded-lg transition-colors cursor-pointer ${
                            isMobileTouch
                              ? 'min-h-[28px] py-1 px-2.5 text-[10px]'
                              : 'min-h-[32px] py-1 px-3 text-[11px]'
                          }`}
                        >
                          Home Screen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* UNIFIED REUSABLE STAGE OUTCOME MODAL ('stage_cleared', 'game_over', 'time_out') */}
                {(gameState === 'LEVEL_COMPLETE' ||
                  gameState === 'WORLD_VICTORY' ||
                  gameState === 'GAME_OVER' ||
                  gameState === 'TIME_OUT') && (
                  <StageOutcomeModal
                    variant={
                      gameState === 'LEVEL_COMPLETE' || gameState === 'WORLD_VICTORY'
                        ? 'stage_cleared'
                        : gameState === 'TIME_OUT'
                        ? 'time_out'
                        : 'game_over'
                    }
                    isWorldVictory={gameState === 'WORLD_VICTORY'}
                    isMobileTouch={isMobileTouch}
                    currentLevelId={currentLevelId}
                    levelName={hud.levelName}
                    score={carriedScore}
                    coins={carriedCoins}
                    isWatchingAd={isWatchingAd}
                    onPrimaryAction={() => {
                      if (gameState === 'LEVEL_COMPLETE' || gameState === 'WORLD_VICTORY') {
                        const nextId = currentLevelId >= 50 ? 1 : currentLevelId + 1;
                        startLevel(nextId, false);
                      } else {
                        handleWatchAdAndRevive();
                      }
                    }}
                    onSecondaryRetry={() => {
                      if (gameState === 'LEVEL_COMPLETE' || gameState === 'WORLD_VICTORY') {
                        startLevel(currentLevelId, false);
                      } else {
                        startLevel(currentLevelId, true);
                      }
                    }}
                    onLevelSelect={() => navigateToMenu('LEVEL_SELECT')}
                  />
                )}
              </div>
            </div>

            {/* RIGHT EMPTY SIDE MARGIN: Separated Mobile Action Buttons (Fire 🔥 & Jump ↑ in 100% Transparent Container) — Strictly Hidden on Desktop/PC */}
            {isMobileTouch && gameState === 'PLAYING' && (
              <div
                style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                className="mobile-touch-controls w-[126px] sm:w-[144px] shrink-0 self-end flex flex-col items-center justify-end pb-3 sm:pb-5 bg-transparent border-0 shadow-none select-none touch-none pointer-events-none z-10"
              >
                <div
                  style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                  className="bg-transparent border-0 shadow-none p-0 flex items-end justify-center gap-3 sm:gap-3.5"
                >
                  {/* Fire / Spin Attack / Sprint Button (🔥 — Lower / Backward) */}
                  <button
                    type="button"
                    aria-label="Fire and Sprint"
                    {...bindVirtualButton('KeyX')}
                    className={`pointer-events-auto touch-manipulation w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-transform duration-75 cursor-pointer select-none touch-none shadow-[0_4px_12px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.35)] ${
                      activeVirtualKeys['KeyX']
                        ? 'bg-orange-400/60 border-white/95 text-white scale-95'
                        : 'bg-gradient-to-b from-orange-500/35 to-orange-600/15 hover:from-orange-500/45 hover:to-orange-600/25 border-white/40 text-orange-100'
                    }`}
                  >
                    <Flame className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.4]" />
                  </button>

                  {/* Jump Button (↑ — Higher / Forward Diagonal Layout) */}
                  <button
                    type="button"
                    aria-label="Jump"
                    {...bindVirtualButton('Space')}
                    className={`pointer-events-auto touch-manipulation w-15 h-15 sm:w-[68px] sm:h-[68px] -translate-y-3.5 rounded-full border-2 flex items-center justify-center transition-transform duration-75 cursor-pointer select-none touch-none shadow-[0_4px_12px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.35)] ${
                      activeVirtualKeys['Space']
                        ? 'bg-emerald-400/60 border-white/95 text-white scale-95'
                        : 'bg-gradient-to-b from-emerald-500/35 to-emerald-600/15 hover:from-emerald-500/45 hover:to-emerald-600/25 border-white/40 text-emerald-100'
                    }`}
                  >
                    <ArrowUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.75]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
