import React, { useState } from 'react';
import { X, Gamepad2, Trophy, Sparkles, Volume2, VolumeX, Flame, Zap, Award, HelpCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';
import { CarRacerGame } from './arcade/CarRacerGame';
import { ShooterGame } from './arcade/ShooterGame';
import { LifeSimGame } from './arcade/LifeSimGame';

interface ArcadeModalProps {
  language: LanguageCode;
  onClose: () => void;
  onRewardPlayer: (xp: number, gems: number) => void;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({
  language,
  onClose,
  onRewardPlayer,
}) => {
  const isAr = language === 'ar';
  const [activeGame, setActiveGame] = useState<'racer' | 'shooter' | 'lifesim'>('racer');
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [sessionGemsEarned, setSessionGemsEarned] = useState(0);

  const handleEarnRewards = (xp: number, gems: number) => {
    if (xp > 0 || gems > 0) {
      setSessionXpEarned((prev) => prev + xp);
      setSessionGemsEarned((prev) => prev + gems);
      onRewardPlayer(xp, gems);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'مركز الألعاب التفاعلي (PyQuest Arcade Zone)' : 'PyQuest Arcade Zone'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'العب سباق سيارات، طخ ورماية، ومحاكاة حياة واقعية واكسب XP وجواهر حقيقية!'
                  : 'Play Racing, Space Blaster, and Real Life RPG to earn real XP & Gems!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rewards telemetry */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-purple-400 font-bold font-mono">+{sessionXpEarned} XP</span>
              <span>·</span>
              <span className="text-cyan-400 font-bold font-mono">+{sessionGemsEarned} 💎</span>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveGame('racer');
            }}
            className={`px-3 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeGame === 'racer'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="text-lg">🏎️</span>
            <span>{isAr ? 'سباق سيارات وكراج بايثون' : 'Grand Prix & Garage'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveGame('shooter');
            }}
            className={`px-3 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeGame === 'shooter'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="text-lg">🪖</span>
            <span>{isAr ? 'كونترا حرب وطخ (Contra)' : 'Cyber Contra'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveGame('lifesim');
            }}
            className={`px-3 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeGame === 'lifesim'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="text-lg">🌆</span>
            <span>{isAr ? 'عالم مدينة السايبربانك (2D City)' : 'Cyber City RPG'}</span>
          </button>
        </div>

        {/* Game Stage Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex items-center justify-center">
          {activeGame === 'racer' && (
            <CarRacerGame isAr={isAr} onEarnRewards={handleEarnRewards} />
          )}

          {activeGame === 'shooter' && (
            <ShooterGame isAr={isAr} onEarnRewards={handleEarnRewards} />
          )}

          {activeGame === 'lifesim' && (
            <LifeSimGame isAr={isAr} onEarnRewards={handleEarnRewards} />
          )}
        </div>
      </div>
    </div>
  );
};
