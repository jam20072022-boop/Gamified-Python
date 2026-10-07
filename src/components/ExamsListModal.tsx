import React from 'react';
import { X, ShieldAlert, Award, Clock, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { Exam, Certificate, LanguageCode } from '../types';
import { PROCTORED_EXAMS } from '../data/projectsAndExams';
import { soundEffects } from '../services/soundEffects';

interface ExamsListModalProps {
  language: LanguageCode;
  certificates: Certificate[];
  onClose: () => void;
  onStartExam: (exam: Exam) => void;
}

export const ExamsListModal: React.FC<ExamsListModalProps> = ({
  language,
  certificates,
  onClose,
  onStartExam,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isAr ? 'الامتحانات المعتمدة ومراقب الذكاء الاصطناعي (AI Proctor)' : 'AI-Proctored Certification Exams'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'امتحانات معتمدة مع تقنية منع الغش التلقائية وإصدار شهادات رسمية' : 'Proctored exams with anti-cheat monitoring & digital verification'}
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
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* AI Proctor Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
            <Eye className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              {isAr
                ? 'تنبيه النزاهة: يتم مراقبة تبويبات المتصفح، وسرعة الحل، وحركات النسخ واللصق تلقائياً بواسطة خوارزمية الذكاء الاصطناعي لضمان نزاهة الاختبار ومنع الغش.'
                : 'Integrity Notice: Tab switches, copy-pasting, and response timings are actively monitored by the AI Proctor sentinel to prevent cheating.'}
            </div>
          </div>

          {/* Exams List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300">{isAr ? 'الامتحانات المتاحة:' : 'Available Exams:'}</h3>
            {PROCTORED_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{isAr ? exam.title : exam.titleEn}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {exam.durationMinutes} {isAr ? 'دقيقة' : 'mins'}
                    </span>
                    <span>·</span>
                    <span>{exam.questions.length} {isAr ? 'أسئلة' : 'questions'}</span>
                    <span>·</span>
                    <span className="text-emerald-400">{isAr ? `درجة النجاح: ${exam.passingScore}%` : `Pass: ${exam.passingScore}%`}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onStartExam(exam);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
                >
                  <span>{isAr ? 'بدء الامتحان' : 'Start Exam'}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>

          {/* User Earned Certificates Gallery */}
          {certificates.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'الشهادات التي حصلت عليها:' : 'Your Earned Certificates:'}</span>
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{cert.examTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Grade: {cert.score}% · {cert.date} · Code: {cert.verificationCode}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      معتمد ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
