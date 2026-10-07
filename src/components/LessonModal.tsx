import React, { useState, useEffect } from 'react';
import { X, Heart, Play, CheckCircle2, XCircle, ArrowUp, ArrowDown, HelpCircle, Terminal, Sparkles, RefreshCw, Video, AlignLeft, Globe } from 'lucide-react';
import { Lesson, Question, McqQuestion, FillBlankQuestion, ParsonsQuestion, CodeEditorQuestion, BugHuntingQuestion, VisualDataQuestion, ExecutionResult, LanguageCode } from '../types';
import { PythonRunner } from '../services/pythonRunner';
import { soundEffects } from '../services/soundEffects';
import { VideoExplainerModal } from './VideoExplainerModal';

interface LessonModalProps {
  lesson: Lesson;
  hearts: number;
  language: LanguageCode;
  onClose: () => void;
  onLoseHeart: () => void;
  onCompleteLesson: (results: { totalXp: number; accuracy: number; timeSeconds: number }) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  hearts,
  language,
  onClose,
  onLoseHeart,
  onCompleteLesson,
}) => {
  const isAr = language === 'ar';
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedMcqIndex, setSelectedMcqIndex] = useState<number | null>(null);
  const [fillTokens, setFillTokens] = useState<Record<string, string>>({});
  const [parsonsLines, setParsonsLines] = useState<{ id: string; text: string; indent: number }[]>([]);
  const [userCode, setUserCode] = useState('');
  const [bugCode, setBugCode] = useState('');
  const [selectedVisualOption, setSelectedVisualOption] = useState<number | null>(null);

  // Video explanation state
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showArabicTranslation, setShowArabicTranslation] = useState(true);

  // Execution state for code editor
  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  // Answer verification state
  const [verificationState, setVerificationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQ = lesson.questions[currentIdx];
  const progressPercent = ((currentIdx) / lesson.questions.length) * 100;

  // Initialize state when moving to a new question
  useEffect(() => {
    setVerificationState('idle');
    setSelectedMcqIndex(null);
    setFillTokens({});
    setExecResult(null);
    setSelectedVisualOption(null);

    if (currentQ.type === 'parsons') {
      const q = currentQ as ParsonsQuestion;
      setParsonsLines([...q.scrambledLines]);
    } else if (currentQ.type === 'code_editor') {
      const q = currentQ as CodeEditorQuestion;
      setUserCode(q.initialCode);
    } else if (currentQ.type === 'bug_hunting') {
      const q = currentQ as BugHuntingQuestion;
      setBugCode(q.buggyCode);
    }
  }, [currentIdx, currentQ]);

  // Execute user code in editor
  const handleRunCode = async () => {
    setIsExecuting(true);
    soundEffects.playClick();
    const q = currentQ as CodeEditorQuestion;
    const result = await PythonRunner.executeCode(userCode, q.testCases);
    setExecResult(result);
    setIsExecuting(false);
  };

  // Move line in Parsons problem
  const moveParsonsLine = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= parsonsLines.length) return;
    soundEffects.playClick();
    const updated = [...parsonsLines];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setParsonsLines(updated);
  };

  // Check answer handler
  const handleCheckAnswer = async () => {
    let isCorrect = false;

    if (currentQ.type === 'mcq') {
      const q = currentQ as McqQuestion;
      isCorrect = selectedMcqIndex === q.correctAnswerIndex;
    } else if (currentQ.type === 'fill_blank') {
      const q = currentQ as FillBlankQuestion;
      const allFilledCorrect = q.correctTokens.every((token, idx) => fillTokens[`blank_${idx}`] === token);
      isCorrect = allFilledCorrect;
    } else if (currentQ.type === 'parsons') {
      const q = currentQ as ParsonsQuestion;
      const currentOrder = parsonsLines.map((l) => l.id);
      isCorrect = JSON.stringify(currentOrder) === JSON.stringify(q.correctOrder);
    } else if (currentQ.type === 'code_editor') {
      const q = currentQ as CodeEditorQuestion;
      // Auto run if not yet executed
      const result = execResult || (await PythonRunner.executeCode(userCode, q.testCases));
      setExecResult(result);
      const passed = (result.passedAssertions || 0) === (result.totalAssertions || 1) && result.success;
      isCorrect = passed;
    } else if (currentQ.type === 'bug_hunting') {
      const q = currentQ as BugHuntingQuestion;
      const result = await PythonRunner.executeCode(bugCode);
      isCorrect = result.success && result.stdout.trim().includes(q.testOutput.trim());
    } else if (currentQ.type === 'visual_data') {
      const q = currentQ as VisualDataQuestion;
      isCorrect = selectedVisualOption === q.correctAnswerIndex;
    }

    if (isCorrect) {
      soundEffects.playCorrect();
      setVerificationState('correct');
      setTotalXpEarned((prev) => prev + currentQ.xpReward);
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      soundEffects.playWrong();
      setVerificationState('wrong');
      onLoseHeart();
    }
  };

  // Move to next question or complete lesson
  const handleContinue = () => {
    soundEffects.playClick();
    if (currentIdx + 1 < lesson.questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const timeSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = Math.round((correctAnswersCount / lesson.questions.length) * 100);
      onCompleteLesson({
        totalXp: totalXpEarned,
        accuracy: Math.max(20, accuracy),
        timeSeconds,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Lesson Top Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-800/80">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Smooth Progress Bar */}
          <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hearts counter */}
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* Scrollable Question Stage */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Question Title & Prompt */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showArabicTranslation ? currentQ.title : currentQ.titleEn}</span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-400">+{currentQ.xpReward} XP</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {showArabicTranslation ? currentQ.instructions : currentQ.instructionsEn}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Translate button */}
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowArabicTranslation((prev) => !prev);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                title="التبديل بين الإنجليزية والعربية"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showArabicTranslation ? 'English' : 'عربي'}</span>
              </button>

              {/* Video Explainer Button */}
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsVideoOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="شاهد فيديو الشرح والحل الصوتي"
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'فيديو الشرح 🎥' : 'Video Guide 🎥'}</span>
              </button>
            </div>
          </div>

          {/* QUESTION TYPE 1: Multiple Choice (MCQ) */}
          {currentQ.type === 'mcq' && (() => {
            const q = currentQ as McqQuestion;
            return (
              <div className="space-y-4">
                {q.codeSnippet && (
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 code-font text-emerald-300 text-sm overflow-x-auto shadow-inner">
                    <pre>{q.codeSnippet}</pre>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = selectedMcqIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (verificationState === 'idle') {
                            soundEffects.playClick();
                            setSelectedMcqIndex(idx);
                          }
                        }}
                        className={`w-full p-3.5 sm:p-4 rounded-xl text-start font-medium text-sm transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span>{isAr ? opt : (q.optionsEn?.[idx] || opt)}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ms-3 ${
                            isSelected ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="text-xs font-black">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* QUESTION TYPE 2: Fill in the Blanks */}
          {currentQ.type === 'fill_blank' && (() => {
            const q = currentQ as FillBlankQuestion;
            return (
              <div className="space-y-5">
                {/* Code template with clickable / drop blanks */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 code-font text-sm text-slate-200 leading-relaxed shadow-inner">
                  {q.codeTemplate.split(/(\{\{blank_\d+\}\})/).map((part, idx) => {
                    const match = part.match(/\{\{blank_(\d+)\}\}/);
                    if (match) {
                      const blankKey = `blank_${match[1]}`;
                      const filledValue = fillTokens[blankKey];
                      return (
                        <span
                          key={idx}
                          onClick={() => {
                            if (filledValue && verificationState === 'idle') {
                              soundEffects.playClick();
                              const copy = { ...fillTokens };
                              delete copy[blankKey];
                              setFillTokens(copy);
                            }
                          }}
                          className={`inline-block mx-1.5 px-3 py-1 rounded-md text-xs font-bold border cursor-pointer transition-all ${
                            filledValue
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800 border-dashed border-slate-600 text-slate-500 min-w-[70px] text-center'
                          }`}
                        >
                          {filledValue || (isAr ? 'اضغط هنا' : 'Drop Here')}
                        </span>
                      );
                    }
                    return <span key={idx}>{part}</span>;
                  })}
                </div>

                {/* Available Word Tokens */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">
                    {isAr ? 'اختر الكلمة المناسبة للمكان الفارغ:' : 'Available Tokens:'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.availableTokens.map((token) => {
                      const isUsed = Object.values(fillTokens).includes(token);
                      return (
                        <button
                          key={token}
                          disabled={isUsed || verificationState !== 'idle'}
                          onClick={() => {
                            soundEffects.playClick();
                            // Find first empty blank
                            const blankIndex = q.correctTokens.findIndex(
                              (_, i) => !fillTokens[`blank_${i}`]
                            );
                            if (blankIndex !== -1) {
                              setFillTokens((prev) => ({
                                ...prev,
                                [`blank_${blankIndex}`]: token,
                              }));
                            }
                          }}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold code-font border transition-all ${
                            isUsed
                              ? 'opacity-30 bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 shadow-sm active:scale-95'
                          }`}
                        >
                          {token}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* QUESTION TYPE 3: Parsons Problems (Drag / Reorder Code) */}
          {currentQ.type === 'parsons' && (() => {
            return (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  {isAr ? 'استخدم الأسهم لتحريك كل سطر للأعلى أو الأسفل حتى يكتمل الترتيب الصحيح:' : 'Use arrows to reorder lines:'}
                </p>
                <div className="space-y-2">
                  {parsonsLines.map((line, idx) => (
                    <div
                      key={line.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-sm code-font"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono w-4">{idx + 1}</span>
                        <span className="text-emerald-300">{line.text}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={idx === 0 || verificationState !== 'idle'}
                          onClick={() => moveParsonsLine(idx, 'up')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === parsonsLines.length - 1 || verificationState !== 'idle'}
                          onClick={() => moveParsonsLine(idx, 'down')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* QUESTION TYPE 4: Interactive Code Editor */}
          {currentQ.type === 'code_editor' && (() => {
            return (
              <div className="space-y-3">
                {/* Editor Container */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="code-font text-emerald-400 font-semibold">main.py</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          const lines = userCode.split('\n');
                          let indent = 0;
                          const formatted = lines.map((line) => {
                            const trimmed = line.trim();
                            if (!trimmed) return '';
                            let current = indent;
                            if (trimmed.endsWith(':')) {
                              indent++;
                            }
                            return '    '.repeat(current) + trimmed;
                          }).join('\n');
                          setUserCode(formatted);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                        title="تنسيق الكود والمسافات البادئة تلقائياً (PEP 8 Auto Indent)"
                      >
                        <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isAr ? 'تنسيق المسافات' : 'Auto Indent'}</span>
                      </button>
                      <button
                        onClick={handleRunCode}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isAr ? 'تشغيل الكود' : 'Run Code'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={6}
                    spellCheck={false}
                    className="w-full p-3.5 bg-slate-950 text-slate-100 code-font text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed"
                  />
                </div>

                {/* Console / Plot Output */}
                {execResult && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? 'المخرجات (Console):' : 'Output Console:'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{execResult.executionTimeMs}ms</span>
                    </div>

                    {execResult.stdout && (
                      <pre className="text-xs text-emerald-400 code-font whitespace-pre-wrap">
                        {execResult.stdout}
                      </pre>
                    )}

                    {execResult.stderr && (
                      <pre className="text-xs text-rose-400 code-font whitespace-pre-wrap">
                        {execResult.stderr}
                      </pre>
                    )}

                    {/* Render visual chart if plt.show() was triggered */}
                    {execResult.chartOutput && (
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-xs font-bold text-slate-200 mb-2">
                          📊 {execResult.chartOutput.title}
                        </div>
                        {execResult.chartOutput.type === 'bar' && (
                          <div className="space-y-1.5 pt-1">
                            {execResult.chartOutput.labels.map((lbl, idx) => {
                              const val = (execResult.chartOutput?.values as number[])[idx] || 0;
                              const max = Math.max(...(execResult.chartOutput?.values as number[]), 1);
                              const width = Math.min(100, Math.round((val / max) * 100));
                              return (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <span className="w-16 truncate text-slate-400 text-end">{lbl}</span>
                                  <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden relative">
                                    <div
                                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${width}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-slate-300 w-8">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* QUESTION TYPE 5: Bug Hunting */}
          {currentQ.type === 'bug_hunting' && (() => {
            const q = currentQ as BugHuntingQuestion;
            return (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{isAr ? q.bugHint : q.bugHintEn}</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <textarea
                    value={bugCode}
                    onChange={(e) => setBugCode(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="w-full p-3.5 bg-slate-950 text-slate-100 code-font text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            );
          })()}

          {/* QUESTION TYPE 6: Visual Data Challenge */}
          {currentQ.type === 'visual_data' && (() => {
            const q = currentQ as VisualDataQuestion;
            return (
              <div className="space-y-4">
                {/* Visual Chart Rendering Canvas */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                    <span>{q.chartData.datasets[0].label}</span>
                    <span className="text-[10px] text-slate-500">Matplotlib Simulator</span>
                  </div>

                  {/* Dynamic SVG / Bar Graph */}
                  {q.chartType === 'bar' && (
                    <div className="space-y-2">
                      {q.chartData.labels.map((lbl, idx) => {
                        const val = q.chartData.datasets[0].data[idx];
                        const maxVal = Math.max(...q.chartData.datasets[0].data);
                        const pct = Math.round((val / maxVal) * 100);
                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="w-16 truncate text-slate-400 text-end">{lbl}</span>
                            <div className="flex-1 bg-slate-800 h-5 rounded-md overflow-hidden relative">
                              <div
                                className="h-full bg-cyan-500 rounded-md transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-bold text-cyan-300 w-12">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dynamic Line Curve Graph */}
                  {q.chartType === 'line' && (
                    <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 border-b border-l border-slate-800">
                      {q.chartData.labels.map((lbl, idx) => {
                        const val = q.chartData.datasets[0].data[idx];
                        const height = Math.round((val / 1.0) * 80);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[10px] text-purple-400 font-bold">{val}</span>
                            <div
                              className="w-full max-w-[24px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-700"
                              style={{ height: `${Math.max(8, height)}px` }}
                            />
                            <span className="text-[9px] text-slate-400 truncate w-full text-center">{lbl}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sub Question */}
                <div className="text-sm font-semibold text-slate-200">
                  {isAr ? q.questionPrompt : q.questionPromptEn}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, idx) => {
                    const isSelected = selectedVisualOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (verificationState === 'idle') {
                            soundEffects.playClick();
                            setSelectedVisualOption(idx);
                          }
                        }}
                        className={`w-full p-3 rounded-xl text-start font-medium text-xs sm:text-sm border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200'
                            : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isAr ? opt : (q.optionsEn?.[idx] || opt)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bottom Verification Drawer */}
        <div
          className={`p-4 sm:p-5 border-t transition-colors duration-300 ${
            verificationState === 'correct'
              ? 'bg-emerald-950/80 border-emerald-600/50'
              : verificationState === 'wrong'
              ? 'bg-rose-950/80 border-rose-600/50'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          {verificationState !== 'idle' ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="flex items-start gap-2.5">
                {verificationState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4
                    className={`font-bold text-sm ${
                      verificationState === 'correct' ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {verificationState === 'correct'
                      ? (isAr ? 'إجابة صحيحة وممتازة! 🎉' : 'Brilliant! Correct! 🎉')
                      : (isAr ? 'إجابة غير صحيحة 💔' : 'Incorrect 💔')}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-md leading-relaxed">
                    {isAr ? currentQ.explanation : currentQ.explanationEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setIsVideoOpen(true);
                  }}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                    verificationState === 'wrong'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 animate-pulse'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                  }`}
                  title={isAr ? 'شاهد الفيديو والشرح الصوتي للتحليل الكامل' : 'Watch Video Analysis'}
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {verificationState === 'wrong'
                      ? (isAr ? 'شاهد فيديو الشرح وتصحيح الخطأ 🎥' : 'Watch Video Correction 🎥')
                      : (isAr ? 'فيديو تحليل الكود وتثبيت الفهم 🎥' : 'Watch Deep Breakdown 🎥')}
                  </span>
                </button>

                <button
                  onClick={handleContinue}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 transition-transform active:scale-95 shadow-lg shrink-0 ${
                    verificationState === 'correct'
                      ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20'
                      : 'bg-rose-400 hover:bg-rose-300 shadow-rose-500/20'
                  }`}
                >
                  {isAr ? 'متابعة' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <button
                onClick={handleCheckAnswer}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {isAr ? 'تحقق من الإجابة' : 'Check Answer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Explainer Modal */}
      {isVideoOpen && (
        <VideoExplainerModal
          question={currentQ}
          language={language}
          onClose={() => setIsVideoOpen(false)}
          onApplySolution={(solutionCode) => {
            if (currentQ.type === 'code_editor') {
              setUserCode(solutionCode);
            } else if (currentQ.type === 'bug_hunting') {
              setBugCode(solutionCode);
            }
            setIsVideoOpen(false);
          }}
        />
      )}
    </div>
  );
};
