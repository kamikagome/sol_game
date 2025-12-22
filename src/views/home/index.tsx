// Next, React
import { FC, useState } from 'react';
import pkg from '../../../package.json';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Solana
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Moon That
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
          {/* Fake “feed card” top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start px-3 pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-white/10 px-2 text-[9px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};

// ✅ THIS IS THE ONLY PART YOU EDIT FOR THE JAM
// Replace this entire GameSandbox component with the one AI generates.
// Keep the name `GameSandbox` and the `FC` type.

const GameSandbox: FC = () => {
  // -------------------------------------------------------------------------
  // FIX: Access React hooks via require() to adhere to "No New Imports" rule
  // -------------------------------------------------------------------------
  const { useEffect, useRef } = require('react');

  // Game Configuration
  const WIN_SCORE = 1500;
  const GAME_DURATION = 30; // seconds
  const SOLANA_LOGO_URL = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

  // State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'WON' | 'LOST'>('MENU');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isBomb, setIsBomb] = useState(false);
  const [feedback, setFeedback] = useState<{ id: number; text: string; type: 'good' | 'bad' } | null>(null);

  // Grid setup
  const gridSlots = Array.from({ length: 12 }, (_, i) => i);

  // REFS (Logic preservation)
  const scoreRef = useRef(score);
  const gameStateRef = useRef(gameState);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Game Loop: Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState(scoreRef.current >= WIN_SCORE ? 'WON' : 'LOST');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Game Loop: Spawner
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let spawnTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const spawn = () => {
      if (gameStateRef.current !== 'PLAYING') return;

      const currentScore = scoreRef.current;
      const speedFactor = Math.min(currentScore / 50, 400);
      const delay = Math.random() * (800 - speedFactor) + 200;

      spawnTimeout = setTimeout(() => {
        if (gameStateRef.current !== 'PLAYING') return;

        const slot = Math.floor(Math.random() * 12);
        const bomb = Math.random() > 0.8; 
        
        setActiveSlot(slot);
        setIsBomb(bomb);

        const stayTime = Math.max(400, 1000 - currentScore / 2);
        
        hideTimeout = setTimeout(() => {
          setActiveSlot(null);
          spawn(); 
        }, stayTime);
      }, delay);
    };

    spawn();

    return () => {
      clearTimeout(spawnTimeout);
      clearTimeout(hideTimeout);
    };
  }, [gameState]);

  const handleStart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('PLAYING');
    setActiveSlot(null);
    setFeedback(null);
  };

  const handleTap = (index: number) => {
    if (gameState !== 'PLAYING' || activeSlot !== index) return;

    setActiveSlot(null);

    if (isBomb) {
      setFeedback({ id: index, text: 'BOOM!', type: 'bad' });
      setTimeout(() => {
        setGameState('LOST');
        setFeedback(null);
      }, 300);
    } else {
      setScore((s) => s + 100);
      setFeedback({ id: index, text: '+100', type: 'good' });
      setTimeout(() => setFeedback(null), 300);
    }
  };

  return (
    // ROOT: Mobile (default) -> Desktop (md:fixed overlay)
    <div className="flex flex-col items-center justify-center w-full h-full p-4 md:fixed md:inset-0 md:z-50 md:bg-black/90 md:backdrop-blur-xl transition-all duration-500">
      
      {/* PHONE FRAME */}
      <div className="relative w-full max-w-[340px] aspect-[9/16] md:max-w-none md:h-[85vh] md:w-auto bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-slate-800 select-none font-sans transition-all duration-500 ring-1 ring-white/10">
        
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent z-0 pointer-events-none" />

        {/* HUD */}
        <div className="relative z-20 flex justify-between items-end px-5 py-4 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Score</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-none filter drop-shadow-lg">
              {score}
            </span>
          </div>
          
          {/* Desktop Title Hint */}
          <div className="hidden md:flex flex-col items-center justify-center pb-1">
             <span className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Neon Solana</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Time</span>
            <span className={`text-3xl font-black leading-none drop-shadow-lg ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
              {timeLeft}<span className="text-sm font-bold ml-0.5 opacity-70">s</span>
            </span>
          </div>
        </div>

        {/* GRID CONTAINER */}
        <div className="relative z-10 grid grid-cols-3 gap-3 p-3 h-full content-center">
          {gridSlots.map((i) => (
            <button
              key={i}
              onClick={() => handleTap(i)}
              // 3D BUTTON STYLING:
              // - Normal: border-b-4 gives height
              // - Active: border-b-0 + translate-y-1 squishes it down
              className={`relative group w-full aspect-square rounded-2xl transition-all duration-75 ease-out touch-manipulation
                ${activeSlot === i 
                  ? 'bg-slate-700 border-b-0 border-slate-900 translate-y-1 brightness-110' 
                  : 'bg-slate-800 border-b-4 border-slate-950 hover:bg-slate-750 hover:border-slate-900 active:border-b-0 active:translate-y-1'
                }
              `}
            >
              {/* Inner Hole / Recess */}
              <div className="absolute inset-1 rounded-xl bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center overflow-hidden">
                
                {/* ENTITY ANIMATION WRAPPER */}
                <div 
                  className={`relative w-full h-full flex items-center justify-center transition-all duration-150 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${activeSlot === i ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-8'}
                  `}
                >
                  {activeSlot === i && (
                    isBomb ? (
                      // BOMB
                      <span className="text-4xl md:text-5xl filter drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse">
                        👾
                      </span>
                    ) : (
                      // SOLANA LOGO
                      <div className="relative w-4/5 h-4/5 group-active:scale-90 transition-transform">
                         {/* Glow effect behind coin */}
                         <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse" />
                         <img 
                          src={SOLANA_LOGO_URL}
                          alt="Solana" 
                          className="relative w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" 
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Feedback Text Popups */}
              {feedback?.id === i && (
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 font-black text-xl md:text-2xl animate-[bounce_0.4s_ease-out] z-30 pointer-events-none whitespace-nowrap
                  ${feedback.type === 'good' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_0_rgba(0,0,0,1)]' 
                    : 'text-red-500 drop-shadow-[0_2px_0_rgba(0,0,0,1)]'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* OVERLAYS (MENU / WIN / LOSS) */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
            
            {gameState === 'MENU' && (
              <>
                <div className="relative w-28 h-28 md:w-36 md:h-36 mb-6 animate-[bounce_2s_infinite]">
                   <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                   <img 
                    src={SOLANA_LOGO_URL} 
                    alt="Solana Logo" 
                    className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                  />
                </div>
                <div className="space-y-2 mb-8">
                  <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">SOLANA</span><br/>
                    SMASH
                  </h1>
                  <p className="text-slate-400 font-medium">Tap coins. Dodge glitches.</p>
                </div>
                <button 
                  onClick={handleStart}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-black text-white shadow-[0_10px_20px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 origin-left" />
                  START GAME
                </button>
              </>
            )}

            {gameState === 'LOST' && (
              <>
                <div className="text-7xl md:text-9xl mb-4 animate-pulse">👾</div>
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-black text-red-500 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">GAME OVER</h2>
                  <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Final Score</p>
                    <p className="text-3xl font-black text-white">{score}</p>
                  </div>
                </div>
                <button 
                  onClick={handleStart}
                  className="px-8 py-3 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-full shadow-lg transition-transform active:scale-95"
                >
                  TRY AGAIN
                </button>
              </>
            )}

            {gameState === 'WON' && (
              <>
                <div className="text-7xl md:text-9xl mb-4 animate-[spin_3s_linear_infinite]">👑</div>
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">VICTORY!</h2>
                  <div className="mt-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-yellow-200 text-xs uppercase tracking-widest mb-1">Final Score</p>
                    <p className="text-3xl font-black text-white">{score}</p>
                  </div>
                </div>
                <button 
                  onClick={handleStart}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform hover:scale-105 active:scale-95"
                >
                  PLAY AGAIN
                </button>
              </>
            )}
          </div>
        )}

      </div>
      
      {/* Footer / Context */}
      <div className="mt-6 text-xs text-slate-500 font-mono tracking-wide">
        <span className="md:hidden opacity-50">Target: {WIN_SCORE} pts</span>
        <span className="hidden md:inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          Desktop Mode Active · Target: {WIN_SCORE}
        </span>
      </div>
    </div>
  );
};