import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface LanguageModalProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const languages: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English (Default)', nativeName: 'English Interface & Code', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية (واجهة وشرح كامل)', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français (Explications)', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español (Explicaciones)', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch (Erklärungen)', flag: '🇩🇪' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">اختر لغة التطبيق / Select Language</h2>
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

        {/* Languages List */}
        <div className="py-4 space-y-2">
          {languages.map((l) => {
            const isSelected = currentLanguage === l.code;
            return (
              <button
                key={l.code}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectLanguage(l.code);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.flag}</span>
                  <div>
                    <div className="font-bold text-sm text-white">{l.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{l.nativeName}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
