import React, { useState } from 'react';
import { X, FolderGit2, Play, CheckCircle2, ChevronRight, Terminal, Sparkles, RefreshCw } from 'lucide-react';
import { RealProject, LanguageCode, ExecutionResult } from '../types';
import { REAL_WORLD_PROJECTS } from '../data/projectsAndExams';
import { PythonRunner } from '../services/pythonRunner';
import { soundEffects } from '../services/soundEffects';

interface ProjectsModalProps {
  language: LanguageCode;
  onClose: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ language, onClose }) => {
  const isAr = language === 'ar';
  const [selectedProject, setSelectedProject] = useState<RealProject>(REAL_WORLD_PROJECTS[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [userCode, setUserCode] = useState(selectedProject.steps[0].starterCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentStep = selectedProject.steps[currentStepIdx];

  const handleSelectProject = (proj: RealProject) => {
    setSelectedProject(proj);
    setCurrentStepIdx(0);
    setUserCode(proj.steps[0].starterCode);
    setResult(null);
  };

  const handleRunAndTest = async () => {
    setIsExecuting(true);
    soundEffects.playClick();
    const res = await PythonRunner.executeCode(userCode, [
      {
        description: 'Check expected output',
        expectedOutputSubstring: currentStep.expectedOutput,
      },
    ]);
    setResult(res);
    setIsExecuting(false);

    if (res.success && (res.stdout.includes(currentStep.expectedOutput) || (res.passedAssertions || 0) > 0)) {
      soundEffects.playCorrect();
      setCompletedSteps((prev) => ({ ...prev, [`${selectedProject.id}_${currentStep.id}`]: true }));
    } else {
      soundEffects.playWrong();
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx + 1 < selectedProject.steps.length) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setUserCode(selectedProject.steps[nextIdx].starterCode);
      setResult(null);
      soundEffects.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isAr ? 'مشاريع برمجية متكاملة خطوة بخطوة' : 'Full Real-World Application Studio'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'تعلم كيف تبني برامج حقيقية من الصفر: أدوات مالية، نماذج ذكاء اصطناعي، وتحليل بيانات' : 'Learn how to architect and build full production programs from scratch'}
              </p>
            </div>
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

        {/* Project Tabs Carousel */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {REAL_WORLD_PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProject(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedProject.id === p.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{isAr ? p.title : p.titleEn}</span>
              <span className="text-[10px] opacity-75 font-mono">({p.level})</span>
            </button>
          ))}
        </div>

        {/* Workspace: Steps + Code Editor + Output */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
          {/* Left Column: Project Overview & Steps (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-900/60">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                {selectedProject.category}
              </span>
              <h3 className="text-base font-bold text-white">
                {isAr ? selectedProject.title : selectedProject.titleEn}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAr ? selectedProject.description : selectedProject.descriptionEn}
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300">{isAr ? 'مراحل بناء التطبيق:' : 'Application Roadmap:'}</h4>
              {selectedProject.steps.map((st, idx) => {
                const isCurrent = currentStepIdx === idx;
                const isDone = completedSteps[`${selectedProject.id}_${st.id}`];
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setCurrentStepIdx(idx);
                      setUserCode(st.starterCode);
                      setResult(null);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : isDone
                        ? 'bg-slate-950 border-emerald-800/40 text-slate-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white">{isAr ? st.title : st.titleEn}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{isAr ? st.description : st.descriptionEn}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Editor & Execution Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 overflow-hidden">
            {/* Action Bar */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="code-font text-emerald-400 font-bold">app_{selectedProject.id}.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAndTest}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isAr ? 'تشغيل واختبار' : 'Run & Test'}</span>
                </button>

                {completedSteps[`${selectedProject.id}_${currentStep.id}`] && currentStepIdx + 1 < selectedProject.steps.length && (
                  <button
                    onClick={handleNextStep}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Code Editor */}
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              rows={8}
              className="w-full p-4 bg-slate-950 text-slate-100 code-font text-xs resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/40 leading-relaxed font-mono"
            />

            {/* Output Console & Charts */}
            <div className="flex-1 p-3 bg-slate-950/95 border-t border-slate-800 overflow-y-auto space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
                <div className="flex items-center gap-1 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'المخرجات الحية والكونسول:' : 'Live Output Console:'}</span>
                </div>
                {result && <span className="text-[10px] text-slate-500">{result.executionTimeMs}ms</span>}
              </div>

              {result?.chartOutput && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-200 mb-2">📊 {result.chartOutput.title}</div>
                  <div className="space-y-1">
                    {result.chartOutput.labels.map((lbl, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <span className="w-14 text-slate-400 text-end truncate">{lbl}</span>
                        <div className="flex-1 bg-slate-800 h-3.5 rounded overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded" style={{ width: `${Math.min(100, ((result?.chartOutput?.values as number[])[idx] || 0) * 0.8)}%` }} />
                        </div>
                        <span className="text-cyan-300 font-bold w-10">{(result?.chartOutput?.values as number[])[idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result ? (
                <>
                  {result.stdout && <pre className="text-emerald-400 code-font text-xs whitespace-pre-wrap">{result.stdout}</pre>}
                  {result.stderr && <pre className="text-rose-400 code-font text-xs whitespace-pre-wrap">{result.stderr}</pre>}
                </>
              ) : (
                <div className="text-slate-600 italic py-4">{isAr ? 'اضغط تشغيل واختبار للتحقق من كود هذه الخطوة.' : 'Click Run & Test to verify your code logic.'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
