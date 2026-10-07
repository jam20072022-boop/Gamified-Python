import React from 'react';
import { X, Award, Zap, Target, Flame, BookCheck, RotateCcw } from 'lucide-react';
import { UserStats, LanguageCode } from '../types';
import { BADGES } from '../data/curriculum';
import { soundEffects } from '../services/soundEffects';

interface ProfileModalProps {
  userStats: UserStats;
  language: LanguageCode;
  onClose: () => void;
  onResetProgress: () => void;
  onOpenAuth?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userStats,
  language,
  onClose,
  onResetProgress,
  onOpenAuth,
}) => {
  const isAr = language === 'ar';

  // Compute Level & Rank
  const level = Math.max(1, Math.floor(userStats.xp / 100) + 1);
  const rankTitle =
    level >= 4
      ? (isAr ? 'قائد الذكاء الاصطناعي 🧠' : 'AI Architect 🧠')
      : level >= 3
      ? (isAr ? 'ساحر البيانات 📊' : 'Data Wizard 📊')
      : level >= 2
      ? (isAr ? 'محارب بايثون 🐍' : 'Python Warrior 🐍')
      : (isAr ? 'مستكشف الكود 🚀' : 'Code Explorer 🚀');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>{isAr ? 'الملف الشخصي والإنجازات' : 'Profile & Badges'}</span>
          </h2>
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

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* User Bio Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <img
                  src="/src/assets/images/pyquest_mascot_avatar_1791276239891.jpg"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-2xl border-2 border-emerald-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 rounded-md">
                  Lv.{level}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-emerald-400">{rankTitle}</div>
                <h3 className="text-lg font-black text-white">
                  {userStats.userAccount?.displayName || (isAr ? 'مطور PyQuest' : 'PyQuest Coder')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {userStats.userAccount?.email || (isAr ? 'حساب تجريبي محلي' : 'Local Guest Account')}
                </p>
              </div>
            </div>

            {/* Google Account Action */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>{userStats.userAccount ? (isAr ? 'إدارة الحساب' : 'Account') : (isAr ? 'ربط بـ Gmail' : 'Connect Gmail')}</span>
              </button>
            )}
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <Zap className="w-4 h-4 text-purple-400 mx-auto mb-1 fill-current" />
              <div className="text-sm font-black text-white tabular-nums">{userStats.xp}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isAr ? 'النقاط' : 'XP'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-current" />
              <div className="text-sm font-black text-white tabular-nums">{userStats.streakDays}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isAr ? 'أيام السلسلة' : 'Streak'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-sm font-black text-white tabular-nums">{userStats.accuracy || 92}%</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isAr ? 'معدل الدقة' : 'Accuracy'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <BookCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-sm font-black text-white tabular-nums">{userStats.completedLessonIds.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isAr ? 'دروس مكتملة' : 'Lessons'}</div>
            </div>
          </div>

          {/* Badges Gallery */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'الأوسمة والشارات المكتسبة' : 'Unlocked Badges'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BADGES.map((badge) => {
                const isUnlocked =
                  (badge.requiredLessons && userStats.completedLessonIds.length >= badge.requiredLessons) ||
                  (badge.requiredXp && userStats.xp >= badge.requiredXp) ||
                  (badge.requiredStreak && userStats.streakDays >= badge.requiredStreak) ||
                  userStats.badges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        isUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {badge.icon === 'Footprints' && '🐾'}
                      {badge.icon === 'Sword' && '⚔️'}
                      {badge.icon === 'Flame' && '🔥'}
                      {badge.icon === 'BarChart3' && '📈'}
                      {badge.icon === 'Cpu' && '🧠'}
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-200">
                        {isAr ? badge.title : badge.titleEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {isAr ? badge.description : badge.descriptionEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset progress button */}
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm(isAr ? 'هل أنت متأكد من رغبتك في إعادة تعيين التقدم للتجربة من جديد؟' : 'Reset progress for a fresh testing run?')) {
                  onResetProgress();
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors p-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة تعيين التقدم للتجربة' : 'Reset Progress'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
