import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Clock, AlertTriangle, Award, CheckCircle2, XCircle, Play, Eye } from 'lucide-react';
import { Exam, Certificate, LanguageCode, ExecutionResult, CodeEditorQuestion } from '../types';
import { PythonRunner } from '../services/pythonRunner';
import { soundEffects } from '../services/soundEffects';

interface ExamModalProps {
  exam: Exam;
  language: LanguageCode;
  onClose: () => void;
  onPassExam: (cert: Certificate) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  exam,
  language,
  onClose,
  onPassExam,
}) => {
  const isAr = language === 'ar';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Exam Score and Answers
  const [userAnswers, setUserAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Anti-Cheat & AI Proctor State
  const [integrityScore, setIntegrityScore] = useState(100);
  const [proctorAlerts, setProctorAlerts] = useState<{ id: string; msg: string; time: string }[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60);

  const currentQ = exam.questions[currentIdx];

  // Tab switch detection (Anti-Cheat window blur)
  useEffect(() => {
    const handleBlur = () => {
      soundEffects.playWrong();
      setIntegrityScore((prev) => Math.max(0, prev - 20));
      const newAlert = {
        id: `alert_${Date.now()}`,
        msg: isAr
          ? '⚠️ تنبيه مراقب الذكاء الاصطناعي: تم رصد مغادرة نافذة الامتحان أو فتح تبويب خارجي!'
          : '⚠️ AI Proctor Alert: Window blur / tab switch detected!',
        time: new Date().toLocaleTimeString(),
      };
      setProctorAlerts((prev) => [newAlert, ...prev]);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isAr]);

  // Exam Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Init question state
  useEffect(() => {
    setSelectedOption(null);
    setExecResult(null);
    if (currentQ.type === 'code_editor') {
      const q = currentQ as CodeEditorQuestion;
      setCodeAnswer(q.initialCode);
    }
  }, [currentIdx, currentQ]);

  // Prevent Copy / Paste Cheat attempts
  const handleCopyPasteBlock = (e: React.ClipboardEvent) => {
    e.preventDefault();
    soundEffects.playWrong();
    setIntegrityScore((prev) => Math.max(0, prev - 10));
    const newAlert = {
      id: `alert_${Date.now()}`,
      msg: isAr
        ? '🚫 تنبيه: محاولة النسخ أو اللصق محظورة أثناء الاختبار الرسمي!'
        : '🚫 Alert: Copy-Paste is blocked during proctored exam!',
      time: new Date().toLocaleTimeString(),
    };
    setProctorAlerts((prev) => [newAlert, ...prev]);
  };

  // Run Code in exam
  const handleRunCode = async () => {
    setIsExecuting(true);
    soundEffects.playClick();
    const q = currentQ as CodeEditorQuestion;
    const res = await PythonRunner.executeCode(codeAnswer, q.testCases);
    setExecResult(res);
    setIsExecuting(false);
  };

  // Submit current answer and advance
  const handleNextQuestion = async () => {
    let passed = false;
    if (currentQ.type === 'mcq' || currentQ.type === 'visual_data') {
      passed = selectedOption === (currentQ as any).correctAnswerIndex;
    } else if (currentQ.type === 'code_editor') {
      const q = currentQ as CodeEditorQuestion;
      const res = execResult || (await PythonRunner.executeCode(codeAnswer, q.testCases));
      passed = res.success && (res.passedAssertions || 0) === (res.totalAssertions || 1);
    }

    setUserAnswers((prev) => ({ ...prev, [currentIdx]: passed }));
    soundEffects.playClick();

    if (currentIdx + 1 < exam.questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = () => {
    setIsFinished(true);
    // calculate score
    const correctCount = Object.values(userAnswers).filter(Boolean).length;
    const computedScore = Math.round((correctCount / exam.questions.length) * 100);
    setFinalScore(computedScore);

    if (computedScore >= exam.passingScore && integrityScore >= 50) {
      soundEffects.playLevelUp();
      const cert: Certificate = {
        id: `cert_${Date.now()}`,
        examId: exam.id,
        examTitle: isAr ? exam.title : exam.titleEn,
        userName: isAr ? 'مطور بايثون معتمد' : 'Certified Python Engineer',
        score: computedScore,
        integrityScore,
        date: new Date().toLocaleDateString(),
        verificationCode: `PQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      };
      onPassExam(cert);
    } else {
      soundEffects.playWrong();
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onCopy={handleCopyPasteBlock}
      onPaste={handleCopyPasteBlock}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header with AI Proctor Monitor */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Eye className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{isAr ? 'المراقب الذكي (نشط)' : 'AI Proctor (Active)'}</span>
            </div>

            <div
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                integrityScore >= 80
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                  : integrityScore >= 60
                  ? 'bg-amber-950 text-amber-300 border-amber-600/40'
                  : 'bg-rose-950 text-rose-300 border-rose-600/40'
              }`}
            >
              {isAr ? `معدل النزاهة: ${integrityScore}%` : `Integrity: ${integrityScore}%`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-xl text-amber-400 font-mono font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm(isAr ? 'هل أنت متأكد من إلغاء الاختبار؟ سيتم إلغاء المحاولة.' : 'Cancel exam attempt?')) {
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proctor Live Alert Ticker */}
        {proctorAlerts.length > 0 && (
          <div className="px-4 py-2 bg-rose-950/60 border-b border-rose-600/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="truncate">{proctorAlerts[0].msg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!isFinished ? (
            <>
              {/* Question Meta */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">
                  {isAr ? `السؤال ${currentIdx + 1} من ${exam.questions.length}` : `Question ${currentIdx + 1} of ${exam.questions.length}`}
                </span>
                <span className="text-emerald-400 font-semibold">{isAr ? exam.title : exam.titleEn}</span>
              </div>

              {/* Question Instructions */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-relaxed">
                  {isAr ? currentQ.instructions : currentQ.instructionsEn}
                </h3>
              </div>

              {/* Question Type: MCQ / Visual */}
              {(currentQ.type === 'mcq' || currentQ.type === 'visual_data') && (
                <div className="space-y-3">
                  {(currentQ as any).chartData && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-2">📊 Data Chart Analysis</div>
                      <div className="space-y-1.5">
                        {(currentQ as any).chartData.labels.map((lbl: string, idx: number) => {
                          const val = (currentQ as any).chartData.datasets[0].data[idx];
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="w-12 text-slate-400">{lbl}</span>
                              <div className="flex-1 bg-slate-800 h-4 rounded">
                                <div className="bg-cyan-500 h-full rounded" style={{ width: `${Math.min(100, val * 3)}%` }} />
                              </div>
                              <span className="text-cyan-300 font-bold w-12">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    {(currentQ as any).options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`p-3.5 rounded-xl text-start font-medium text-xs sm:text-sm border transition-all ${
                          selectedOption === idx
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {isAr ? opt : ((currentQ as any).optionsEn?.[idx] || opt)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Type: Code Editor */}
              {currentQ.type === 'code_editor' && (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                      <span className="code-font text-emerald-400">exam_solution.py</span>
                      <button
                        onClick={handleRunCode}
                        disabled={isExecuting}
                        className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'تجربة الكود' : 'Test Code'}</span>
                      </button>
                    </div>
                    <textarea
                      value={codeAnswer}
                      onChange={(e) => setCodeAnswer(e.target.value)}
                      rows={6}
                      spellCheck={false}
                      className="w-full p-3.5 bg-slate-950 text-slate-100 code-font text-xs resize-none focus:outline-none"
                    />
                  </div>

                  {execResult && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="text-slate-400 font-bold mb-1">المخرجات (Console):</div>
                      <pre className="text-emerald-400 code-font">{execResult.stdout || execResult.stderr || 'No output'}</pre>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Exam Results & Certificate Screen */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                {finalScore >= exam.passingScore ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10 text-rose-400" />}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {finalScore >= exam.passingScore
                    ? (isAr ? 'مبروك! لقد اجتزت الامتحان بنجاح 🎓' : 'Congratulations! Exam Passed 🎓')
                    : (isAr ? 'للأسف لم تتجاوز درجة النجاح المطلوبة' : 'Exam Not Passed')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {finalScore >= exam.passingScore
                    ? (isAr ? 'تم التحقق من نزاهتك البرمجية واعتماد شهادتك الرسمية!' : 'Your verified digital certificate has been issued!')
                    : (isAr ? `حصلت على ${finalScore}% والحد الأدنى للنجاح هو ${exam.passingScore}%. أعد المحاولة!` : `You scored ${finalScore}%. Passing is ${exam.passingScore}%. Try again!`)}
                </p>
              </div>

              {/* Digital Certificate Preview if Passed */}
              {finalScore >= exam.passingScore && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 shadow-2xl text-start space-y-3 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-6xl opacity-10 select-none">🏆</div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    PyQuest Certified Specialist
                  </div>
                  <h4 className="text-lg font-black text-white">{isAr ? exam.title : exam.titleEn}</h4>
                  <div className="text-xs text-slate-300">
                    {isAr ? 'مُنحت هذه الشهادة بنجاح لإثبات الكفاءة البرمجية والتحليلية بمعدل نزاهة تام.' : 'Awarded for demonstrating verified programming and analytical excellence.'}
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Grade: {finalScore}% (Integrity: {integrityScore}%)</span>
                    <span className="text-emerald-400 font-bold">VERIFIED #{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          {!isFinished ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                {isAr ? 'يمنع الغش - المراقب الذكي يفحص التبويبات والمخرجات' : 'Anti-cheat active: tabs and inputs monitored'}
              </span>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
              >
                {currentIdx + 1 === exam.questions.length ? (isAr ? 'تسليم الامتحان النهائي' : 'Submit Exam') : (isAr ? 'السؤال التالي' : 'Next Question')}
              </button>
            </div>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                {isAr ? 'إغلاق والعودة' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
