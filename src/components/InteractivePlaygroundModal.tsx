import React, { useState } from 'react';
import { X, Play, RefreshCw, Terminal, Copy, Check, Sparkles } from 'lucide-react';
import { PythonRunner } from '../services/pythonRunner';
import { ExecutionResult, LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface InteractivePlaygroundModalProps {
  language: LanguageCode;
  onClose: () => void;
}

export const InteractivePlaygroundModal: React.FC<InteractivePlaygroundModalProps> = ({
  language,
  onClose,
}) => {
  const isAr = language === 'ar';

  const PRESETS = [
    {
      title: isAr ? 'رسم بياني Matplotlib' : 'Matplotlib Chart',
      code: `import matplotlib.pyplot as plt

cities = ["الرياض", "دبي", "جدة", "الدوحة", "مسقط"]
users = [1200, 1500, 950, 800, 600]

plt.title("إحصائيات مستخدمي بايثون في الخليج")
plt.bar(cities, users)
plt.show()

print("تم توليد المخطط البياني التفاعلي بنجاح!")`,
    },
    {
      title: isAr ? 'مصفوفات NumPy' : 'NumPy Arrays',
      code: `import numpy as np

scores = np.array([88, 92, 79, 95, 84, 91])
print("المصفوفة:", scores)
print("المتوسط الحسابي (Mean):", np.mean(scores))
print("مجموع القيم (Sum):", np.sum(scores))
print("الانحراف المعياري (Std):", round(np.std(scores), 2))`,
    },
    {
      title: isAr ? 'جداول Pandas' : 'Pandas DataFrame',
      code: `import pandas as pd

data = {
    "الاسم": ["أحمد", "سارة", "خالد", "مريم"],
    "الخبرة_سنة": [3, 5, 2, 6],
    "المسار": ["AI", "Data", "Python", "AI"]
}

df = pd.DataFrame(data)
print("معاينة جدول البيانات:")
print(df)
print("\nملخص:")
print(df.describe())`,
    },
    {
      title: isAr ? 'تقييم نموذج ذكاء اصطناعي' : 'AI Model Evaluation',
      code: `total_tests = 500
correct_predictions = 478

accuracy = (correct_predictions / total_tests) * 100
error_rate = 100 - accuracy

print("تقرير أداء النموذج العصبي:")
print("إجمالي العينات:", total_tests)
print("نسبة الدقة (Accuracy):", f"{accuracy:.2f}%")
print("معدل الخطأ (Error Rate):", f"{error_rate:.2f}%")

if accuracy >= 95:
    print("الحالة: النموذج جاهز للنشر في بيئة الإنتاج! 🚀")
else:
    print("الحالة: بحاجة لإعادة الضبط (Fine-tuning)")`,
    },
  ];

  const [code, setCode] = useState(PRESETS[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    soundEffects.playClick();
    const res = await PythonRunner.executeCode(code);
    setResult(res);
    setIsRunning(false);
    if (res.success) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playWrong();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'مختبر بايثون وساندبوكس التجارب' : 'Python Playground & Sandbox'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'جرب كتابة وتشغيل أي كود بايثون مع دعم NumPy و Pandas و Matplotlib محلياً' : 'Execute Python, NumPy, Pandas and Matplotlib directly in your browser'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title={isAr ? 'نسخ الكود' : 'Copy code'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Snippet Buttons */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold shrink-0">{isAr ? 'أمثلة جاهزة:' : 'Presets:'}</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEffects.playClick();
                setCode(p.code);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white shrink-0 font-medium transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Editor & Console Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
          {/* Editor Side */}
          <div className="flex flex-col h-full bg-slate-950">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="code-font text-emerald-400 font-bold">playground.py</span>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isAr ? 'تشغيل (Run)' : 'Execute'}</span>
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-slate-950 text-slate-100 code-font text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/40 leading-relaxed font-mono"
            />
          </div>

          {/* Console & Plot Output Side */}
          <div className="flex flex-col h-full bg-slate-950 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'شاشة الإخراج (Output Console)' : 'Output Console'}</span>
              </div>
              {result && <span className="text-[10px] text-slate-500">{result.executionTimeMs} ms</span>}
            </div>

            {/* Matplotlib Visualization if generated */}
            {result?.chartOutput && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                  <span>📊 {result.chartOutput.title}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Rendered Visual</span>
                </div>
                <div className="space-y-2">
                  {result.chartOutput.labels.map((lbl, idx) => {
                    const val = (result?.chartOutput?.values as number[])[idx] || 0;
                    const max = Math.max(...(result?.chartOutput?.values as number[]), 1);
                    const width = Math.min(100, Math.round((val / max) * 100));
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-20 truncate text-slate-400 text-end">{lbl}</span>
                        <div className="flex-1 bg-slate-800 rounded-md h-5 overflow-hidden relative">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-md transition-all duration-700"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-300 w-12">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Text Output / Logs */}
            {result ? (
              <div className="space-y-2">
                {result.stdout && (
                  <pre className="text-xs text-emerald-400 code-font whitespace-pre-wrap leading-relaxed">
                    {result.stdout}
                  </pre>
                )}
                {result.stderr && (
                  <pre className="text-xs text-rose-400 code-font whitespace-pre-wrap leading-relaxed">
                    {result.stderr}
                  </pre>
                )}
                {!result.stdout && !result.stderr && !result.chartOutput && (
                  <div className="text-xs text-slate-500 italic">
                    {isAr ? 'تم تنفيذ الكود بنجاح (بدون طباعة مخرجات).' : 'Code executed with zero output.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-600 text-xs">
                {isAr ? 'اضغط على "تشغيل (Run)" لمشاهدة النتائج والرسوم البيانية هنا.' : 'Click Execute to inspect output logs and plots.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
