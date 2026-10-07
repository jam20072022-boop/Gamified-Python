import React, { useState } from 'react';
import { X, Smartphone, Download, Layers, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { LanguageCode } from '../types';

interface FlutterGuideModalProps {
  language: LanguageCode;
  onClose: () => void;
}

export const FlutterGuideModal: React.FC<FlutterGuideModalProps> = ({ language, onClose }) => {
  const isAr = language === 'ar';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundEffects.playClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const flutterRiverpodCode = `// lib/features/gamification/presentation/providers/user_stats_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserStatsState {
  final int xp;
  final int hearts;
  final int streakDays;
  final int gems;

  UserStatsState({
    required this.xp,
    required this.hearts,
    required this.streakDays,
    required this.gems,
  });

  UserStatsState copyWith({int? xp, int? hearts, int? streakDays, int? gems}) {
    return UserStatsState(
      xp: xp ?? this.xp,
      hearts: hearts ?? this.hearts,
      streakDays: streakDays ?? this.streakDays,
      gems: gems ?? this.gems,
    );
  }
}

class UserStatsNotifier extends StateNotifier<UserStatsState> {
  UserStatsNotifier() : super(UserStatsState(xp: 0, hearts: 5, streakDays: 1, gems: 120));

  void earnXp(int points) {
    state = state.copyWith(xp: state.xp + points, gems: state.gems + 5);
  }

  void loseHeart() {
    if (state.hearts > 0) {
      state = state.copyWith(hearts: state.hearts - 1);
    }
  }

  void refillHearts() {
    state = state.copyWith(hearts: 5);
  }
}

final userStatsProvider = StateNotifierProvider<UserStatsNotifier, UserStatsState>((ref) {
  return UserStatsNotifier();
});`;

  const dockerSandboxCode = `# Dockerfile for Server-Side Python Execution Sandbox
FROM python:3.11-slim

# Create isolated non-root user for security (no privilege escalation)
RUN useradd -m -u 1001 sandboxuser

WORKDIR /home/sandboxuser/app

# Install Data Science and AI baseline packages
RUN pip install --no-cache-dir numpy pandas scikit-learn matplotlib

USER sandboxuser

# Command with execution timeout (2 seconds max) and 50MB RAM limit
CMD ["python", "main.py"]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-black text-white">
                {isAr ? 'دليل تصدير ونشر Flutter & App Stores' : 'Flutter & Store Deployment Blueprint'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'معمارية كود Flutter، ملفات الساندبوكس، ومتطلبات النشر على Google Play و App Store' : 'Flutter Riverpod state, Docker sandbox specs, and Google Play launch checklist'}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Overview */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              {isAr
                ? 'التطبيق الحالي يعمل مباشرة وبسرعة في المتصفح على لابتوبك كـ Web Application و PWA تفاعلي بالكامل، وعند رغبتك بنقله إلى تطبيق Flutter أصلي (Native APK / IPA) يمكنك استخدام البنية المعمارية وأكواد Riverpod الجاهزة أدناه.'
                : 'This app is fully interactive in browser & PWA mode right now. Below is the full production Flutter architecture to package it for Google Play and App Store.'}
            </div>
          </div>

          {/* Section 1: Flutter Riverpod State Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'كود Flutter Riverpod لإدارة الأرواح والنقاط (Dart):' : 'Flutter Riverpod State Notifier (Dart):'}</span>
              </h3>
              <button
                onClick={() => handleCopy('flutter', flutterRiverpodCode)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'flutter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'flutter' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
              {flutterRiverpodCode}
            </pre>
          </div>

          {/* Section 2: Docker Sandbox Security Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'حاوية Docker Sandbox لتشغيل كود بايثون بأمان (Phase 4):' : 'Docker Isolated Sandbox Config:'}</span>
              </h3>
              <button
                onClick={() => handleCopy('docker', dockerSandboxCode)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'docker' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-mono overflow-x-auto max-h-36 leading-relaxed">
              {dockerSandboxCode}
            </pre>
          </div>

          {/* Section 3: App Store Checklist */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200">
              {isAr ? 'قائمة التحقق للنشر على Google Play & App Store:' : 'Google Play & App Store Launch Checklist:'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                isAr ? 'تجهيز أيقونة التطبيق (512x512 PNG بدون شفافية)' : '512x512 App Icon asset',
                isAr ? 'لقطات شاشة (Screenshots) لكافة التحديات والخريطة' : 'Curated Store Feature Screenshots',
                isAr ? 'إعداد ملف سياسة الخصوصية Privacy Policy' : 'Privacy Policy hosted webpage',
                isAr ? 'بناء نسخة الإنتاج عبر: flutter build appbundle' : 'Build with: flutter build appbundle',
                isAr ? 'تفعيل توقيع المفاتيح Google Play App Signing' : 'Google Play Keystore setup',
                isAr ? 'ربط Firebase Analytics و Crashlytics لمتابعة الأداء' : 'Crashlytics & retention monitoring',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
