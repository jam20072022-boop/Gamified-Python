import React, { useRef, useEffect, useState } from 'react';
import { Play, DollarSign, Battery, Smile, Utensils, Laptop, Car, Home, TrendingUp, Sparkles, Coffee, Briefcase, Award, Users, Bot, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface LifeSimGameProps {
  isAr: boolean;
  onEarnRewards: (xp: number, gems: number) => void;
}

interface Building {
  id: string;
  name: string;
  nameEn: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  icon: string;
  actionText: string;
}

export const LifeSimGame: React.FC<LifeSimGameProps> = ({ isAr, onEarnRewards }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cash, setCash] = useState(600);
  const [stamina, setStamina] = useState(100);
  const [level, setLevel] = useState(1);
  const [ownedCars, setOwnedCars] = useState<string[]>(['Bicycle']);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverPlayersCount] = useState(2419);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Player position in 2D Cyber City
  const playerRef = useRef({
    x: 200,
    y: 250,
    w: 24,
    h: 24,
    speed: 4,
    color: '#10b981',
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number | null>(null);

  // City interactive destinations
  const buildings: Building[] = [
    {
      id: 'tech_tower',
      name: 'برج شركات التكنولوجيا والذكاء الاصطناعي',
      nameEn: 'Tech Tower HQ',
      x: 30,
      y: 40,
      w: 100,
      h: 80,
      color: '#3b82f6',
      icon: '🏢',
      actionText: isAr ? 'إنجاز مهام برمجية واكتساب دولارات وXP' : 'Work on AI Coding Gigs',
    },
    {
      id: 'car_showroom',
      name: 'معرض السيارات الفاخرة وسيارات السباق',
      nameEn: 'Luxury Car Showroom',
      x: 270,
      y: 40,
      w: 100,
      h: 80,
      color: '#f59e0b',
      icon: '🏎️',
      actionText: isAr ? 'شراء سيارات رياضية وإضافتها للكراج' : 'Buy Sports & Super Cars',
    },
    {
      id: 'cyber_arena',
      name: 'حلبة التحديات المباشرة ضد السيرفر والذكاء الاصطناعي',
      nameEn: 'PvP & AI Battle Arena',
      x: 30,
      y: 350,
      w: 100,
      h: 80,
      color: '#ec4899',
      icon: '⚔️',
      actionText: isAr ? 'مبارزة مباشرة ضد منافسين' : 'Enter AI & Server Arena',
    },
    {
      id: 'cafe_food',
      name: 'مقهى ومطعم شحن الطاقة والمأكولات',
      nameEn: 'Cyber Bistro & Cafe',
      x: 270,
      y: 350,
      w: 100,
      h: 80,
      color: '#10b981',
      icon: '☕',
      actionText: isAr ? 'شراء قهوة وطعام لشحن الطاقة فوراً' : 'Eat & Recharge Energy',
    },
  ];

  const showStatus = (text: string) => {
    setStatusNotice(text);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (activeBuilding) {
          setModalOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeBuilding]);

  // 60fps City Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const keys = keysRef.current;
      const p = playerRef.current;

      // Move player around city
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        p.x = Math.max(10, p.x - p.speed);
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        p.x = Math.min(canvas.width - p.w - 10, p.x + p.speed);
      }
      if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        p.y = Math.max(10, p.y - p.speed);
      }
      if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        p.y = Math.min(canvas.height - p.h - 10, p.y + p.speed);
      }

      // Check proximity to interactive buildings
      let touchingBuilding: Building | null = null;
      buildings.forEach((b) => {
        const near =
          p.x + p.w >= b.x - 15 &&
          p.x <= b.x + b.w + 15 &&
          p.y + p.h >= b.y - 15 &&
          p.y <= b.y + b.h + 15;
        if (near) {
          touchingBuilding = b;
        }
      });
      setActiveBuilding(touchingBuilding);

      // CLEAR & DRAW CYBER CITY MAP
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Street intersections (dark asphalt)
      ctx.fillStyle = '#0f172a';
      // Center crossroads
      ctx.fillRect(150, 0, 100, canvas.height);
      ctx.fillRect(0, 190, canvas.width, 90);

      // Road markings (yellow neon dashed lines)
      ctx.fillStyle = '#eab308';
      for (let y = 10; y < canvas.height; y += 30) {
        ctx.fillRect(198, y, 4, 15);
      }
      for (let x = 10; x < canvas.width; x += 30) {
        ctx.fillRect(x, 233, 15, 4);
      }

      // DRAW BUILDINGS
      buildings.forEach((b) => {
        const isSelected = touchingBuilding?.id === b.id;

        // Building structure
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 12);
        ctx.fill();

        // Glowing border if player is touching it
        if (isSelected) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Inner roof
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16, 8);
        ctx.fill();

        // Building Title & Emoji Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.fillText(b.icon, b.x + b.w / 2 - 12, b.y + b.h / 2 + 8);
      });

      // DRAW OTHER ONLINE SERVER PLAYERS SIMULATION
      const time = Date.now() * 0.002;
      [
        { name: '🌐 Omar (Server)', x: 170 + Math.sin(time) * 15, y: 110, color: '#38bdf8' },
        { name: '🤖 AI_Bot_01', x: 215, y: 310 + Math.cos(time) * 20, color: '#ec4899' },
      ].forEach((bot) => {
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(bot.name, bot.x - 20, bot.y - 12);
      });

      // DRAW PLAYER HERO CHARACTER
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Halo / Headband
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2 - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Player Name Tag above head
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(isAr ? 'أنت (Player)' : 'YOU', p.x - 4, p.y - 8);

      gameLoopRef.current = requestAnimationFrame(render);
    };

    gameLoopRef.current = requestAnimationFrame(render);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  // Building interactions
  const handlePerformAction = () => {
    if (!activeBuilding) return;

    if (activeBuilding.id === 'tech_tower') {
      if (stamina < 20) {
        soundEffects.playWrong();
        showStatus(isAr ? 'طاقتك منخفضة! اذهب للمطعم أولاً.' : 'Out of energy! Visit cafe first.');
        return;
      }
      soundEffects.playCash();
      setCash((c) => c + 350);
      setStamina((s) => Math.max(0, s - 20));
      setLevel((l) => l + 1);
      onEarnRewards(60, 5);
      showStatus(isAr ? 'أنجزت مهمة ذكاء اصطناعي! استلمت 350$ و +60 XP! 💵' : 'Completed AI task! Earned $350 & +60 XP!');
      setModalOpen(false);
    } else if (activeBuilding.id === 'cafe_food') {
      if (cash < 15) {
        soundEffects.playWrong();
        showStatus(isAr ? 'ليس لديك مال كافٍ!' : 'Not enough cash!');
        return;
      }
      soundEffects.playClick();
      setCash((c) => c - 15);
      setStamina(100);
      showStatus(isAr ? 'تناولت قهوة ومأكولات! طاقتك أصبحت 100% ⚡' : 'Stamina fully recharged to 100%!');
      setModalOpen(false);
    } else if (activeBuilding.id === 'car_showroom') {
      if (cash < 2500) {
        soundEffects.playWrong();
        showStatus(isAr ? 'تحتاج 2,500$ على الأقل لشراء سيارة رياضية!' : 'Need $2,500 to buy this sports car!');
        return;
      }
      soundEffects.playCash();
      setCash((c) => c - 2500);
      setOwnedCars((prev) => [...prev, 'Corolla GT']);
      onEarnRewards(100, 10);
      showStatus(isAr ? 'مبروك! اشتريت سيارة سباق جديدة للكراج! 🏎️' : 'Bought a new sports car!');
      setModalOpen(false);
    } else if (activeBuilding.id === 'cyber_arena') {
      soundEffects.playNitro();
      setCash((c) => c + 200);
      onEarnRewards(80, 8);
      showStatus(isAr ? 'فزت في جولة الحلبة المباشرة ضد منافس السيرفر! (+200$ و +80 XP) 🏆' : 'Won Arena Match! +$200 & +80 XP!');
      setModalOpen(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4">
      {/* Top City Telemetry & Server Live Status */}
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-base font-black text-emerald-400 font-mono">${cash}</span>
        </div>

        <div className="flex items-center gap-2">
          <Battery className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-300">{stamina}% ⚡</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <Users className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">
            {isAr ? `السيرفر: ${serverPlayersCount} أونلاين` : `Online: ${serverPlayersCount}`}
          </span>
        </div>
      </div>

      {/* Floating Status Toast */}
      {statusNotice && (
        <div className="w-full p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs text-center shadow-lg animate-in fade-in">
          {statusNotice}
        </div>
      )}

      {/* 2D Cyber City Interactive Map Canvas */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        <canvas ref={canvasRef} width={400} height={470} className="block w-full max-w-[380px] sm:max-w-[400px] h-auto" />

        {/* Prompt when standing near a building */}
        {activeBuilding && !modalOpen && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-cyan-500/50 p-3 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeBuilding.icon}</span>
              <div>
                <div className="font-black text-white text-xs">
                  {isAr ? activeBuilding.name : activeBuilding.nameEn}
                </div>
                <div className="text-[11px] text-cyan-300 font-bold">
                  {activeBuilding.actionText}
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95"
            >
              {isAr ? 'دخول المبنى' : 'Enter'}
            </button>
          </div>
        )}

        {/* Building Interaction Modal Dialog */}
        {modalOpen && activeBuilding && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
            <span className="text-5xl">{activeBuilding.icon}</span>
            <div>
              <h3 className="text-xl font-black text-white">
                {isAr ? activeBuilding.name : activeBuilding.nameEn}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                {activeBuilding.actionText}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handlePerformAction}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
              >
                {isAr ? 'تنفيذ وتأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIRTUAL CONTROLLER FOR WALKING AROUND CITY */}
      <div className="w-full max-w-md bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
        <div className="text-center text-[11px] font-bold text-slate-400">
          🕹️ {isAr ? 'تحكم في حركة شخصيتك وتجول في المدينة بحرية:' : 'Virtual Joystick / Directional Controls:'}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onTouchStart={() => (keysRef.current['ArrowUp'] = true)}
            onTouchEnd={() => (keysRef.current['ArrowUp'] = false)}
            onMouseDown={() => (keysRef.current['ArrowUp'] = true)}
            onMouseUp={() => (keysRef.current['ArrowUp'] = false)}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-emerald-500 text-white active:text-slate-950 flex items-center justify-center"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onTouchStart={() => (keysRef.current['ArrowLeft'] = true)}
            onTouchEnd={() => (keysRef.current['ArrowLeft'] = false)}
            onMouseDown={() => (keysRef.current['ArrowLeft'] = true)}
            onMouseUp={() => (keysRef.current['ArrowLeft'] = false)}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-emerald-500 text-white active:text-slate-950 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => (keysRef.current['ArrowDown'] = true)}
            onTouchEnd={() => (keysRef.current['ArrowDown'] = false)}
            onMouseDown={() => (keysRef.current['ArrowDown'] = true)}
            onMouseUp={() => (keysRef.current['ArrowDown'] = false)}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-emerald-500 text-white active:text-slate-950 flex items-center justify-center"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => (keysRef.current['ArrowRight'] = true)}
            onTouchEnd={() => (keysRef.current['ArrowRight'] = false)}
            onMouseDown={() => (keysRef.current['ArrowRight'] = true)}
            onMouseUp={() => (keysRef.current['ArrowRight'] = false)}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-emerald-500 text-white active:text-slate-950 flex items-center justify-center"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
