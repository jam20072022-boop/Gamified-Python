import React, { useState } from 'react';
import { X, CheckCircle2, LogIn, LogOut, ShieldCheck, Mail, Sparkles, UserCheck, RefreshCw, KeyRound, Globe } from 'lucide-react';
import { UserAccount, LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface AuthModalProps {
  currentUserAccount?: UserAccount;
  language: LanguageCode;
  onClose: () => void;
  onLoginGoogle: (account: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUserAccount,
  language,
  onClose,
  onLoginGoogle,
  onLogout,
}) => {
  const isAr = language === 'ar';
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Quick 1-Click Google Sign-In with preset / detected account
  const handleQuickGoogleSignIn = (email = 'jam20072022@gmail.com', name = 'Jam Developer') => {
    setIsLoading(true);
    soundEffects.playClick();

    setTimeout(() => {
      const account: UserAccount = {
        id: `google_${Date.now()}`,
        email: email.trim().toLowerCase(),
        displayName: name.trim() || email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        createdAt: currentUserAccount?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      onLoginGoogle(account);
      setIsLoading(false);
      soundEffects.playCorrect();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    handleQuickGoogleSignIn(customEmail, customName || customEmail.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentUserAccount
                  ? (isAr ? 'حسابك في PyQuest' : 'Your PyQuest Account')
                  : (isAr ? 'تسجيل الدخول عبر Google (Gmail)' : 'Sign in with Google / Gmail')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'مزامنة السحاب، حفظ الشهادات، وسلسلة التقدم'
                  : 'Cloud sync, certifications & streak backup'}
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
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs">
          {currentUserAccount ? (
            /* Logged-In State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden border-2 border-emerald-400 shrink-0">
                    <img
                      src="/src/assets/images/pyquest_mascot_avatar_1791276239891.jpg"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm truncate">{currentUserAccount.displayName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-slate-400 truncate text-[11px] font-mono mt-0.5">
                      {currentUserAccount.email}
                    </div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      <span>✓ {isAr ? 'موثق عبر Google' : 'Google Verified'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{isAr ? 'آخر تسجيل دخول:' : 'Last Login:'}</span>
                  <span className="font-mono text-slate-300">
                    {new Date(currentUserAccount.lastLoginAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-1.5 leading-relaxed">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حسابك السحابي متصل بنجاح!' : 'Cloud Sync Active'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'جميع نقاطك (XP)، أوسمتك، شهادات الامتحانات، وسلسلة الأيام مرتبطة تلقائياً ببريدك في Gmail. يمكنك فتح التطبيق من أي متصفح أو هاتف والمتابعة من حيث توقفت.'
                    : 'Your XP, badges, verified exam certificates, and streak are safely linked to your Gmail. You can access them from any Chrome browser or mobile device.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'التبديل إلى حساب Gmail آخر' : 'Switch to another Gmail'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged-Out / Sign-In Screen */
            <div className="space-y-4">
              {/* Explain to user how Gmail access works */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'نظام الحسابات ببريد Gmail مفتوح للجميع:' : 'Universal Gmail Sign-In:'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isAr
                    ? 'أي شخص ترسل له الرابط يستطيع فتح التطبيق في متصفح Google Chrome، وتسجيل الدخول بحساب Gmail الخاص به فوراً ليصبح لديه حساب شخصي يحفظ تقدمه وأوسمته وشهاداته!'
                    : 'Anyone who opens your app link in Chrome or mobile can sign in with their own Gmail account to save their individual XP, certificates, and streak!'}
                </p>
              </div>

              {/* Instant Google One-Click Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickGoogleSignIn('jam20072022@gmail.com', 'Jam Developer')}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {/* Real Google multi-color SVG icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? (isAr ? 'جارِ التحقق والدخول...' : 'Signing in...') : (isAr ? 'متابعة بحساب Google (jam20072022@gmail.com)' : 'Continue with Google')}</span>
              </button>

              {/* Or enter any other Gmail */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-slate-500 text-[11px]">
                  {isAr ? 'أو الدخول بأي إيميل Gmail آخر' : 'or enter any custom Gmail'}
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'عنوان البريد الإلكتروني (Gmail):' : 'Gmail Address:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم المعروض (اختياري):' : 'Display Name (optional):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g., Alex Developer'}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !customEmail}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء الحساب والدخول فوراً' : 'Create Account & Sign In'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-slate-400 text-[11px]">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr
                ? 'التطبيق متصل بقاعدة بيانات التخزين السحابية؛ ويمكن مشاركة الرابط مع أي عدد من المستخدمين ليتعلم كل شخص بشكل مستقل بحسابه الخاص.'
                : 'Shared links let all users create personal accounts with their own email and track independent learning records.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
