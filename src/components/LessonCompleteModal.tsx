import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Target, Clock, Flame, Gem, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { LanguageCode } from '../types';

interface LessonCompleteModalProps {
  results: {
    totalXp: number;
    accuracy: number;
    timeSeconds: number;
  };
  streakDays: number;
  gemsReward: number;
  language: LanguageCode;
  onClose: () => void;
}

export const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({
  results,
  streakDays,
  gemsReward,
  language,
  onClose,
}) => {
  const isAr = language === 'ar';

  useEffect(() => {
    soundEffects.playLevelUp();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Mascot / Trophy Avatar Header */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <img
            src="/src/assets/images/pyquest_mascot_avatar_1791276239891.jpg"
            alt="PyQuest Mascot"
            className="relative w-full h-full object-cover rounded-full border-4 border-emerald-400 shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isAr ? 'مرحلة مكتملة بنجاح! 🏆' : 'Lesson Complete! 🏆'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAr ? 'أداء رائع! لقد اكتسبت مهارات برمجية جديدة اليوم' : 'Fantastic work! You leveled up your coding skills today'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-start">
          {/* XP Gained */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">{isAr ? 'النقاط المكتسبة' : 'Total XP'}</div>
              <div className="text-base font-extrabold text-purple-300">+{results.totalXp} XP</div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">{isAr ? 'نسبة الدقة' : 'Accuracy'}</div>
              <div className="text-base font-extrabold text-emerald-300">{results.accuracy}%</div>
            </div>
          </div>

          {/* Time Taken */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">{isAr ? 'الوقت المستغرق' : 'Time Taken'}</div>
              <div className="text-base font-extrabold text-cyan-300">{results.timeSeconds}s</div>
            </div>
          </div>

          {/* Streak Boost */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">{isAr ? 'السلسلة اليومية' : 'Daily Streak'}</div>
              <div className="text-base font-extrabold text-amber-300">{streakDays} {isAr ? 'أيام' : 'days'}</div>
            </div>
          </div>
        </div>

        {/* Gems Reward Highlight */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Gem className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>{isAr ? 'مكافأة إضافية من الجواهر:' : 'Bonus Gem Reward:'}</span>
          </div>
          <span className="text-cyan-400 font-extrabold text-sm">+{gemsReward} 💎</span>
        </div>

        {/* Return Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>{isAr ? 'متابعة إلى خريطة المراحل' : 'Continue to Map'}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
