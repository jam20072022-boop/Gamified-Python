import React, { useState } from 'react';
import { X, Plus, Save, Download, Upload, Check, Settings2 } from 'lucide-react';
import { Track, QuestionType, TrackId, LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface CMSModalProps {
  tracks: Track[];
  language: LanguageCode;
  onClose: () => void;
  onSaveNewQuestion: (trackId: TrackId, moduleId: string, lessonId: string, newQ: any) => void;
  onExportCurriculum: () => void;
  onResetCurriculum: () => void;
}

export const CMSModal: React.FC<CMSModalProps> = ({
  tracks,
  language,
  onClose,
  onSaveNewQuestion,
  onExportCurriculum,
  onResetCurriculum,
}) => {
  const isAr = language === 'ar';

  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>('python_basics');
  const [selectedModuleId, setSelectedModuleId] = useState(tracks[0]?.modules[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState(tracks[0]?.modules[0]?.lessons[0]?.id || '');
  const [qType, setQType] = useState<QuestionType>('mcq');

  // Form states
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [xpReward, setXpReward] = useState(25);
  const [explanationAr, setExplanationAr] = useState('');
  const [explanationEn, setExplanationEn] = useState('');

  // MCQ specific
  const [mcqOptions, setMcqOptions] = useState(['الخيار 1', 'الخيار 2', 'الخيار 3', 'الخيار 4']);
  const [mcqCorrectIdx, setMcqCorrectIdx] = useState(0);

  // Code editor specific
  const [initialCode, setInitialCode] = useState('# اكتب الكود هنا\n');
  const [expectedSubstring, setExpectedSubstring] = useState('');

  const [successSaved, setSuccessSaved] = useState(false);

  const currentTrack = tracks.find((t) => t.id === selectedTrackId);
  const currentModules = currentTrack?.modules || [];
  const currentModule = currentModules.find((m) => m.id === selectedModuleId);
  const currentLessons = currentModule?.lessons || [];

  const handleSave = () => {
    if (!titleAr || !instructionsAr) {
      alert(isAr ? 'يرجى إدخال عنوان السؤال والتعليمات أولاً' : 'Please provide question title and prompt');
      return;
    }

    let questionData: any = {
      id: `custom_q_${Date.now()}`,
      type: qType,
      title: titleAr,
      titleEn: titleEn || titleAr,
      instructions: instructionsAr,
      instructionsEn: instructionsEn || instructionsAr,
      xpReward: Number(xpReward) || 25,
      explanation: explanationAr || 'إجابة ممتازة!',
      explanationEn: explanationEn || 'Well done!',
    };

    if (qType === 'mcq') {
      questionData = {
        ...questionData,
        options: mcqOptions,
        optionsEn: mcqOptions,
        correctAnswerIndex: mcqCorrectIdx,
      };
    } else if (qType === 'code_editor') {
      questionData = {
        ...questionData,
        initialCode,
        solutionCode: initialCode,
        testCases: [
          {
            description: 'التحقق من المخرجات المتوقعة',
            descriptionEn: 'Check expected output',
            expectedOutputSubstring: expectedSubstring,
          },
        ],
      };
    } else {
      // Default fallback
      questionData = {
        ...questionData,
        options: ['صح', 'خطأ'],
        correctAnswerIndex: 0,
      };
    }

    onSaveNewQuestion(selectedTrackId, selectedModuleId, selectedLessonId, questionData);
    soundEffects.playCorrect();
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-black text-white">
                {isAr ? 'لوحة إدارة المحتوى ومنشئ الدروس (CMS Studio)' : 'CMS Curriculum Studio'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'إضافة تحديات ومراحل جديدة مباشرة في التطبيق وحفظها' : 'Add custom questions and manage curriculum hierarchy'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Track / Module / Lesson Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isAr ? 'المسار التعليمي:' : 'Track:'}
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value as TrackId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>{isAr ? t.title : t.titleEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isAr ? 'الوحدة:' : 'Module:'}
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currentModules.map((m) => (
                  <option key={m.id} value={m.id}>{isAr ? m.title : m.titleEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isAr ? 'الدرس المستهدف:' : 'Target Lesson:'}
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currentLessons.map((l) => (
                  <option key={l.id} value={l.id}>{isAr ? l.title : l.titleEn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              {isAr ? 'نوع التحدي / السؤال:' : 'Question Type:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'mcq' as const, name: isAr ? 'اختيار من متعدد (MCQ)' : 'Multiple Choice' },
                { id: 'code_editor' as const, name: isAr ? 'محرر كود بايثون' : 'Python Code Editor' },
                { id: 'fill_blank' as const, name: isAr ? 'ملء الفراغات' : 'Fill in Blanks' },
                { id: 'parsons' as const, name: isAr ? 'ترتيب أسطر الكود' : 'Parsons Problem' },
                { id: 'bug_hunting' as const, name: isAr ? 'صيد الأخطاء' : 'Bug Hunting' },
                { id: 'visual_data' as const, name: isAr ? 'التحدي البصري' : 'Visual Data' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQType(t.id)}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    qType === t.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Meta Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  {isAr ? 'عنوان السؤال (عربي):' : 'Title (AR):'}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: حساب مجموع الأرقام"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  {isAr ? 'نقاط الخبرة XP:' : 'XP Reward:'}
                </label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {isAr ? 'نص التعليمات والمطلوب:' : 'Instructions:'}
              </label>
              <textarea
                value={instructionsAr}
                onChange={(e) => setInstructionsAr(e.target.value)}
                placeholder="اشرح للمتعلم ما المطلوب منه برمجياً..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Conditional Fields based on QType */}
          {qType === 'mcq' && (
            <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isAr ? 'الخيارات الأربعة (حدد الإجابة الصحيحة):' : 'Options (Mark Correct):'}
              </label>
              {mcqOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mcq_correct"
                    checked={mcqCorrectIdx === idx}
                    onChange={() => setMcqCorrectIdx(idx)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...mcqOptions];
                      updated[idx] = e.target.value;
                      setMcqOptions(updated);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
              ))}
            </div>
          )}

          {qType === 'code_editor' && (
            <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'الكود المبدئي في المحرر:' : 'Initial Starter Code:'}
                </label>
                <textarea
                  value={initialCode}
                  onChange={(e) => setInitialCode(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'المخرجات المتوقعة في الاختبار (Substring):' : 'Expected Output Substring:'}
                </label>
                <input
                  type="text"
                  value={expectedSubstring}
                  onChange={(e) => setExpectedSubstring(e.target.value)}
                  placeholder="مثال: 100 أو True"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              {isAr ? 'شرح الإجابة عند الحل الصحيح:' : 'Explanation feedback:'}
            </label>
            <input
              type="text"
              value={explanationAr}
              onChange={(e) => setExplanationAr(e.target.value)}
              placeholder="مثال: أحسنت! دالة print تقوم بطباعة القيم على الشاشة."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCurriculum}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(isAr ? 'إعادة ضبط المنهاج للوضع الافتراضي؟' : 'Reset curriculum to factory defaults?')) {
                  onResetCurriculum();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'إعادة تعيين' : 'Reset'}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {successSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{successSaved ? (isAr ? 'تم الحفظ بنجاح!' : 'Saved!') : (isAr ? 'حفظ وإضافة السؤال' : 'Save Question')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
