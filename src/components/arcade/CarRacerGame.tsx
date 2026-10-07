import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Zap, Trophy, Shield, Flame, ArrowLeft, ArrowRight, Wrench, Users, Bot, Terminal, CheckCircle2, ChevronRight, Gauge } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface CarRacerGameProps {
  isAr: boolean;
  onEarnRewards: (xp: number, gems: number) => void;
}

interface RivalCar {
  id: string;
  name: string;
  x: number;
  y: number;
  speed: number;
  color: string;
  lane: number;
  isAI: boolean;
}

interface RoadObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'traffic' | 'barrier' | 'gem' | 'nitro';
  color: string;
}

export const CarRacerGame: React.FC<CarRacerGameProps> = ({ isAr, onEarnRewards }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'garage' | 'racing' | 'gameover'>('menu');
  const [gameMode, setGameMode] = useState<'server' | 'ai'>('server');
  const [score, setScore] = useState(0);
  const [lapProgress, setLapProgress] = useState(0);
  const [racePosition, setRacePosition] = useState(4); // 1st to 4th
  const [speedKmh, setSpeedKmh] = useState(0);
  const [nitroFuel, setNitroFuel] = useState(100);
  const [isNitroOn, setIsNitroOn] = useState(false);
  const [activeSteerDir, setActiveSteerDir] = useState<'left' | 'right' | null>(null);

  // Car tuning specs modified through Python code in the garage
  const [carSpecs, setCarSpecs] = useState({
    maxSpeed: 240,
    acceleration: 1.2,
    handling: 7.5,
    nitroPower: 1.6,
    color: '#10b981',
    codeFixed: false,
  });

  // Garage Python Code editing state
  const [garageCode, setGarageCode] = useState(
`# 🏎️ Python Engine Tuning Script
# قم بإصلاح الكود لزيادة السرعة إلى 320 كم/س وتفعيل التيربو!
car.max_speed = 320
car.turbo_boost = True
car.handling = 9.5
car.drift_system = "active"`
  );
  const [codeSuccessMessage, setCodeSuccessMessage] = useState<string | null>(null);

  // Game internal animation refs
  const playerRef = useRef({
    x: 200,
    y: 440,
    width: 48,
    height: 78,
    vx: 0,
    speed: 0,
  });

  const rivalsRef = useRef<RivalCar[]>([
    { id: '1', name: '🤖 AI_CyberRacer', x: 100, y: 150, speed: 205, color: '#ef4444', lane: 0, isAI: true },
    { id: '2', name: '⚡ Sarah_Dev (Server)', x: 200, y: 80, speed: 215, color: '#3b82f6', lane: 1, isAI: false },
    { id: '3', name: '🔥 Omar_Coder (Server)', x: 300, y: 220, speed: 195, color: '#f59e0b', lane: 2, isAI: false },
  ]);

  const obstaclesRef = useRef<RoadObstacle[]>([]);
  const isPlayingRef = useRef(false);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const roadYOffset = useRef(0);

  // Apply Python tuning
  const handleApplyCodeTuning = () => {
    soundEffects.playCash();
    const has320 = garageCode.includes('320');
    const hasTurbo = garageCode.toLowerCase().includes('true');
    const hasHandling = garageCode.includes('9.5') || garageCode.includes('10');

    if (has320 && hasTurbo) {
      setCarSpecs({
        maxSpeed: 320,
        acceleration: 1.8,
        handling: 9.5,
        nitroPower: 2.2,
        color: '#06b6d4',
        codeFixed: true,
      });
      setCodeSuccessMessage(isAr ? 'تم تطبيق كود بايثون بنجاح! السرعة الآن 320 كم/ساعة والتيربو مفعل! 🔥' : 'Python script tuned! Top speed 320 km/h with Hyper Turbo!');
      soundEffects.playLevelUp();
    } else {
      setCodeSuccessMessage(isAr ? 'تم تحديث الإعدادات! يمكنك تجربة السباق الآن.' : 'Settings updated! Ready to race.');
    }
  };

  const startRace = () => {
    soundEffects.playNitro();
    playerRef.current.x = 200;
    playerRef.current.speed = 40;
    distanceRef.current = 0;
    setLapProgress(0);
    setScore(0);
    setNitroFuel(100);
    setIsNitroOn(false);
    obstaclesRef.current = [];

    // Reset rivals positions
    rivalsRef.current = [
      { id: '1', name: gameMode === 'server' ? '🌐 Alex_UK (Ping 32ms)' : '🤖 Alpha_AI', x: 90, y: 150, speed: 205, color: '#ef4444', lane: 0, isAI: gameMode === 'ai' },
      { id: '2', name: gameMode === 'server' ? '🌐 Sarah_UAE (Server)' : '🤖 CyberBot_V2', x: 190, y: 60, speed: 220, color: '#3b82f6', lane: 1, isAI: gameMode === 'ai' },
      { id: '3', name: gameMode === 'server' ? '🌐 Tariq_KSA (Server)' : '🤖 NeuralDrift_AI', x: 290, y: 220, speed: 195, color: '#f59e0b', lane: 2, isAI: gameMode === 'ai' },
    ];

    isPlayingRef.current = true;
    setGameState('racing');
  };

  // Keyboard controls with focus capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
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
  }, []);

  // Main 60fps Racing Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = Date.now();

    const render = () => {
      if (!isPlayingRef.current) return;

      const keys = keysRef.current;
      const p = playerRef.current;

      // STEERING: Smooth continuous steering (touch buttons or keyboard A/D or Left/Right)
      const steerLeft = keys['ArrowLeft'] || keys['a'] || keys['A'] || activeSteerDir === 'left';
      const steerRight = keys['ArrowRight'] || keys['d'] || keys['D'] || activeSteerDir === 'right';
      const isAccelerating = keys['ArrowUp'] || keys['w'] || keys['W'] || true; // auto-accelerate for arcade ease
      const isNitroPressed = keys[' '] || keys['Shift'];

      if (steerLeft) {
        p.x = Math.max(55, p.x - carSpecs.handling);
      }
      if (steerRight) {
        p.x = Math.min(canvas.width - p.width - 55, p.x + carSpecs.handling);
      }

      // NITRO HANDLING
      let currentMaxSpeed = carSpecs.maxSpeed;
      if (isNitroPressed && nitroFuel > 5) {
        setIsNitroOn(true);
        currentMaxSpeed *= carSpecs.nitroPower;
        setNitroFuel((prev) => Math.max(0, prev - 0.7));
      } else {
        setIsNitroOn(false);
        setNitroFuel((prev) => Math.min(100, prev + 0.15));
      }

      // Acceleration towards top speed
      if (p.speed < currentMaxSpeed) {
        p.speed += carSpecs.acceleration * 1.5;
      } else if (p.speed > currentMaxSpeed) {
        p.speed -= 1.2;
      }

      setSpeedKmh(Math.round(p.speed));
      distanceRef.current += p.speed * 0.05;
      const progressPercent = Math.min(100, (distanceRef.current / 3500) * 100);
      setLapProgress(progressPercent);

      // Finish Race
      if (progressPercent >= 100) {
        soundEffects.playLevelUp();
        isPlayingRef.current = false;
        setGameState('gameover');
        onEarnRewards(racePosition === 1 ? 150 : 80, racePosition === 1 ? 25 : 10);
        return;
      }

      // Road scroll animation
      const scrollSpeed = p.speed * 0.08;
      roadYOffset.current = (roadYOffset.current + scrollSpeed) % 60;

      // CLEAR & DRAW HIGHWAY
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road Asphalt with glowing neon barriers
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(45, 0, 310, canvas.height);

      // Glowing Neon Rails
      ctx.fillStyle = isNitroOn ? '#06b6d4' : '#10b981';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = isNitroOn ? 15 : 6;
      ctx.fillRect(40, 0, 6, canvas.height);
      ctx.fillRect(354, 0, 6, canvas.height);
      ctx.shadowBlur = 0;

      // Road Lane Dashed Dividers
      ctx.fillStyle = '#334155';
      for (let y = -60 + roadYOffset.current; y < canvas.height; y += 60) {
        ctx.fillRect(145, y, 4, 32);
        ctx.fillRect(250, y, 4, 32);
      }

      // SPAWN COLLECTIBLES & ROAD HAZARDS
      const now = Date.now();
      if (now - lastSpawn > 1400) {
        lastSpawn = now;
        const laneX = [85, 185, 285][Math.floor(Math.random() * 3)];
        const isGem = Math.random() < 0.35;
        obstaclesRef.current.push({
          x: laneX,
          y: -60,
          width: isGem ? 26 : 48,
          height: isGem ? 26 : 28,
          type: isGem ? 'gem' : 'barrier',
          color: isGem ? '#22d3ee' : '#f97316',
        });
      }

      // UPDATE & DRAW OBSTACLES
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.y += scrollSpeed * 0.85;

        if (obs.type === 'gem') {
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(obs.x + 13, obs.y + 13, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 6, obs.y + 6, 8, obs.height - 12);
          ctx.fillRect(obs.x + 28, obs.y + 6, 8, obs.height - 12);
        }

        // Collision Check
        const pad = 6;
        const collides =
          p.x + pad < obs.x + obs.width - pad &&
          p.x + p.width - pad > obs.x + pad &&
          p.y + pad < obs.y + obs.height - pad &&
          p.y + p.height - pad > obs.y + pad;

        if (collides) {
          if (obs.type === 'gem') {
            soundEffects.playGem();
            setScore((s) => s + 50);
            obstaclesRef.current.splice(i, 1);
          } else {
            soundEffects.playExplosion();
            p.speed = Math.max(60, p.speed * 0.5); // slows down car
            obstaclesRef.current.splice(i, 1);
          }
          continue;
        }

        if (obs.y > canvas.height + 50) obstaclesRef.current.splice(i, 1);
      }

      // UPDATE & DRAW RIVAL RACERS
      let carsAhead = 0;
      rivalsRef.current.forEach((rival, idx) => {
        // Relative vertical movement based on speed difference
        const relSpeed = (p.speed - rival.speed) * 0.08;
        rival.y += relSpeed;

        // Rival steering behavior (avoids road edges)
        if (rival.x < 70) rival.x += 1;
        if (rival.x > 280) rival.x -= 1;

        if (rival.y < p.y) {
          carsAhead++;
        }

        // Draw Rival Car
        ctx.fillStyle = rival.color;
        ctx.beginPath();
        ctx.roundRect(rival.x, rival.y, 44, 74, 8);
        ctx.fill();

        // Rival Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rival.x + 6, rival.y + 18, 32, 14);

        // Rival Name Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(rival.name.split(' ')[0], rival.x - 4, rival.y - 6);
      });

      setRacePosition(carsAhead + 1);

      // DRAW PLAYER CAR
      // Nitro exhaust flame
      if (isNitroOn) {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(p.x + 10, p.y + p.height);
        ctx.lineTo(p.x + 16, p.y + p.height + 25 + Math.random() * 15);
        ctx.lineTo(p.x + 22, p.y + p.height);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p.x + p.width - 22, p.y + p.height);
        ctx.lineTo(p.x + p.width - 16, p.y + p.height + 25 + Math.random() * 15);
        ctx.lineTo(p.x + p.width - 10, p.y + p.height);
        ctx.fill();
      }

      // Car Body
      ctx.fillStyle = carSpecs.color;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 10);
      ctx.fill();

      // Front Carbon Splitter
      ctx.fillStyle = '#047857';
      ctx.fillRect(p.x + 4, p.y, p.width - 8, 8);

      // Windshield & Cockpit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x + 6, p.y + 20, p.width - 12, 20);

      // Headlight Beams
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.moveTo(p.x + 6, p.y);
      ctx.lineTo(p.x - 30, p.y - 120);
      ctx.lineTo(p.x + 30, p.y - 120);
      ctx.lineTo(p.x + 14, p.y);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(p.x + p.width - 14, p.y);
      ctx.lineTo(p.x + p.width - 30, p.y - 120);
      ctx.lineTo(p.x + p.width + 30, p.y - 120);
      ctx.lineTo(p.x + p.width - 6, p.y);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#020617';
      ctx.fillRect(p.x - 3, p.y + 12, 4, 16);
      ctx.fillRect(p.x + p.width - 1, p.y + 12, 4, 16);
      ctx.fillRect(p.x - 3, p.y + p.height - 24, 4, 16);
      ctx.fillRect(p.x + p.width - 1, p.y + p.height - 24, 4, 16);

      gameLoopRef.current = requestAnimationFrame(render);
    };

    if (gameState === 'racing') {
      gameLoopRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, carSpecs, activeSteerDir, isNitroOn]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4">
      {/* Top Race Leaderboard Bar */}
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">{isAr ? 'المركز:' : 'Position:'}</span>
          <span className={`text-base font-black px-2 py-0.5 rounded-lg ${
            racePosition === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
          }`}>
            #{racePosition} / 4
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">{isAr ? 'السرعة:' : 'Speed:'}</span>
          <span className="text-base font-black text-cyan-400">{speedKmh} km/h</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">{isAr ? 'المسافة:' : 'Lap:'}</span>
          <span className="font-bold text-emerald-400">{Math.round(lapProgress)}%</span>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        <canvas ref={canvasRef} width={400} height={540} className="block w-full max-w-[380px] sm:max-w-[400px] h-auto" />

        {/* Menu Screen with Mode Selection (Server Rooms vs AI) */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <span className="text-3xl">🏎️</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {isAr ? 'جراند بري بايثون (Python Grand Prix)' : 'Python Grand Prix'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isAr
                  ? 'سباق سيارات حقيقي ضد أشخاص على السيرفر أو ضد روبوتات الذكاء الاصطناعي مع إمكانية تعديل وبرمجة محرك السيارة!'
                  : 'Multiplayer server race & AI bots with customizable Python engine tuning!'}
              </p>
            </div>

            {/* Mode Toggle: Server vs AI */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setGameMode('server')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                  gameMode === 'server' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? 'سيرفر أونلاين (منافسين حقيقيين)' : 'Online Server'}</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('ai')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                  gameMode === 'ai' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{isAr ? 'منافسة الذكاء الاصطناعي (AI)' : 'AI Bots'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
              <button
                onClick={startRace}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isAr ? 'دخول السباق الآن!' : 'Start Race!'}</span>
              </button>

              <button
                onClick={() => setGameState('garage')}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                title="تعديل وبرمجة محرك السيارة بكود بايثون"
              >
                <Wrench className="w-4 h-4" />
                <span>{isAr ? 'كراج بايثون' : 'Code Garage'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Python Garage Screen (Learning & Tuning) */}
        {gameState === 'garage' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 sm:p-5 text-start space-y-3 overflow-y-auto animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">
                  {isAr ? 'كراج بايثون لتركيب وتعديل قطع السيارة' : 'Python Car Modding Garage'}
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
                ? 'عدل قيم كود بايثون أدناه لتغيير مواصفات سيارتك الرياضية وزيادة سرعتها وتفعيل التيربو لتفوز على منافسيك في السيرفر!'
                : 'Modify the Python code variables to boost car torque, top speed, and turbo before racing!'}
            </p>

            <div className="space-y-1">
              <label className="font-bold text-emerald-400 font-mono text-[11px]">engine_tuning.py</label>
              <textarea
                value={garageCode}
                onChange={(e) => setGarageCode(e.target.value)}
                rows={5}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {codeSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-[11px]">
                {codeSuccessMessage}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleApplyCodeTuning}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isAr ? 'تشغيل الكود وتعديل المحرك' : 'Execute & Tune Engine'}</span>
              </button>

              <button
                onClick={startRace}
                className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <span>{isAr ? 'انطلاق للسباق 🏎️' : 'Race Now 🏎️'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="text-4xl animate-bounce">
              {racePosition === 1 ? '🏆' : '🏁'}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                {racePosition === 1 ? (isAr ? 'المركز الأول! أنت بطل السباق!' : 'Victory! 1st Place Champion!') : (isAr ? `أنهيت السباق في المركز #${racePosition}` : `Finished at #${racePosition}`)}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? `نقاط النتيجة: ${score} نقطة مع منافسي السيرفر` : `Final Score: ${score} points against rivals`}
              </p>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
              +{racePosition === 1 ? 150 : 80} XP & +{racePosition === 1 ? 25 : 10} Gems {isAr ? 'أضيفت لحسابك!' : 'Added to PyQuest!'}
            </div>

            <button
              onClick={startRace}
              className="px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'سباق جديد' : 'Race Again'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ULTRA-INTUITIVE STEERING CONTROLS (SOLVES USER'S COMPLAINT) */}
      <div className="w-full max-w-md bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-center text-[11px] font-bold text-slate-400">
          🎮 {isAr ? 'لوحة القيادة المباشرة (استخدم الأزرار أدناه أو لوحة المفاتيح):' : 'Active Steering & Throttle Controls:'}
        </div>

        {/* Giant Left / Right Steering Buttons & Nitro */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Steer Left */}
          <button
            onTouchStart={() => setActiveSteerDir('left')}
            onTouchEnd={() => setActiveSteerDir(null)}
            onMouseDown={() => setActiveSteerDir('left')}
            onMouseUp={() => setActiveSteerDir(null)}
            onMouseLeave={() => setActiveSteerDir(null)}
            className={`py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all ${
              activeSteerDir === 'left'
                ? 'bg-emerald-400 text-slate-950 scale-95 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-[11px] font-mono">{isAr ? 'انعطاف يسار' : 'TURN LEFT'}</span>
          </button>

          {/* Nitro Turbo Booster */}
          <button
            onTouchStart={() => (keysRef.current[' '] = true)}
            onTouchEnd={() => (keysRef.current[' '] = false)}
            onMouseDown={() => (keysRef.current[' '] = true)}
            onMouseUp={() => (keysRef.current[' '] = false)}
            onMouseLeave={() => (keysRef.current[' '] = false)}
            className={`py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all ${
              isNitroOn
                ? 'bg-cyan-400 text-slate-950 scale-95 shadow-lg shadow-cyan-500/30'
                : 'bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 hover:brightness-110 shadow-md'
            }`}
          >
            <Flame className="w-6 h-6" />
            <span className="text-[11px] font-mono">NITRO ({Math.round(nitroFuel)}%)</span>
          </button>

          {/* Steer Right */}
          <button
            onTouchStart={() => setActiveSteerDir('right')}
            onTouchEnd={() => setActiveSteerDir(null)}
            onMouseDown={() => setActiveSteerDir('right')}
            onMouseUp={() => setActiveSteerDir(null)}
            onMouseLeave={() => setActiveSteerDir(null)}
            className={`py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all ${
              activeSteerDir === 'right'
                ? 'bg-emerald-400 text-slate-950 scale-95 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            <ArrowRight className="w-6 h-6" />
            <span className="text-[11px] font-mono">{isAr ? 'انعطاف يمين' : 'TURN RIGHT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
