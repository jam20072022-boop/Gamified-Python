import React from 'react';
import { Check, Lock, Play, Star, BookOpen, Sparkles, Variable, Bug, GitFork, Boxes, Calculator, BarChart2, BrainCircuit } from 'lucide-react';
import { Track, Lesson, UserStats } from '../types';
import { soundEffects } from '../services/soundEffects';

interface SkillMapProps {
  track: Track;
  userStats: UserStats;
  onSelectLesson: (lesson: Lesson) => void;
}

export const SkillMap: React.FC<SkillMapProps> = ({ track, userStats, onSelectLesson }) => {
  const isAr = userStats.language === 'ar';

  const getLessonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Variable': return <Variable className="w-6 h-6" />;
      case 'Bug': return <Bug className="w-6 h-6" />;
      case 'GitFork': return <GitFork className="w-6 h-6" />;
      case 'Boxes': return <Boxes className="w-6 h-6" />;
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'BarChart2': return <BarChart2 className="w-6 h-6" />;
      case 'BrainCircuit': return <BrainCircuit className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  // Flatten lessons in track to determine sequential unlock state
  const allLessons: Lesson[] = [];
  track.modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      allLessons.push(les);
    });
  });

  return (
    <div className="w-full pb-20 select-none">
      {/* Track Hero Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 mb-8 shadow-xl">
        <div className="h-44 sm:h-52 w-full relative overflow-hidden">
          <img
            src={track.bgImage}
            alt={track.title}
            className="w-full h-full object-cover object-center filter brightness-90 transform hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <div className="inline-block text-xs font-bold tracking-wider uppercase mb-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {track.badge}
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? track.title : track.titleEn}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
              {isAr ? track.description : track.descriptionEn}
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              {userStats.completedLessonIds.filter((id) => allLessons.some((l) => l.id === id)).length} / {allLessons.length}{' '}
              {isAr ? 'مراحل مكتملة' : 'Stages Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Modules and Winding Journey Nodes */}
      <div className="flex flex-col gap-12 max-w-2xl mx-auto">
        {track.modules.map((mod, modIdx) => {
          return (
            <div key={mod.id} className="relative">
              {/* Module Header Card */}
              <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    {isAr ? `الوحدة ${modIdx + 1}` : `Module ${modIdx + 1}`}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {isAr ? mod.title : mod.titleEn}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? mod.description : mod.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Node Sequence with Curved Snake Offset */}
              <div className="relative flex flex-col items-center gap-10 py-2">
                {mod.lessons.map((lesson, lesIdx) => {
                  const globalIdx = allLessons.findIndex((l) => l.id === lesson.id);
                  const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                  const isUnlocked = globalIdx === 0 || userStats.completedLessonIds.includes(allLessons[globalIdx - 1]?.id);
                  const isActive = isUnlocked && !isCompleted;
                  const stars = userStats.lessonStars[lesson.id] || (isCompleted ? 3 : 0);

                  // Stagger positions: 0 -> center, 1 -> right, 2 -> left, 3 -> center
                  const offsets = ['translate-x-0', 'translate-x-12 sm:translate-x-16', '-translate-x-12 sm:-translate-x-16', 'translate-x-6 sm:translate-x-8'];
                  const offsetClass = offsets[lesIdx % offsets.length];

                  return (
                    <div
                      key={lesson.id}
                      className={`relative flex flex-col items-center transition-transform ${offsetClass}`}
                    >
                      {/* Interactive Node Button */}
                      <div className="relative group">
                        {/* Pulsing ring for active current stage */}
                        {isActive && (
                          <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping opacity-75 pointer-events-none" />
                        )}

                        <button
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked) {
                              soundEffects.playClick();
                              onSelectLesson(lesson);
                            }
                          }}
                          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
                            isCompleted
                              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-emerald-500/25 ring-4 ring-emerald-500/20 active:translate-y-1'
                              : isActive
                              ? 'bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-400/50 hover:scale-105 active:translate-y-1'
                              : 'bg-slate-800/80 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-75'
                          }`}
                          aria-label={lesson.title}
                        >
                          {/* Inner Icon */}
                          <div className="flex flex-col items-center justify-center">
                            {isCompleted ? (
                              <Check className="w-8 h-8 stroke-[3]" />
                            ) : isActive ? (
                              <div className="relative">
                                {getLessonIcon(lesson.icon)}
                                <Play className="w-3.5 h-3.5 fill-current absolute -bottom-1 -right-1 text-emerald-200" />
                              </div>
                            ) : (
                              <Lock className="w-6 h-6 stroke-[2]" />
                            )}
                          </div>
                        </button>

                        {/* Stars Pill for Completed Nodes */}
                        {isCompleted && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-950 border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-md z-10">
                            {[1, 2, 3].map((starNum) => (
                              <Star
                                key={starNum}
                                className={`w-3 h-3 ${
                                  starNum <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lesson Label */}
                      <div className="mt-3 text-center max-w-[150px]">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isUnlocked ? 'text-slate-100' : 'text-slate-500'
                          }`}
                        >
                          {isAr ? lesson.title : lesson.titleEn}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {lesson.questions.length} {isAr ? 'تحديات' : 'challenges'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
