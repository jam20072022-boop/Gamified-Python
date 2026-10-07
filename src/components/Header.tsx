import React from 'react';
import { Heart, Flame, Gem, Zap, Volume2, VolumeX, Smartphone, Monitor, ShoppingBag, Trophy, User, Code2, Settings, Download, FolderGit2, ShieldAlert, Globe, Gamepad2 } from 'lucide-react';
import { TrackId, UserStats } from '../types';
import { soundEffects } from '../services/soundEffects';

interface HeaderProps {
  currentTrackId: TrackId;
  onSelectTrack: (trackId: TrackId) => void;
  userStats: UserStats;
  onRefillHearts: () => void;
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  isMobileFrame: boolean;
  onToggleDeviceFrame: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenPlayground: () => void;
  onOpenCMS: () => void;
  onOpenInstall: () => void;
  onOpenProjects: () => void;
  onOpenExams: () => void;
  onOpenAuth: () => void;
  onOpenArcade: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrackId,
  onSelectTrack,
  userStats,
  onRefillHearts,
  onToggleSound,
  onToggleLanguage,
  isMobileFrame,
  onToggleDeviceFrame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenPlayground,
  onOpenCMS,
  onOpenInstall,
  onOpenProjects,
  onOpenExams,
  onOpenAuth,
  onOpenArcade,
}) => {
  const isAr = userStats.language === 'ar';

  const tracks = [
    { id: 'python_basics' as TrackId, name: isAr ? 'بايثون' : 'Python', icon: '🐍' },
    { id: 'data_analysis' as TrackId, name: isAr ? 'البيانات' : 'Data', icon: '📊' },
    { id: 'ai_ml' as TrackId, name: isAr ? 'الذكاء الاصطناعي' : 'AI & ML', icon: '🧠' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark & Track Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfile}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-sm tracking-wider">
                PQ
              </div>
            </div>
            <span className="hidden sm:inline font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              PyQuest
            </span>
          </div>

          {/* Track Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            {tracks.map((t) => {
              const active = currentTrackId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectTrack(t.id);
                  }}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={t.name}
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="hidden md:inline">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone 2: Gamification Telemetry */}
        <div className="flex items-center gap-1 sm:gap-3 text-xs font-semibold tabular-nums">
          {/* Hearts Indicator */}
          <button
            onClick={() => {
              soundEffects.playClick();
              if (userStats.hearts < userStats.maxHearts) {
                onRefillHearts();
              } else {
                onOpenShop();
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            title={isAr ? 'الأرواح (انقر لإعادة الشحن)' : 'Lives (Click to refill)'}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            <span>{userStats.hearts}</span>
          </button>

          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"
            title={isAr ? `السلسلة اليومية: ${userStats.streakDays} يوم` : `${userStats.streakDays} Day Streak`}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{userStats.streakDays}</span>
          </div>

          {/* Gems Indicator */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            title={isAr ? 'العملات الرقمية (المتجر)' : 'Gems (Shop)'}
          >
            <Gem className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>{userStats.gems}</span>
          </button>

          {/* XP Indicator */}
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20"
            title={isAr ? 'نقاط الخبرة XP' : 'Total XP Points'}
          >
            <Zap className="w-4 h-4 fill-purple-400 text-purple-400" />
            <span>{userStats.xp} XP</span>
          </div>
        </div>

        {/* Zone 3: Quick Action Utility Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Playground Code Sandbox */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenPlayground();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title={isAr ? 'محرر الأكواد الحر' : 'Free Code Playground'}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline">{isAr ? 'المختبر' : 'Playground'}</span>
          </button>

          {/* Full Real-World Projects */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenProjects();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/80 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title={isAr ? 'بناء مشاريع برمجية كاملة' : 'Real-World App Studio'}
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline">{isAr ? 'مشاريع' : 'Projects'}</span>
          </button>

          {/* AI-Proctored Exams */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenExams();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/70 text-amber-300 border border-amber-800/80 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title={isAr ? 'امتحانات معتمدة مع مراقب ذكاء اصطناعي' : 'AI-Proctored Exams'}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">{isAr ? 'الامتحانات' : 'Exams'}</span>
          </button>

          {/* Interactive Gaming Arcade Zone */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenArcade();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-purple-900/70 via-pink-900/70 to-cyan-900/70 hover:from-purple-800 hover:to-cyan-800 text-cyan-200 border border-cyan-500/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/15"
            title={isAr ? 'مركز الألعاب: سباق سيارات، طخ ورماية، ومحاكاة حياة واقعية' : 'Arcade Games: Racing, Shooter, Life Sim'}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden lg:inline">{isAr ? 'الألعاب 🎮' : 'Arcade 🎮'}</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenLeaderboard();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isAr ? 'لوحة الشرف' : 'Leaderboard'}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenShop();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isAr ? 'المتجر' : 'Shop'}
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenProfile();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isAr ? 'الملف الشخصي' : 'Profile'}
          >
            <User className="w-4 h-4 text-purple-400" />
          </button>

          {/* Device Frame Viewport Switcher */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleDeviceFrame();
            }}
            className="hidden sm:flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-xs font-semibold transition-colors"
            title={isMobileFrame ? (isAr ? 'وضع اللابتوب الشامل' : 'Laptop Full View') : (isAr ? 'وضع محاكي الهاتف' : 'Mobile Phone Frame')}
          >
            {isMobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isMobileFrame ? (isAr ? 'شاشة كاملة' : 'Full View') : (isAr ? 'محاكي هاتف' : 'Mobile Frame')}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundEffects.playClick();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isAr ? (userStats.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت') : (userStats.soundEnabled ? 'Mute' : 'Unmute')}
          >
            {userStats.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleLanguage();
            }}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-colors"
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
          >
            {isAr ? 'EN' : 'عربي'}
          </button>

          {/* Google / Gmail Account Authentication */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenAuth();
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              userStats.userAccount
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm'
            }`}
            title={
              userStats.userAccount
                ? `${userStats.userAccount.email} (${isAr ? 'حساب Google متصل' : 'Google Connected'})`
                : (isAr ? 'تسجيل الدخول بحساب Google (Gmail)' : 'Sign In with Gmail')
            }
          >
            {/* Google G icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden md:inline">
              {userStats.userAccount
                ? (userStats.userAccount.displayName.split(' ')[0] || 'حسابي')
                : (isAr ? 'دخول بـ Gmail' : 'Sign in')}
            </span>
          </button>

          {/* Install PWA App Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenInstall();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
            title={isAr ? 'تثبيت التطبيق على Google Chrome' : 'Install on Chrome'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">{isAr ? 'تثبيت كروم' : 'Install'}</span>
          </button>

          {/* CMS Admin Studio */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenCMS();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title={isAr ? 'لوحة تحكم الدروس CMS' : 'Curriculum Studio CMS'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
