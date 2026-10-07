import React, { useState } from 'react';
import { X, Trophy, Medal, Flame, Zap, Crown } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { LanguageCode } from '../types';

interface LeaderboardModalProps {
  userXp: number;
  userStreak: number;
  language: LanguageCode;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  userXp,
  userStreak,
  language,
  onClose,
}) => {
  const isAr = language === 'ar';
  const [selectedLeague, setSelectedLeague] = useState<'diamond' | 'gold' | 'silver'>('gold');

  const competitors = [
    { rank: 1, name: 'سارة العتيبي', nameEn: 'Sara Al-Otaibi', xp: 820, streak: 14, avatar: '👩‍💻', league: 'diamond' },
    { rank: 2, name: 'كريم المنصوري', nameEn: 'Karim Mansouri', xp: 740, streak: 11, avatar: '🧑‍💻', league: 'diamond' },
    { rank: 3, name: 'ليلى الخالدي', nameEn: 'Layla Al-Khalidi', xp: 690, streak: 9, avatar: '👩‍🔬', league: 'gold' },
    { rank: 4, name: 'عمر الفاروق', nameEn: 'Omar Farooq', xp: 580, streak: 7, avatar: '👨‍🎓', league: 'gold' },
    { rank: 5, name: 'نور الهدى', nameEn: 'Nour El-Houda', xp: 450, streak: 6, avatar: '👩‍💼', league: 'gold' },
    { rank: 6, name: 'أنت (البطل)', nameEn: 'You (Champion)', xp: Math.max(userXp, 120), streak: userStreak, avatar: '🚀', isUser: true, league: 'gold' },
    { rank: 7, name: 'طارق زياد', nameEn: 'Tariq Ziyad', xp: 320, streak: 4, avatar: '👨‍💻', league: 'silver' },
    { rank: 8, name: 'ياسمين حسام', nameEn: 'Yasmine Hossam', xp: 210, streak: 2, avatar: '👩‍🎨', league: 'silver' },
  ];

  // Re-sort based on actual XP
  const sorted = [...competitors].sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'لوحة المتصدرين الأسبوعية' : 'Weekly Leaderboard'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'يتأهل أفضل 3 مبرمجين نهاية الأسبوع إلى الدوري الماسي' : 'Top 3 learners advance to Diamond League at week end'}
            </p>
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

        {/* League Selector */}
        <div className="flex items-center justify-center gap-2 py-3 bg-slate-950/60 rounded-2xl my-3 border border-slate-800/80 p-1">
          {[
            { id: 'diamond', name: isAr ? 'الدوري الماسي' : 'Diamond', icon: '💎' },
            { id: 'gold', name: isAr ? 'الدوري الذهبي' : 'Gold', icon: '🥇' },
            { id: 'silver', name: isAr ? 'الدوري الفضي' : 'Silver', icon: '🥈' },
          ].map((lg) => (
            <button
              key={lg.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedLeague(lg.id as 'diamond' | 'gold' | 'silver');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                selectedLeague === lg.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{lg.icon}</span>
              <span>{lg.name}</span>
            </button>
          ))}
        </div>

        {/* Competitors List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {sorted.map((item) => {
            const isUser = item.isUser;
            return (
              <div
                key={item.name}
                className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                  isUser
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/50 border-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Ribbon */}
                  <div className="w-7 text-center font-black text-sm">
                    {item.rank === 1 ? (
                      <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                    ) : item.rank === 2 ? (
                      <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    ) : item.rank === 3 ? (
                      <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-slate-500 font-mono">#{item.rank}</span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="text-2xl">{item.avatar}</div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
                      <span>{isAr ? item.name : item.nameEn}</span>
                      {isUser && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                          {isAr ? 'أنت' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Flame className="w-3 h-3 fill-current" />
                        {item.streak} {isAr ? 'يوم' : 'd'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Count */}
                <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-purple-400 tabular-nums">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{item.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
