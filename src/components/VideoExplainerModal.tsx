import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Check, Copy, ArrowRight, Lightbulb, BookOpen, AlertCircle, Gauge, Globe2 } from 'lucide-react';
import { Question, LanguageCode, VideoExplainer } from '../types';
import { voiceService, VoiceMode } from '../services/voiceService';
import { soundEffects } from '../services/soundEffects';

interface VideoExplainerModalProps {
  question: Question;
  language: LanguageCode;
  onClose: () => void;
  onApplySolution?: (code: string) => void;
}

export const VideoExplainerModal: React.FC<VideoExplainerModalProps> = ({
  question,
  language,
  onClose,
  onApplySolution,
}) => {
  const isAr = language === 'ar';

  // Generate rich default video explainer if not explicitly attached
  const explainer: VideoExplainer = question.videoExplainer || {
    title: isAr ? `شرح بالفيديو والصوت: ${question.title}` : `Video & Audio Breakdown: ${question.titleEn}`,
    durationSeconds: 28,
    voiceTranscriptAr: `أهلاً بك في جلسة الشرح التفاعلية. في لغة بايثون، عندما نستخدم حلقة for مع دالة range، يجب أن ننتبه دائماً إلى أن الرقم الأخير غير مشمول في التكرار. على سبيل المثال، الدالة range(5) تولد الأرقام: صفر، واحد، اثنين، ثلاثة، أربعة. ومجموع هذه الأرقام هو عشرة بالضبط. ولا تنسَ أبداً وضع مسافة بادئة لأربعة فراغات لتنظيم الكود داخل الحلقة.`,
    voiceTranscriptEn: `Welcome to the interactive walkthrough. In Python, when using a for loop with the range function, remember that the stop index is not inclusive. For instance, range(5) yields numbers 0, 1, 2, 3, and 4. Summing them produces 10. Always indent the loop body with four spaces for clean code execution.`,
    whyWrongAr: question.id.includes('loop')
      ? '⚠️ الخطأ الشائع: كتابة range(4) تجمع الأرقام 0+1+2+3 وتساوي 6 فقط! للحصول على 10 يجب كتابة range(5) لتشمل الرقم 4.'
      : '⚠️ تنبيه للمبتدئين: تأكد دائماً من تطابق أسماء المتغيرات والأقواس والمسافات البادئة بدقة.',
    codeSteps: [
      {
        step: 1,
        title: isAr ? 'تعريف المتغير التراكمي total' : 'Initialize Accumulator total',
        code: 'total = 0',
        highlightLine: 1,
        explanationAr: 'نبدأ بتعريف متغير total بقيمة صفر لنجمع فيه الأرقام خطوة بخطوة.',
        explanationEn: 'Initialize total = 0 to store the cumulative sum.',
      },
      {
        step: 2,
        title: isAr ? 'حلقة التكرار for مع range(5)' : 'For Loop with range(5)',
        code: 'for i in range(5):',
        highlightLine: 2,
        explanationAr: 'دالة range(5) تعطي الأرقام [0, 1, 2, 3, 4]. المتغير i سيأخذ كل رقم بالترتيب.',
        explanationEn: 'range(5) generates [0, 1, 2, 3, 4]. Variable i iterates over each.',
      },
      {
        step: 3,
        title: isAr ? 'إضافة الرقم إلى المجموع (المسافة البادئة)' : 'Accumulate with Indentation',
        code: '    total = total + i',
        highlightLine: 3,
        explanationAr: 'لاحظ وجود 4 مسافات بادئة قبل total. هذا يخبر بايثون أن السطر تابع للحلقة.',
        explanationEn: 'Indented with 4 spaces to specify it belongs to the loop body.',
      },
      {
        step: 4,
        title: isAr ? 'طباعة الناتج النهائي بعد انتهاء الحلقة' : 'Print Final Result',
        code: 'print(total)',
        highlightLine: 4,
        explanationAr: 'بعد انتهاء الحلقة، نطبع الناتج 10 في الكونسول.',
        explanationEn: 'Prints the calculated total 10 to standard output.',
      },
    ],
    englishVocabulary: [
      {
        keyword: 'range',
        phonetic: '[reɪndʒ] (رَينْج)',
        meaningAr: 'مدى تسلسل الأرقام',
        whyUsed: 'تولد تسلسلاً من الأرقام، والرقم الأخير غير مشمول. تنطق "رَينْج" مثل كلمة change.',
      },
      {
        keyword: 'for',
        phonetic: '[fɔːr] (فُور)',
        meaningAr: 'حلقة تكرار برمجية',
        whyUsed: 'تُستخدم لتكرار تنفيذ الكود على كل عنصر في القائمة أو المدى.',
      },
      {
        keyword: 'in',
        phonetic: '[ɪn] (إِن)',
        meaningAr: 'داخل / ضمن المجال',
        whyUsed: 'تحدد المجال الذي تدور فيه الحلقة التكرارية.',
      },
      {
        keyword: 'total',
        phonetic: '[ˈtoʊtl] (تُوتَل)',
        meaningAr: 'المجموع الإجمالي التراكمي',
        whyUsed: 'اسم متغير اخترناه لتخزين ناتج الجمع.',
      },
      {
        keyword: 'print()',
        phonetic: '[prɪnt] (بْرِنْت)',
        meaningAr: 'أمر الطباعة على الشاشة',
        whyUsed: 'تعرض المخرجات والنتائج للمستخدم في نافذة الكونسول.',
      },
    ],
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('bilingual');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [copied, setCopied] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [currentlySpeakingWord, setCurrentlySpeakingWord] = useState<string | null>(null);

  // Playback timer & auto step progression
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= explainer.durationSeconds) {
            setIsPlaying(false);
            voiceService.stop();
            return explainer.durationSeconds;
          }
          const next = prev + 1;
          const stepIndex = Math.min(
            explainer.codeSteps.length - 1,
            Math.floor((next / explainer.durationSeconds) * explainer.codeSteps.length)
          );
          setCurrentStepIdx(stepIndex);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, explainer.durationSeconds, explainer.codeSteps.length]);

  // Clean voice when unmounting
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  const triggerVoicePlayback = (mode = voiceMode, rate = speechRate) => {
    if (isVoiceMuted) return;
    voiceService.setVoiceMode(mode);
    voiceService.setRate(rate);

    const transcript =
      mode === 'en'
        ? explainer.voiceTranscriptEn
        : explainer.voiceTranscriptAr;

    voiceService.speak(transcript, mode === 'en' ? 'en' : 'ar', undefined, () => {
      setIsPlaying(false);
    });
  };

  const handlePlayToggle = () => {
    soundEffects.playClick();
    if (isPlaying) {
      setIsPlaying(false);
      voiceService.pause();
    } else {
      setIsPlaying(true);
      if (!isVoiceMuted) {
        triggerVoicePlayback();
      }
    }
  };

  const handleRestart = () => {
    soundEffects.playClick();
    setPlaybackTime(0);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    triggerVoicePlayback();
  };

  const handleToggleMute = () => {
    soundEffects.playClick();
    if (isVoiceMuted) {
      setIsVoiceMuted(false);
      if (isPlaying) {
        triggerVoicePlayback();
      }
    } else {
      setIsVoiceMuted(true);
      voiceService.stop();
    }
  };

  const handleSelectVoiceMode = (mode: VoiceMode) => {
    soundEffects.playClick();
    setVoiceMode(mode);
    voiceService.setVoiceMode(mode);
    if (isPlaying && !isVoiceMuted) {
      voiceService.stop();
      triggerVoicePlayback(mode);
    }
  };

  const handleToggleRate = () => {
    soundEffects.playClick();
    const nextRate = speechRate === 0.8 ? 0.95 : speechRate === 0.95 ? 1.15 : 0.8;
    setSpeechRate(nextRate);
    voiceService.setRate(nextRate);
    if (isPlaying && !isVoiceMuted) {
      voiceService.stop();
      triggerVoicePlayback(voiceMode, nextRate);
    }
  };

  const handleListenWord = (word: string) => {
    soundEffects.playClick();
    setCurrentlySpeakingWord(word);
    voiceService.speakNativeEnglishWord(word, () => {
      setCurrentlySpeakingWord(null);
    });
  };

  const currentStep = explainer.codeSteps[currentStepIdx] || explainer.codeSteps[0];
  const fullSolutionCode = explainer.codeSteps.map((s) => s.code).join('\n');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullSolutionCode);
    setCopied(true);
    soundEffects.playClick();
    setTimeout(() => setCopied(false), 2000);

    if (onApplySolution) {
      onApplySolution(fullSolutionCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">{explainer.title}</h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'شرح فيديو صوتي تفاعلي مع نطق إنجليزي أمريكي أصلي للمصطلحات'
                  : 'Interactive animated video walkthrough with native English pronunciation'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              voiceService.stop();
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Video & Tutorial Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Why Was My Solution Wrong Alert Callout */}
          {explainer.whyWrongAr && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed font-medium">
                {explainer.whyWrongAr}
              </div>
            </div>
          )}

          {/* Simulated Cinematic Video Screen */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Top Video HUD Info & Voice Mode Switcher */}
            <div className="px-3 sm:px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-emerald-300 font-bold">PyQuest Masterclass</span>
              </div>

              {/* Accent & Voice Engine Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSelectVoiceMode('bilingual')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      voiceMode === 'bilingual'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="شرح عربي فصيح ونطق الأكواد بلهجة أمريكية أصلية بدون أخطاء نطق"
                  >
                    🌐 {isAr ? 'مزدوج ذكي (موصى به)' : 'Bilingual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVoiceMode('ar')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      voiceMode === 'ar'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="شرح كامل بالعربية الفصحى"
                  >
                    🇸🇦 {isAr ? 'عربي فقط' : 'Arabic'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVoiceMode('en')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      voiceMode === 'en'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="شرح كامل بالإنجليزية للمطورين"
                  >
                    🇺🇸 {isAr ? 'English' : 'English'}
                  </button>
                </div>

                {/* Speed Selector */}
                <button
                  type="button"
                  onClick={handleToggleRate}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                  title="تغيير سرعة الصوت"
                >
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>{speechRate}x</span>
                </button>

                <span className="text-slate-400 font-mono text-[11px]">
                  0:{playbackTime < 10 ? `0${playbackTime}` : playbackTime} / 0:{explainer.durationSeconds}
                </span>

                <button
                  onClick={handleToggleMute}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title={isVoiceMuted ? 'تشغيل الصوت' : 'كتم صوت الراوي'}
                >
                  {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Video Canvas Stage with Spotlight on Current Line */}
            <div className="p-5 sm:p-7 min-h-[160px] flex flex-col justify-center space-y-3 font-mono text-xs sm:text-sm">
              {explainer.codeSteps.map((step, idx) => {
                const isStepActive = idx === currentStepIdx;
                const isPast = idx < currentStepIdx;
                return (
                  <div
                    key={step.step}
                    className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-between ${
                      isStepActive
                        ? 'bg-emerald-500/20 border border-emerald-500/60 shadow-lg shadow-emerald-500/10 text-emerald-200 translate-x-1'
                        : isPast
                        ? 'text-slate-300 opacity-90'
                        : 'text-slate-600 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 w-4">{step.step}</span>
                      <span className={isStepActive ? 'font-bold' : ''}>{step.code}</span>
                    </div>

                    {isStepActive && (
                      <span className="text-[11px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-md font-sans">
                        👈 {step.title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Video Controls Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayToggle}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md transition-transform active:scale-90"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ms-0.5" />}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  title="إعادة تشغيل الفيديو"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Video Progress Scrubber */}
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${(playbackTime / explainer.durationSeconds) * 100}%` }}
                />
              </div>

              {/* Copy Solution Button */}
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم نسخ الحل!' : 'Copied!') : (isAr ? 'نسخ الحل للمحرر' : 'Copy Solution')}</span>
              </button>
            </div>
          </div>

          {/* Current Step Detailed Text Voiceover Transcript */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Lightbulb className="w-4 h-4" />
              <span>{isAr ? 'شرح الخطوة الحالية بالتفصيل:' : 'Current Step Detail:'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isAr ? currentStep.explanationAr : currentStep.explanationEn}
            </p>
          </div>

          {/* English-to-Arabic Programming Glossary with Authentic Pronunciation Audio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'قاموس الكلمات البرمجية ونطقها الصوتي الصحيح:' : 'English Keywords & Native Phonetic Pronunciation:'}</span>
              </h4>
              <span className="text-[11px] text-emerald-400 font-medium">
                {isAr ? 'اضغط 🔊 للاستماع للنطق الأمريكي الأصلي' : 'Click 🔊 for native US accent'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {explainer.englishVocabulary.map((voc) => {
                const isSpeakingThis = currentlySpeakingWord === voc.keyword;
                return (
                  <div
                    key={voc.keyword}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <span className="code-font text-emerald-400 text-sm">{voc.keyword}</span>
                        {voc.phonetic && (
                          <span className="text-[10px] text-amber-300/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {voc.phonetic}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleListenWord(voc.keyword)}
                          className={`p-1 rounded-md transition-colors ${
                            isSpeakingThis
                              ? 'bg-emerald-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300'
                          }`}
                          title="استمع للنطق الإنجليزي الأصلي المتقن بصوت أمريكي واضح"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-cyan-300 font-sans text-[11px]">{voc.meaningAr}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{voc.whyUsed}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Indentation & Formatting Guide */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>📐 كيف تكتب كوداً مرتباً وصحيحاً (قاعدة المسافات البادئة Indentation):</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              في لغة بايثون، كتابة الكود بشكل مرتب ليست مجرد شكل جمالي بل قاعدة أساسية! السطور داخل حلقة <code className="text-emerald-400 font-mono">for</code> أو شرط <code className="text-emerald-400 font-mono">if</code> يجب أن تبدأ بـ <strong>4 مسافات بادئة (Tab)</strong> لتخبر بايثون أنها تابعة للحلقة.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isAr ? 'شاهد واستمع لتطبيق الحل بنجاح' : 'Audio & visual guidance for mastery'}
          </span>
          <button
            onClick={() => {
              voiceService.stop();
              soundEffects.playClick();
              if (onApplySolution) {
                onApplySolution(fullSolutionCode);
              }
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
          >
            <span>{isAr ? 'فهمت! تطبيق الحل في المحرر' : 'Apply Solution to Editor'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
