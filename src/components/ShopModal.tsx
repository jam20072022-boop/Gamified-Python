import React from 'react';
import { X, Heart, Shield, Palette, Zap, Gem, Check } from 'lucide-react';
import { UserStats, LanguageCode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ShopModalProps {
  userStats: UserStats;
  language: LanguageCode;
  onClose: () => void;
  onBuyItem: (itemKey: 'refill_hearts' | 'streak_freeze' | 'theme_monokai' | 'theme_cyberpunk') => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  userStats,
  language,
  onClose,
  onBuyItem,
}) => {
  const isAr = language === 'ar';

  const items = [
    {
      key: 'refill_hearts' as const,
      icon: <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />,
      title: isAr ? 'إعادة شحن القلوب كاملة' : 'Refill All Hearts',
      desc: isAr ? 'شحن فوري إلى 5 قلوب لمتابعة الدروس والتحديات دون توقف' : 'Instantly restore up to 5 lives to keep coding without delays',
      price: 50,
      alreadyPurchased: userStats.hearts >= userStats.maxHearts,
      disabledText: isAr ? 'قلوبك ممتلئة' : 'Hearts Full',
    },
    {
      key: 'streak_freeze' as const,
      icon: <Shield className="w-6 h-6 text-sky-400" />,
      title: isAr ? 'تجميد السلسلة (Streak Freeze)' : 'Streak Freeze Shield',
      desc: isAr ? 'يحمي سلسلتك اليومية من الضياع إذا انشغلت يوماً دون فتح التطبيق' : 'Safeguards your daily streak if you miss a day of practice',
      price: 100,
      alreadyPurchased: userStats.streakFrozen,
      disabledText: isAr ? 'مُفعّل حالياً' : 'Active',
    },
    {
      key: 'theme_monokai' as const,
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      title: isAr ? 'ثيم المحرر: Monokai Pro' : 'Editor Theme: Monokai Pro',
      desc: isAr ? 'مظهر ألوان احترافي للمحرر مستوحى من Sublime Text و VS Code' : 'Iconic contrast theme for professional Python development',
      price: 150,
      alreadyPurchased: userStats.selectedTheme === 'monokai',
      disabledText: isAr ? 'مُقتنى' : 'Owned',
    },
    {
      key: 'theme_cyberpunk' as const,
      icon: <Zap className="w-6 h-6 text-fuchsia-400" />,
      title: isAr ? 'ثيم المحرر: Cyberpunk Neon' : 'Editor Theme: Cyberpunk Neon',
      desc: isAr ? 'ألوان نيون سايبربانك مشعة وحماسية تجعل الكود ينبض بالحياة' : 'High octane neon synthwave styling for dark mode terminals',
      price: 200,
      alreadyPurchased: userStats.selectedTheme === 'cyberpunk',
      disabledText: isAr ? 'مُقتنى' : 'Owned',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{isAr ? 'متجر الجواهر' : 'Gems Shop'}</span>
              <span className="text-sm">💎</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'استبدل الجواهر التي جمعتها بمكافآت وثيمات وحماية' : 'Redeem your earned gems for hearts, freezes and themes'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold text-sm">
              <Gem className="w-4 h-4 fill-cyan-400" />
              <span>{userStats.gems}</span>
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
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.map((item) => {
            const canAfford = userStats.gems >= item.price;
            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {item.alreadyPurchased ? (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.disabledText}</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (canAfford) {
                          onBuyItem(item.key);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                        canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>{item.price}</span>
                      <Gem className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
