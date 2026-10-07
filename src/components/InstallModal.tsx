import React from 'react';
import { X, Download, Monitor, Smartphone, CheckCircle, ArrowRight, Sparkles, ExternalLink, Laptop } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { LanguageCode } from '../types';

interface InstallModalProps {
  language: LanguageCode;
  deferredPrompt: any;
  onClose: () => void;
  onTriggerInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  language,
  deferredPrompt,
  onClose,
  onTriggerInstall,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isAr ? 'كيف تثبت PyQuest على متصفح Google Chrome؟' : 'How to Install on Google Chrome (PWA)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'يعمل كتطبيق سطح مكتب أو تطبيق هاتف مستقل بكامل الميزات' : 'Run as a standalone app with offline speed and full features'}
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Quick One-Click Button if Chrome detected the PWA prompt */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/50 text-center space-y-2.5 shadow-lg">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'متصفحك يدعم التثبيت الفوري بنقرة واحدة!' : 'One-Click Instant Install is Ready!'}</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onTriggerInstall();
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تثبيت تطبيق PyQuest على جهازي الآن' : 'Install PyQuest App Now'}</span>
              </button>
            </div>
          )}

          {/* Guide for Laptop (Google Chrome Desktop) - The primary user question */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
              <Laptop className="w-4 h-4" />
              <span>{isAr ? 'طريقة التثبيت على اللابتوب (متصفح Google Chrome):' : 'Install on Laptop (Google Chrome):'}</span>
            </div>

            <div className="space-y-2.5 text-slate-300 leading-relaxed ps-1">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-white">
                    {isAr ? 'الأيقونة السريعة في شريط الرابط (URL Bar):' : 'URL Bar Install Icon:'}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isAr
                      ? 'انظر في أعلى متصفح Chrome إلى أقصى يمين شريط الرابط (بجوار نجمة المفضلة ⭐️)، ستجد أيقونة صغيرة تشبه (شاشة كمبيوتر وسهم تنزيل 💻 أو ⬇️). اضغط عليها ثم اضغط "تثبيت (Install)".'
                      : 'Look at the right end of the Chrome address bar next to the star bookmark icon. You will see an Install icon (screen or arrow). Click it and press "Install".'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-white">
                    {isAr ? 'أو من قائمة الثلاث نقاط في كروم:' : 'Or from the Chrome (⋮) Menu:'}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isAr
                      ? 'اضغط على النقاط الثلاث (⋮) في أعلى يمين المتصفح -> اختر "حفظ ومشاركة (Save and share)" أو "تثبيت PyQuest (Install PyQuest)".'
                      : 'Click the three dots menu (⋮) in top-right of Chrome -> select "Save and share" -> click "Install PyQuest".'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-white">
                    {isAr ? 'النتيجة بعد التثبيت:' : 'Result after installing:'}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isAr
                      ? 'سيفتح PyQuest في نافذة مستقلة أنيقة وبدون شريط المتصفح المزعج، وستظهر أيقونته الخضراء الجميلة على سطح المكتب وفي شريط المهام (Taskbar) للوصول الفوري دائماً!'
                      : 'PyQuest launches in a distraction-free window with no browser tabs, and its icon appears on your Desktop and Taskbar for one-click access!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guide for Mobile Phone (Android / iPhone) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'طريقة التثبيت على الهاتف المحمول:' : 'Install on Mobile Phones:'}</span>
            </div>
            <ul className="space-y-2 text-slate-400 leading-relaxed text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'هواتف أندرويد (Chrome): اضغط على الثلاث نقاط (⋮) في أعلى المتصفح، ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
                    : 'Android Chrome: Tap (⋮) in the top-right and select "Install app" or "Add to Home screen".'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'هواتف آيفون (Safari): اضغط على زر المشاركة (Share مربع وسهم) في أسفل الشاشة، ثم مرر لأسفل واختر "إضافة إلى الصفحة الرئيسية (Add to Home Screen)".'
                    : 'iPhone Safari: Tap the Share button at the bottom and select "Add to Home Screen".'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            {isAr ? 'التطبيق متوافق 100% كـ PWA' : '100% PWA Compliant'}
          </span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            {isAr ? 'حسناً، فهمت الطريقة' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
