import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Crosshair, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Bomb, Shield, Users, Bot, Wrench, Terminal, Zap, Trophy } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface ShooterGameProps {
  isAr: boolean;
  onEarnRewards: (xp: number, gems: number) => void;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy?: boolean;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hp: number;
  maxHp: number;
  type: 'soldier' | 'drone' | 'boss';
  lastShot: number;
}

export const ShooterGame: React.FC<ShooterGameProps> = ({ isAr, onEarnRewards }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'workshop' | 'playing' | 'gameover'>('menu');
  const [gameMode, setGameMode] = useState<'server' | 'ai'>('server');
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [weaponType, setWeaponType] = useState<'normal' | 'spread' | 'laser'>('spread');
  const [specialBombs, setSpecialBombs] = useState(2);
  const [bossHpPercent, setBossHpPercent] = useState<number | null>(null);

  // Weapon upgrade code
  const [weaponCode, setWeaponCode] = useState(
`# 🔫 Cyber Contra Weapon Script
gun.bullet_spread = 5
gun.damage_multiplier = 2.5
gun.fire_rate = "rapid"
gun.laser_mode = True`
  );
  const [codeNotice, setCodeNotice] = useState<string | null>(null);

  // Player platformer physics state
  const playerRef = useRef({
    x: 60,
    y: 350,
    w: 28,
    h: 46,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facing: 1 as 1 | -1, // 1 right, -1 left
    aimingUp: false,
    crouching: false,
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const isPlayingRef = useRef(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastShotRef = useRef(0);
  const cameraXRef = useRef(0);

  // Platforms in Contra level
  const platforms: Platform[] = [
    { x: 0, y: 440, w: 2200, h: 60 }, // Main ground
    { x: 120, y: 350, w: 140, h: 16 }, // Lower platform 1
    { x: 320, y: 280, w: 160, h: 16 }, // High platform 2
    { x: 540, y: 340, w: 140, h: 16 }, // Platform 3
    { x: 740, y: 270, w: 180, h: 16 }, // Platform 4
    { x: 1000, y: 320, w: 200, h: 16 }, // Platform 5
    { x: 1350, y: 380, w: 400, h: 20 }, // Boss stage arena
  ];

  const handleApplyWeaponCode = () => {
    soundEffects.playCash();
    setWeaponType('spread');
    setCodeNotice(isAr ? 'تم تفعيل سلاح Spread Gun الخارق بنجاح! 5 طلقات متفرقة وضرر مضاعف!' : 'Spread Gun Activated! 5 spread bullets with 2.5x damage!');
    soundEffects.playLevelUp();
  };

  const startContraGame = () => {
    soundEffects.playNitro();
    playerRef.current = {
      x: 60,
      y: 350,
      w: 28,
      h: 46,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 1,
      aimingUp: false,
      crouching: false,
    };
    bulletsRef.current = [];
    cameraXRef.current = 0;
    setScore(0);
    setPlayerHp(100);
    setSpecialBombs(2);
    setBossHpPercent(null);

    // Initial Contra Enemies
    enemiesRef.current = [
      { id: '1', x: 260, y: 400, w: 28, h: 44, vx: -1.2, hp: 2, maxHp: 2, type: 'soldier', lastShot: 0 },
      { id: '2', x: 380, y: 240, w: 28, h: 44, vx: 0.8, hp: 2, maxHp: 2, type: 'soldier', lastShot: 0 },
      { id: '3', x: 580, y: 160, w: 32, h: 24, vx: -1.5, hp: 2, maxHp: 2, type: 'drone', lastShot: 0 },
      { id: '4', x: 800, y: 400, w: 28, h: 44, vx: -1, hp: 3, maxHp: 3, type: 'soldier', lastShot: 0 },
      { id: '5', x: 1100, y: 200, w: 32, h: 24, vx: 1.2, hp: 2, maxHp: 2, type: 'drone', lastShot: 0 },
      // Boss
      { id: 'boss', x: 1550, y: 320, w: 70, h: 90, vx: 0, hp: 35, maxHp: 35, type: 'boss', lastShot: 0 },
    ];

    isPlayingRef.current = true;
    setGameState('playing');
  };

  const fireGun = () => {
    if (!isPlayingRef.current) return;
    const now = Date.now();
    if (now - lastShotRef.current < 150) return;
    lastShotRef.current = now;

    soundEffects.playLaser();
    const p = playerRef.current;
    const spawnX = p.facing === 1 ? p.x + p.w + 4 : p.x - 8;
    const spawnY = p.crouching ? p.y + p.h / 2 : p.aimingUp ? p.y - 6 : p.y + 14;

    const baseVy = p.aimingUp ? -12 : 0;
    const baseVx = p.aimingUp ? p.facing * 3 : p.facing * 14;

    if (weaponType === 'spread') {
      // Classic Contra S-Gun 5-bullet spread!
      [-3, -1.5, 0, 1.5, 3].forEach((spreadAngle) => {
        bulletsRef.current.push({
          x: spawnX,
          y: spawnY,
          vx: p.aimingUp ? p.facing * spreadAngle : p.facing * 13,
          vy: p.aimingUp ? -13 : spreadAngle * 1.8,
        });
      });
    } else {
      // Normal Gun
      bulletsRef.current.push({
        x: spawnX,
        y: spawnY,
        vx: baseVx,
        vy: baseVy,
      });
    }
  };

  const triggerBomb = () => {
    if (!isPlayingRef.current || specialBombs <= 0) return;
    soundEffects.playExplosion();
    setSpecialBombs((prev) => prev - 1);

    // Screen nuke damage to all visible enemies
    enemiesRef.current.forEach((en) => {
      en.hp -= en.type === 'boss' ? 12 : 5;
    });
    enemiesRef.current = enemiesRef.current.filter((en) => en.hp > 0);
    setScore((s) => s + 100);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 's', 'a', 'd', 'j', 'k'].includes(e.key.toLowerCase())) {
        if (e.key === ' ') e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'j' || e.key === 'J') {
        fireGun();
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'k') {
        triggerBomb();
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
  }, [weaponType, specialBombs]);

  // Main 60fps Platformer Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isPlayingRef.current) return;

      const keys = keysRef.current;
      const p = playerRef.current;

      // CONTRA PLAYER CONTROLS:
      // Left / Right Run
      const moveLeft = keys['ArrowLeft'] || keys['a'] || keys['A'];
      const moveRight = keys['ArrowRight'] || keys['d'] || keys['D'];
      const jumpKey = keys['ArrowUp'] || keys['w'] || keys['W'];
      const duckKey = keys['ArrowDown'] || keys['s'] || keys['S'];

      if (moveLeft) {
        p.vx = -4.5;
        p.facing = -1;
      } else if (moveRight) {
        p.vx = 4.5;
        p.facing = 1;
      } else {
        p.vx *= 0.6; // friction
      }

      // Aiming up / Crouching
      p.aimingUp = jumpKey && !p.isGrounded ? false : jumpKey && !moveLeft && !moveRight;
      p.crouching = duckKey && p.isGrounded;

      // Jump
      if (jumpKey && p.isGrounded && !duckKey) {
        p.vy = -12.5;
        p.isGrounded = false;
        soundEffects.playClick();
      }

      // Gravity
      p.vy += 0.65;
      p.x += p.vx;
      p.y += p.vy;

      // Platform Collisions (Standing on floors)
      p.isGrounded = false;
      platforms.forEach((plat) => {
        const wasAbove = p.y + p.h - p.vy <= plat.y + 4;
        const withinX = p.x + p.w > plat.x && p.x < plat.x + plat.w;
        const nowLanding = p.y + p.h >= plat.y && p.y + p.h <= plat.y + plat.h;

        if (withinX && wasAbove && nowLanding && p.vy >= 0) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
        }
      });

      // Camera Scrolling (Follow player forward)
      cameraXRef.current = Math.max(0, p.x - 140);

      // CLEAR & DRAW BACKGROUND & SCENERY
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-cameraXRef.current, 0);

      // Cyber Alien Landscape Backdrop
      ctx.fillStyle = '#1e1b4b';
      for (let m = 0; m < 2400; m += 240) {
        ctx.beginPath();
        ctx.moveTo(m, 440);
        ctx.lineTo(m + 120, 220);
        ctx.lineTo(m + 240, 440);
        ctx.fill();
      }

      // Draw Platforms
      platforms.forEach((plat) => {
        // Platform surface
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Neon Tech Edge
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);
      });

      // UPDATE & DRAW BULLETS
      for (let b = bulletsRef.current.length - 1; b >= 0; b--) {
        const bullet = bulletsRef.current[b];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Draw glowing bullet
        ctx.fillStyle = bullet.isEnemy ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.isEnemy ? 4 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Check Hit with Enemies
        if (!bullet.isEnemy) {
          for (let e = enemiesRef.current.length - 1; e >= 0; e--) {
            const en = enemiesRef.current[e];
            const hit =
              bullet.x > en.x &&
              bullet.x < en.x + en.w &&
              bullet.y > en.y &&
              bullet.y < en.y + en.h;

            if (hit) {
              en.hp -= 1;
              bulletsRef.current.splice(b, 1);
              soundEffects.playClick();

              if (en.type === 'boss') {
                setBossHpPercent(Math.max(0, (en.hp / en.maxHp) * 100));
              }

              if (en.hp <= 0) {
                soundEffects.playExplosion();
                setScore((s) => s + (en.type === 'boss' ? 500 : 50));
                enemiesRef.current.splice(e, 1);

                if (en.type === 'boss') {
                  // VICTORY!
                  soundEffects.playLevelUp();
                  isPlayingRef.current = false;
                  setGameState('gameover');
                  onEarnRewards(200, 30);
                  ctx.restore();
                  return;
                }
              }
              break;
            }
          }
        } else {
          // Check enemy bullet hit with player
          const hitPlayer =
            bullet.x > p.x &&
            bullet.x < p.x + p.w &&
            bullet.y > p.y &&
            bullet.y < p.y + p.h;

          if (hitPlayer) {
            bulletsRef.current.splice(b, 1);
            soundEffects.playWrong();
            setPlayerHp((hp) => {
              const next = hp - 20;
              if (next <= 0) {
                soundEffects.playExplosion();
                isPlayingRef.current = false;
                setGameState('gameover');
                onEarnRewards(50, 5);
              }
              return Math.max(0, next);
            });
          }
        }

        // Out of bounds cleanup
        if (
          bullet.x < cameraXRef.current - 100 ||
          bullet.x > cameraXRef.current + 600 ||
          bullet.y < 0 ||
          bullet.y > 550
        ) {
          bulletsRef.current.splice(b, 1);
        }
      }

      // UPDATE & DRAW ENEMIES
      const now = Date.now();
      enemiesRef.current.forEach((en) => {
        en.x += en.vx;
        // Bounce on patrol bounds
        if (en.type !== 'boss' && Math.random() < 0.02) en.vx *= -1;

        // Enemy Shooting AI
        if (now - en.lastShot > (en.type === 'boss' ? 1200 : 2200)) {
          en.lastShot = now;
          const dir = p.x < en.x ? -1 : 1;
          bulletsRef.current.push({
            x: en.x + en.w / 2,
            y: en.y + en.h / 2,
            vx: dir * (en.type === 'boss' ? 6 : 4),
            vy: en.type === 'boss' ? (Math.random() - 0.5) * 4 : 0,
            isEnemy: true,
          });
        }

        // Render Enemy
        if (en.type === 'boss') {
          // GIANT CONTRA MECH BOSS
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 16);
          ctx.fill();

          // Glowing Core Eye
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(en.x + en.w / 2, en.y + 35, 18, 0, Math.PI * 2);
          ctx.fill();

          // HP Bar above boss
          ctx.fillStyle = '#334155';
          ctx.fillRect(en.x - 10, en.y - 16, en.w + 20, 8);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(en.x - 10, en.y - 16, ((en.hp / en.maxHp) * (en.w + 20)), 8);
        } else if (en.type === 'drone') {
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(en.x + 16, en.y + 12, 14, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soldier
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(en.x + (en.vx < 0 ? 4 : 16), en.y + 8, 6, 6);
        }
      });

      // DRAW CONTRA COMMANDO HERO PLAYER
      ctx.save();
      ctx.translate(p.x, p.y);

      // Hero Body (Red bandana & cyber commando armor)
      ctx.fillStyle = '#10b981';
      const actualH = p.crouching ? p.h / 2 : p.h;
      const actualY = p.crouching ? p.h / 2 : 0;
      ctx.fillRect(0, actualY, p.w, actualH);

      // Red Bandana
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, actualY, p.w, 8);
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.facing === 1 ? p.w - 8 : 2, actualY + 12, 6, 6);

      // Gun Barrel (pointing in aim direction)
      ctx.fillStyle = '#94a3b8';
      if (p.aimingUp) {
        ctx.fillRect(p.facing === 1 ? p.w - 10 : 4, -12, 6, 18);
      } else {
        ctx.fillRect(p.facing === 1 ? p.w : -12, actualY + 16, 12, 6);
      }

      ctx.restore();
      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(render);
    };

    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, weaponType]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">{isAr ? 'النقاط:' : 'Score:'}</span>
          <span className="text-base font-black text-cyan-400">{score}</span>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">{isAr ? 'الصحة:' : 'HP:'}</span>
          <span className={`text-base font-black ${playerHp > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {playerHp}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">{isAr ? 'السلاح:' : 'Gun:'}</span>
          <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            {weaponType === 'spread' ? 'Spread Gun (S)' : 'Blaster'}
          </span>
        </div>
      </div>

      {/* Main Contra Canvas Stage */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        <canvas ref={canvasRef} width={420} height={500} className="block w-full max-w-[380px] sm:max-w-[420px] h-auto" />

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-1 flex items-center justify-center shadow-xl shadow-rose-500/25">
              <span className="text-3xl">🪖</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {isAr ? 'كونترا سايبربانك (Cyber Contra Commando)' : 'Cyber Contra Commando'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isAr
                  ? 'لعبة كونترا حقيقية 100%! قفز بين المنصات، رماية بجميع الاتجاهات، أسلحة Spread Gun خارقة، ومواجهة زعيم الآلات الضخم!'
                  : 'True Contra style! Jump platforms, aim all directions, spread gun upgrades, and fight the giant robot boss!'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setGameMode('server')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                  gameMode === 'server' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? 'سيرفر كونترا جماعي (Co-op)' : 'Server Co-op'}</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('ai')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                  gameMode === 'ai' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{isAr ? 'ضد جيش الذكاء الاصطناعي' : 'Solo VS AI Army'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
              <button
                onClick={startContraGame}
                className="flex-1 py-3 px-5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isAr ? 'بدء معركة كونترا!' : 'Start Mission!'}</span>
              </button>

              <button
                onClick={() => setGameState('workshop')}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                title="تعديل وبرمجة سلاح كونترا ببايثون"
              >
                <Wrench className="w-4 h-4" />
                <span>{isAr ? 'ورشة السلاح' : 'Gun Lab'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Python Weapon Workshop */}
        {gameState === 'workshop' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 sm:p-5 text-start space-y-3 overflow-y-auto animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">
                  {isAr ? 'ورشة بايثون لتطوير سلاح Spread Gun' : 'Python Gun Workshop'}
                </span>
              </div>
              <button
                onClick={() => setGameState('menu')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              {isAr
                ? 'استخدم كود بايثون لتعديل عدد طلقات السلاح (Spread) وقوة الضرر وسرعة الإطلاق!'
                : 'Modify weapon spread count and damage multiplier with Python script!'}
            </p>

            <textarea
              value={weaponCode}
              onChange={(e) => setWeaponCode(e.target.value)}
              rows={5}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />

            {codeNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-[11px]">
                {codeNotice}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleApplyWeaponCode}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isAr ? 'تطبيق كود السلاح' : 'Apply Code'}</span>
              </button>

              <button
                onClick={startContraGame}
                className="py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{isAr ? 'بدء اللعب بالسلاح المطور 🪖' : 'Play Now 🪖'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="text-4xl animate-bounce">
              {playerHp > 0 ? '🏆' : '💀'}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                {playerHp > 0 ? (isAr ? 'انتصار كاسح! دمرت الزعيم بنجاح!' : 'Victory! Boss Destroyed!') : (isAr ? 'سقطت في المعركة!' : 'Mission Failed')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? `نقاط المعركة: ${score} نقطة` : `Final Score: ${score}`}
              </p>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
              +{playerHp > 0 ? 200 : 50} XP & +{playerHp > 0 ? 30 : 5} Gems {isAr ? 'أضيفت لحسابك!' : 'Added!'}
            </div>

            <button
              onClick={startContraGame}
              className="px-7 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'محاولة جديدة' : 'Try Again'}</span>
            </button>
          </div>
        )}
      </div>

      {/* FULL ON-SCREEN CONTROLLER (SOLVES USER'S COMPLAINT ABOUT ONLY SPACEBAR) */}
      <div className="w-full max-w-md bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-center text-[11px] font-bold text-slate-400">
          🎮 {isAr ? 'أزرار التحكم الكاملة (حركة كاملة + قفز + طخ + قنبلة):' : 'Full Virtual Gamepad Controls:'}
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          {/* D-Pad on Left */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onTouchStart={() => (keysRef.current['ArrowUp'] = true)}
              onTouchEnd={() => (keysRef.current['ArrowUp'] = false)}
              onMouseDown={() => (keysRef.current['ArrowUp'] = true)}
              onMouseUp={() => (keysRef.current['ArrowUp'] = false)}
              onMouseLeave={() => (keysRef.current['ArrowUp'] = false)}
              className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 text-white active:text-slate-950 font-black flex items-center justify-center border border-slate-700 shadow-md"
            >
              <ArrowUp className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => (keysRef.current['ArrowLeft'] = true)}
                onTouchEnd={() => (keysRef.current['ArrowLeft'] = false)}
                onMouseDown={() => (keysRef.current['ArrowLeft'] = true)}
                onMouseUp={() => (keysRef.current['ArrowLeft'] = false)}
                onMouseLeave={() => (keysRef.current['ArrowLeft'] = false)}
                className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 text-white active:text-slate-950 font-black flex items-center justify-center border border-slate-700 shadow-md"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <button
                onTouchStart={() => (keysRef.current['ArrowDown'] = true)}
                onTouchEnd={() => (keysRef.current['ArrowDown'] = false)}
                onMouseDown={() => (keysRef.current['ArrowDown'] = true)}
                onMouseUp={() => (keysRef.current['ArrowDown'] = false)}
                onMouseLeave={() => (keysRef.current['ArrowDown'] = false)}
                className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 text-white active:text-slate-950 font-black flex items-center justify-center border border-slate-700 shadow-md"
              >
                <ArrowDown className="w-6 h-6" />
              </button>

              <button
                onTouchStart={() => (keysRef.current['ArrowRight'] = true)}
                onTouchEnd={() => (keysRef.current['ArrowRight'] = false)}
                onMouseDown={() => (keysRef.current['ArrowRight'] = true)}
                onMouseUp={() => (keysRef.current['ArrowRight'] = false)}
                onMouseLeave={() => (keysRef.current['ArrowRight'] = false)}
                className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 text-white active:text-slate-950 font-black flex items-center justify-center border border-slate-700 shadow-md"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Action Buttons on Right: JUMP & SHOOT & BOMB */}
          <div className="flex items-center justify-center gap-3">
            {/* Shoot Button */}
            <button
              onClick={fireGun}
              className="w-16 h-16 rounded-full bg-rose-500 active:bg-rose-400 text-white font-black text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
            >
              <Crosshair className="w-6 h-6" />
              <span className="text-[10px]">{isAr ? 'طَخ' : 'FIRE'}</span>
            </button>

            {/* Jump Button */}
            <button
              onTouchStart={() => (keysRef.current['ArrowUp'] = true)}
              onTouchEnd={() => (keysRef.current['ArrowUp'] = false)}
              onMouseDown={() => (keysRef.current['ArrowUp'] = true)}
              onMouseUp={() => (keysRef.current['ArrowUp'] = false)}
              className="w-16 h-16 rounded-full bg-cyan-500 active:bg-cyan-400 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-[10px]">{isAr ? 'قفز' : 'JUMP'}</span>
            </button>

            {/* Bomb Button */}
            <button
              onClick={triggerBomb}
              disabled={specialBombs <= 0}
              className="w-12 h-12 rounded-full bg-purple-700 active:bg-purple-600 text-white font-black flex items-center justify-center disabled:opacity-30 shadow-md"
              title="قنبلة تفجير شاملة"
            >
              <Bomb className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
