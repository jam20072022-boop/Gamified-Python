import { useState, useEffect } from 'react';
import { INITIAL_TRACKS } from './data/curriculum';
import { TrackId, Lesson, UserStats, Track, Exam, Certificate, LanguageCode } from './types';
import { Header } from './components/Header';
import { SkillMap } from './components/SkillMap';
import { LessonModal } from './components/LessonModal';
import { LessonCompleteModal } from './components/LessonCompleteModal';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ProfileModal } from './components/ProfileModal';
import { InteractivePlaygroundModal } from './components/InteractivePlaygroundModal';
import { CMSModal } from './components/CMSModal';
import { FlutterGuideModal } from './components/FlutterGuideModal';
import { InstallModal } from './components/InstallModal';
import { ProjectsModal } from './components/ProjectsModal';
import { ExamsListModal } from './components/ExamsListModal';
import { ExamModal } from './components/ExamModal';
import { LanguageModal } from './components/LanguageModal';
import { AuthModal } from './components/AuthModal';
import { ArcadeModal } from './components/ArcadeModal';
import { DeviceFrame } from './components/DeviceFrame';
import { soundEffects } from './services/soundEffects';
import { MapPin, Trophy, Code2, ShoppingBag, User, Smartphone } from 'lucide-react';

const STORAGE_KEY_USER = 'pyquest_user_stats_v1';
const STORAGE_KEY_TRACKS = 'pyquest_tracks_v1';

export default function App() {
  // Load saved tracks or fallback to initial
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_TRACKS;
  });

  // Current selected track
  const [currentTrackId, setCurrentTrackId] = useState<TrackId>('python_basics');

  // User state
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      xp: 45,
      hearts: 5,
      maxHearts: 5,
      nextHeartTimestamp: null,
      gems: 160,
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakFrozen: false,
      accuracy: 94,
      totalQuestionsAnswered: 12,
      correctAnswersCount: 11,
      completedLessonIds: [],
      lessonStars: {},
      badges: ['first_step'],
      selectedTheme: 'emerald',
      soundEnabled: true,
      language: 'ar',
    };
  });

  // Modals state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedResults, setCompletedResults] = useState<{
    totalXp: number;
    accuracy: number;
    timeSeconds: number;
  } | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [isFlutterGuideOpen, setIsFlutterGuideOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isExamsListOpen, setIsExamsListOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);

  // Device frame toggle (Phone emulator vs Full screen)
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Listen for native PWA install prompt in Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userStats));
    } catch {
      // ignore
    }
  }, [userStats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(tracks));
    } catch {
      // ignore
    }
  }, [tracks]);

  // Sync language direction to document
  useEffect(() => {
    document.documentElement.dir = userStats.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userStats.language;
    soundEffects.setEnabled(userStats.soundEnabled);
  }, [userStats.language, userStats.soundEnabled]);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  // Lose heart handler
  const handleLoseHeart = () => {
    setUserStats((prev) => {
      const newHearts = Math.max(0, prev.hearts - 1);
      return {
        ...prev,
        hearts: newHearts,
        nextHeartTimestamp: prev.nextHeartTimestamp || Date.now() + 5 * 60 * 1000,
      };
    });
  };

  // Refill hearts handler
  const handleRefillHearts = () => {
    soundEffects.playGem();
    setUserStats((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      nextHeartTimestamp: null,
    }));
  };

  // Lesson complete handler
  const handleCompleteLesson = (results: { totalXp: number; accuracy: number; timeSeconds: number }) => {
    if (!activeLesson) return;

    setUserStats((prev) => {
      const alreadyCompleted = prev.completedLessonIds.includes(activeLesson.id);
      const updatedCompleted = alreadyCompleted
        ? prev.completedLessonIds
        : [...prev.completedLessonIds, activeLesson.id];

      const bonusGems = 15;
      const stars = results.accuracy >= 90 ? 3 : results.accuracy >= 60 ? 2 : 1;

      return {
        ...prev,
        xp: prev.xp + results.totalXp,
        gems: prev.gems + bonusGems,
        completedLessonIds: updatedCompleted,
        lessonStars: {
          ...prev.lessonStars,
          [activeLesson.id]: Math.max(prev.lessonStars[activeLesson.id] || 0, stars),
        },
        totalQuestionsAnswered: prev.totalQuestionsAnswered + activeLesson.questions.length,
        correctAnswersCount: prev.correctAnswersCount + Math.round((results.accuracy / 100) * activeLesson.questions.length),
      };
    });

    setCompletedResults(results);
    setActiveLesson(null);
  };

  // Shop purchase handler
  const handleBuyItem = (itemKey: 'refill_hearts' | 'streak_freeze' | 'theme_monokai' | 'theme_cyberpunk') => {
    soundEffects.playGem();
    setUserStats((prev) => {
      if (itemKey === 'refill_hearts') {
        return { ...prev, hearts: prev.maxHearts, gems: Math.max(0, prev.gems - 50) };
      }
      if (itemKey === 'streak_freeze') {
        return { ...prev, streakFrozen: true, gems: Math.max(0, prev.gems - 100) };
      }
      if (itemKey === 'theme_monokai') {
        return { ...prev, selectedTheme: 'monokai', gems: Math.max(0, prev.gems - 150) };
      }
      if (itemKey === 'theme_cyberpunk') {
        return { ...prev, selectedTheme: 'cyberpunk', gems: Math.max(0, prev.gems - 200) };
      }
      return prev;
    });
  };

  // CMS Save Question Handler
  const handleSaveCMSQuestion = (trackId: TrackId, moduleId: string, lessonId: string, newQ: any) => {
    setTracks((prevTracks) => {
      return prevTracks.map((trk) => {
        if (trk.id !== trackId) return trk;
        return {
          ...trk,
          modules: trk.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;
            return {
              ...mod,
              lessons: mod.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                return {
                  ...les,
                  questions: [...les.questions, newQ],
                };
              }),
            };
          }),
        };
      });
    });
  };

  // Export curriculum
  const handleExportCurriculum = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tracks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'pyquest_curriculum.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset curriculum
  const handleResetCurriculum = () => {
    setTracks(INITIAL_TRACKS);
    localStorage.removeItem(STORAGE_KEY_TRACKS);
  };

  // Reset user progress
  const handleResetProgress = () => {
    setUserStats({
      xp: 0,
      hearts: 5,
      maxHearts: 5,
      nextHeartTimestamp: null,
      gems: 100,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakFrozen: false,
      accuracy: 100,
      totalQuestionsAnswered: 0,
      correctAnswersCount: 0,
      completedLessonIds: [],
      lessonStars: {},
      badges: [],
      selectedTheme: 'emerald',
      soundEnabled: true,
      language: userStats.language,
    });
    setIsProfileOpen(false);
  };

  const isAr = userStats.language === 'ar';

  return (
    <DeviceFrame isMobileFrame={isMobileFrame}>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        {/* Top Header */}
        <Header
          currentTrackId={currentTrackId}
          onSelectTrack={setCurrentTrackId}
          userStats={userStats}
          onRefillHearts={handleRefillHearts}
          onToggleSound={() => setUserStats((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
          onToggleLanguage={() => setIsLanguageOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleDeviceFrame={() => setIsMobileFrame((prev) => !prev)}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenPlayground={() => setIsPlaygroundOpen(true)}
          onOpenCMS={() => setIsCMSOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
          onOpenProjects={() => setIsProjectsOpen(true)}
          onOpenExams={() => setIsExamsListOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenArcade={() => setIsArcadeOpen(true)}
        />

        {/* Store Deployment & Arcade Callout Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border-b border-emerald-900/40 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 text-emerald-300 truncate">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0 font-bold">✨ Phase 1-9 Ready</span>
            <span className="truncate">
              {isAr
                ? 'جاهز للاختبار على لابتوبك والتحويل إلى تطبيق Flutter ونشره على المتجر!'
                : 'Ready for browser laptop testing, Flutter export & App Store release!'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Playable Arcade Games Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsArcadeOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-black text-xs shrink-0 transition-transform active:scale-95 shadow-md flex items-center gap-1.5 animate-pulse"
            >
              <span>🎮</span>
              <span>{isAr ? 'الألعاب التفاعلية (سيارات + طخ + حياة)' : 'Play Arcade Games'}</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setIsFlutterGuideOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 shrink-0 transition-colors flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAr ? 'دليل Flutter' : 'Flutter'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Stage */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24">
          <SkillMap
            track={currentTrack}
            userStats={userStats}
            onSelectLesson={(lesson) => {
              if (userStats.hearts <= 0) {
                alert(isAr ? 'نفدت قلوبك! قم بإعادة الشحن من المتجر للمتابعة.' : 'Out of hearts! Refill in shop to continue.');
                setIsShopOpen(true);
                return;
              }
              setActiveLesson(lesson);
            }}
          />
        </main>

        {/* Bottom Navigation Bar for Mobile Thumb Ergonomics */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-3 max-w-7xl mx-auto">
          <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
            {/* Map */}
            <button
              onClick={() => soundEffects.playClick()}
              className="flex flex-col items-center gap-1 text-emerald-400 py-1 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] font-bold">{isAr ? 'الخريطة' : 'Map'}</span>
            </button>

            {/* Playground */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsPlaygroundOpen(true);
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold">{isAr ? 'المختبر' : 'Playground'}</span>
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsLeaderboardOpen(true);
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-bold">{isAr ? 'المتصدرين' : 'Ranks'}</span>
            </button>

            {/* Shop */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsShopOpen(true);
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-bold">{isAr ? 'المتجر' : 'Shop'}</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsProfileOpen(true);
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <User className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-bold">{isAr ? 'حسابي' : 'Profile'}</span>
            </button>
          </div>
        </nav>

        {/* Active Lesson Modal */}
        {activeLesson && (
          <LessonModal
            lesson={activeLesson}
            hearts={userStats.hearts}
            language={userStats.language}
            onClose={() => setActiveLesson(null)}
            onLoseHeart={handleLoseHeart}
            onCompleteLesson={handleCompleteLesson}
          />
        )}

        {/* Lesson Complete Celebration Modal */}
        {completedResults && (
          <LessonCompleteModal
            results={completedResults}
            streakDays={userStats.streakDays}
            gemsReward={15}
            language={userStats.language}
            onClose={() => setCompletedResults(null)}
          />
        )}

        {/* Shop Modal */}
        {isShopOpen && (
          <ShopModal
            userStats={userStats}
            language={userStats.language}
            onClose={() => setIsShopOpen(false)}
            onBuyItem={handleBuyItem}
          />
        )}

        {/* Leaderboard Modal */}
        {isLeaderboardOpen && (
          <LeaderboardModal
            userXp={userStats.xp}
            userStreak={userStats.streakDays}
            language={userStats.language}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}

        {/* Profile Modal */}
        {isProfileOpen && (
          <ProfileModal
            userStats={userStats}
            language={userStats.language}
            onClose={() => setIsProfileOpen(false)}
            onResetProgress={handleResetProgress}
            onOpenAuth={() => {
              setIsProfileOpen(false);
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* Python Playground Sandbox Modal */}
        {isPlaygroundOpen && (
          <InteractivePlaygroundModal
            language={userStats.language}
            onClose={() => setIsPlaygroundOpen(false)}
          />
        )}

        {/* CMS Studio Modal */}
        {isCMSOpen && (
          <CMSModal
            tracks={tracks}
            language={userStats.language}
            onClose={() => setIsCMSOpen(false)}
            onSaveNewQuestion={handleSaveCMSQuestion}
            onExportCurriculum={handleExportCurriculum}
            onResetCurriculum={handleResetCurriculum}
          />
        )}

        {/* Flutter & App Store Guide Modal */}
        {isFlutterGuideOpen && (
          <FlutterGuideModal
            language={userStats.language}
            onClose={() => setIsFlutterGuideOpen(false)}
          />
        )}

        {/* PWA Install Modal */}
        {isInstallOpen && (
          <InstallModal
            language={userStats.language}
            deferredPrompt={deferredPrompt}
            onClose={() => setIsInstallOpen(false)}
            onTriggerInstall={async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                if (choice.outcome === 'accepted') {
                  setDeferredPrompt(null);
                  setIsInstallOpen(false);
                }
              }
            }}
          />
        )}

        {/* Real-World Projects Studio Modal */}
        {isProjectsOpen && (
          <ProjectsModal
            language={userStats.language}
            onClose={() => setIsProjectsOpen(false)}
          />
        )}

        {/* AI-Proctored Exams List Modal */}
        {isExamsListOpen && (
          <ExamsListModal
            language={userStats.language}
            certificates={userStats.certificates || []}
            onClose={() => setIsExamsListOpen(false)}
            onStartExam={(exam) => {
              setIsExamsListOpen(false);
              setActiveExam(exam);
            }}
          />
        )}

        {/* Active Proctored Exam Modal */}
        {activeExam && (
          <ExamModal
            exam={activeExam}
            language={userStats.language}
            onClose={() => setActiveExam(null)}
            onPassExam={(cert) => {
              setUserStats((prev) => ({
                ...prev,
                certificates: [...(prev.certificates || []), cert],
                xp: prev.xp + 100,
              }));
              setActiveExam(null);
              setIsExamsListOpen(true);
            }}
          />
        )}

        {/* Language Selector Modal */}
        {isLanguageOpen && (
          <LanguageModal
            currentLanguage={userStats.language}
            onSelectLanguage={(lang) => {
              setUserStats((prev) => ({ ...prev, language: lang }));
            }}
            onClose={() => setIsLanguageOpen(false)}
          />
        )}

        {/* Google / Gmail Account Modal */}
        {isAuthOpen && (
          <AuthModal
            currentUserAccount={userStats.userAccount}
            language={userStats.language}
            onClose={() => setIsAuthOpen(false)}
            onLoginGoogle={(account) => {
              setUserStats((prev) => ({ ...prev, userAccount: account }));
              setIsAuthOpen(false);
            }}
            onLogout={() => {
              setUserStats((prev) => ({ ...prev, userAccount: undefined }));
            }}
          />
        )}

        {/* Interactive Gaming Arcade Zone Modal */}
        {isArcadeOpen && (
          <ArcadeModal
            language={userStats.language}
            onClose={() => setIsArcadeOpen(false)}
            onRewardPlayer={(earnedXp, earnedGems) => {
              setUserStats((prev) => ({
                ...prev,
                xp: prev.xp + earnedXp,
                gems: prev.gems + earnedGems,
              }));
            }}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
