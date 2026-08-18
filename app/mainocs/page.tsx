"use client";

import { Calculator, FileText, GitCompare, ArrowUpRight, Shuffle, Hash, Sparkles, CheckSquare, X, Plus, Trash2, Flame, Copy, Check, ExternalLink, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type ToolCardProps = {
  title: string;
  titleThai: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  index: number;
  tag: string;
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  toolHref?: string;
  createdAt: string;
};

const tools: ToolCardProps[] = [
  {
    title: 'Promotion Extractor',
    titleThai: 'สกัดข้อมูลโปรโมชัน',
    description: 'ประมวลผลข้อมูลโปรโมชันดิบจากทีมการตลาด จัดรูปแบบพร้อม config OCS ทันที',
    href: '/extractor',
    icon: FileText,
    index: 1,
    tag: 'EXTRACT'
  },
  {
    title: 'Phone & SQL Formatter',
    titleThai: 'จัดรูปแบบเบอร์และ SQL',
    description: 'ปรับรูปแบบเบอร์โทรศัพท์และแปลงเป็น SQL IN Clause สำหรับ query ข้อมูล',
    href: '/phonenumberreformatter',
    icon: Hash,
    index: 2,
    tag: 'FORMAT'
  },
  {
    title: 'Prorate Calculator',
    titleThai: 'คำนวณ Prorate',
    description: 'คำนวณค่าบริการและ Free Unit ตามจำนวนวันที่เหลือในรอบบิล พร้อมแสดงทุกขั้นตอน',
    href: '/prorate',
    icon: Calculator,
    index: 3,
    tag: 'CALCULATE'
  },
  {
    title: 'File Comparator',
    titleThai: 'เปรียบเทียบไฟล์',
    description: 'เปรียบเทียบข้อมูลสองชุดทีละบรรทัด หาจุดที่เปลี่ยนแปลงได้รวดเร็ว',
    href: '/comparator',
    icon: GitCompare,
    index: 4,
    tag: 'COMPARE'
  },
  {
    title: 'Data Mapper',
    titleThai: 'จับคู่ข้อมูล',
    description: 'VLOOKUP อัตโนมัติ ดึงข้อมูลจากไฟล์หนึ่งไปเติมอีกไฟล์ผ่าน Key ที่กำหนด',
    href: '/mappingdata',
    icon: Shuffle,
    index: 5,
    tag: 'MAP'
  },
  {
    title: 'Relationship Manager',
    titleThai: 'จัดการความสัมพันธ์',
    description: 'Smart Mapping เชื่อมข้อมูลระหว่างไฟล์ ตรวจสอบสถานะและจัดการ 3-Sheets',
    href: '/relationship',
    icon: Shuffle,
    index: 6,
    tag: 'RELATE'
  },
  {
    title: 'Special Number Summary',
    titleThai: 'สรุปหมายเลขพิเศษ',
    description: 'ระบบสรุปหมายเลขพิเศษจากไฟล์ข้อมูลต่างๆ',
    href: '/summaryspecialnumber',
    icon: Sparkles,
    index: 7,
    tag: 'SUMMARY'
  },
  {
    title: 'Mapper Pro',
    titleThai: 'สรุปหมายเลขพิเศษ',
    description: 'เชื่อมข้อมูลระหว่างไฟล์',
    href: '/mapper',
    icon: Sparkles,
    index: 8,
    tag: 'SUMMARY'
  },
];

const QUICK_TEMPLATES = [
  { text: 'Config Promotion OCS ชุดใหม่', priority: 'high', toolHref: '/extractor' },
  { text: 'Formatting เบอร์โทรศัพท์ & SQL', priority: 'medium', toolHref: '/phonenumberreformatter' },
  { text: 'คำนวณ Prorate รอบบิลปัจจุบัน', priority: 'medium', toolHref: '/prorate' },
  { text: 'Compare ไฟล์ข้อมูลรายวัน', priority: 'low', toolHref: '/comparator' },
];

const ToolCard = ({ title, titleThai, description, href, icon: Icon, index, tag }: ToolCardProps) => {
  return (
    <a
      href={href}
      className="tool-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.05] hover:shadow-[0_8px_32px_rgba(52,211,153,0.15)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-[80px] transition-all duration-700 group-hover:bg-emerald-400/40" />

      <span className="absolute bottom-4 right-6 font-mono text-[8rem] font-black leading-none text-white/[0.02] transition-colors duration-500 group-hover:text-emerald-500/[0.05] select-none pointer-events-none">
        {String(index).padStart(2, '0')}
      </span>

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={24} strokeWidth={1.5} />
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-emerald-300 backdrop-blur-md">
            {tag}
          </span>
        </div>

        <h3 className="mb-2 text-2xl font-bold tracking-tight text-white/90 transition-colors group-hover:text-white">
          {title}
        </h3>
        <p className="mb-4 font-mono text-xs font-medium text-emerald-400/70">{titleThai}</p>
        <p className="line-clamp-3 text-sm leading-relaxed text-white/50 transition-colors group-hover:text-white/70">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500/50 transition-colors duration-300 group-hover:text-emerald-400">
          <span className="relative">
            LAUNCH TOOL
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-emerald-400 transition-all duration-500 group-hover:w-full" />
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
          <ArrowUpRight size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
};

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [selectedToolHref, setSelectedToolHref] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [copied, setCopied] = useState(false);

  // Safe SSR/Hydration State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // โหลด LocalStorage เฉพาะเมื่อ Mount บน Client แล้วเท่านั้น (แก้ Hydration Error)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('billone_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default Tasks กรณีเปิดครั้งแรกสุด
    setTasks([
      { id: '1', text: 'Config Promotion OCS ชุดใหม่', completed: false, priority: 'high', toolHref: '/extractor', createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) },
      { id: '2', text: 'Mapping เบอร์โทรศัพท์ลูกค้า VIP', completed: false, priority: 'medium', toolHref: '/phonenumberreformatter', createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) },
      { id: '3', text: 'ตรวจเช็กไฟล์ Prorate รอบบิลนี้', completed: true, priority: 'low', toolHref: '/prorate', createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) },
    ]);
  }, []);

  // บันทึกลง LocalStorage ทุกครั้งที่ tasks มีการเปลี่ยนแปลง
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('billone_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      toolHref: selectedToolHref || undefined,
      createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setSelectedToolHref('');
  };

  const addFromTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: tmpl.text,
      completed: false,
      priority: tmpl.priority as 'high' | 'medium' | 'low',
      toolHref: tmpl.toolHref,
      createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const copySummaryToClipboard = () => {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length === 0) {
      navigator.clipboard.writeText('🎉 ไม่มีงานค้างในระบบ (BILLONE Internal Analytics)');
    } else {
      let text = `📋 รายงานงานค้างประจำวัน (${new Date().toLocaleDateString('th-TH')})\n`;
      text += `-----------------------------------\n`;
      pendingTasks.forEach((t, i) => {
        const pIcon = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
        text += `${i + 1}. ${pIcon} [${t.priority.toUpperCase()}] ${t.text}\n`;
      });
      text += `-----------------------------------\n`;
      text += `รวมคงค้างทั้งหมด: ${pendingTasks.length} รายการ`;
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'pending') return matchesSearch && !task.completed;
    if (filterStatus === 'completed') return matchesSearch && task.completed;
    return matchesSearch;
  });

  // Animated Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let particles: { x: number, y: number, vx: number, vy: number, size: number, alpha: number }[] = [];
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.1 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(draw);
    };
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-emerald-500/30 selection:text-emerald-100 bg-[#050914] font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700;800&family=Outfit:wght@700;800;900&display=swap');

        .font-display { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tool-card {
          opacity: 0;
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-element {
          opacity: 0;
          animation: fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #34d399 0%, #0d9488 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes walk-across {
          0% { left: 100%; transform: translateX(0); }
          100% { left: 0%; transform: translateX(-150px); }
        }
        @keyframes bobbing-fast {
          0%, 100% { bottom: 4px; }
          50% { bottom: 20px; }
        }
        @keyframes bobbing-slow {
          0%, 100% { bottom: 4px; }
          50% { bottom: 14px; }
        }

        .pet-container {
          position: absolute;
          will-change: left;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .pet-container:hover {
          transform: scale(1.2) translateY(-10px) !important;
          cursor: pointer;
        }

        .pet-1 { animation: walk-across 18s linear infinite, bobbing-fast 0.35s ease-in-out infinite; animation-delay: 0s; }
        .pet-2 { animation: walk-across 24s linear infinite, bobbing-slow 0.45s ease-in-out infinite; animation-delay: -4s; }
        .pet-3 { animation: walk-across 15s linear infinite, bobbing-fast 0.3s ease-in-out infinite; animation-delay: -7s; }
        .pet-4 { animation: walk-across 28s linear infinite, bobbing-slow 0.5s ease-in-out infinite; animation-delay: -12s; }
        .pet-5 { animation: walk-across 20s linear infinite, bobbing-fast 0.4s ease-in-out infinite; animation-delay: -16s; }
      `}</style>

      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 opacity-40 mix-blend-screen" />

      <div className="pointer-events-none fixed -left-[20%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-emerald-900/20 blur-[120px]" />
      <div className="pointer-events-none fixed -right-[10%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-teal-900/10 blur-[100px]" />
      <div className="pointer-events-none fixed bottom-0 left-[20%] h-[30vw] w-[60vw] rounded-full bg-emerald-800/10 blur-[150px]" />

      {/* ── FLOATING BUTTON: ทาสงาน DASHBOARD ── */}
      <button
        onClick={() => setIsTaskOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-3 rounded-full border border-emerald-500/30 bg-[#0b1329]/90 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:scale-105 hover:border-emerald-400 hover:bg-[#0f1b3a]"
      >
        <div className="relative flex items-center justify-center">
          <Flame size={20} className="text-amber-400 animate-pulse" />
          {isMounted && activeTasksCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 font-mono text-[10px] font-bold text-white shadow-lg">
              {activeTasksCount}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="font-mono text-xs font-bold text-emerald-400">ทาสงาน DASHBOARD</div>
          <div className="text-[10px] text-white/50">
            {isMounted ? `ค้าง ${activeTasksCount} งาน (${progressPercent}%)` : 'กำลังโหลด...'}
          </div>
        </div>
      </button>

      {/* ── TASKS SLIDE-OVER DRAWER ── */}
      {isTaskOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#090e1d] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Flame className="text-amber-400" size={24} />
                <h2 className="font-display text-xl font-bold text-white">คลังทาสงาน (Tasks)</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copySummaryToClipboard}
                  title="ก๊อปปี้สรุปงานค้างไปแปะใน LINE / Teams"
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'Copy รายงาน'}</span>
                </button>
                <button
                  onClick={() => setIsTaskOpen(false)}
                  className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-white/60">ความคืบหน้าการเคลียร์งาน</span>
                <span className="text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mt-4">
              <div className="font-mono text-[11px] text-white/40 uppercase mb-2">⚡ สร้างงานด่วน (Quick Add)</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => addFromTemplate(tmpl)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
                  >
                    <Plus size={12} />
                    <span>{tmpl.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddTask} className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <input
                type="text"
                placeholder="+ เพิ่มงานค้างใหม่..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
              />
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Priority Selector */}
                <div className="flex gap-1.5">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-mono capitalize transition-colors ${
                        newTaskPriority === p
                          ? p === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : p === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 text-white/40 border border-transparent'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Tool Link Select */}
                <select
                  value={selectedToolHref}
                  onChange={(e) => setSelectedToolHref(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0d152a] px-2.5 py-1 text-[11px] text-white/70 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- ไม่ผูกโมดูล --</option>
                  {tools.map((t) => (
                    <option key={t.href} value={t.href}>{t.title}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-hover hover:bg-emerald-400"
                >
                  <Plus size={16} /> เพิ่ม
                </button>
              </div>
            </form>

            {/* Filter & Search Bar */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
                <input
                  type="text"
                  placeholder="ค้นหางาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="flex gap-1">
                {(['all', 'pending', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono capitalize transition-all ${
                      filterStatus === st
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredTasks.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center text-white/30">
                  <CheckSquare size={32} className="mb-2" />
                  <p className="text-xs">ไม่พบรายการงาน</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                      task.completed
                        ? 'border-white/5 bg-white/[0.01] opacity-40'
                        : 'border-white/10 bg-white/[0.03] hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 overflow-hidden pr-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-xs font-medium ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>
                          {task.text}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/30 font-mono">{task.createdAt}</span>
                          {task.toolHref && (
                            <a
                              href={task.toolHref}
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80 hover:text-emerald-300 hover:underline"
                            >
                              <span>ไปที่โมดูล</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                          task.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-400'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-white/20 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="mt-auto border-t border-white/10 pt-3 flex items-center justify-between font-mono text-xs text-white/40">
              <span>คงเหลือ: {activeTasksCount} งาน</span>
              <span>เสร็จแล้ว: {completedTasksCount} งาน</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* ── HEADER ── */}
        <header className="mb-24 flex flex-col items-center text-center">
          <div className="hero-element mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 backdrop-blur-sm" style={{ animationDelay: '0ms' }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">BILLONE INTERNAL</span>
          </div>

          <h1 className="hero-element font-display mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-[5.5rem]" style={{ animationDelay: '100ms' }}>
            Next-Gen <br className="md:hidden" />
            <span className="text-gradient">OCS Config</span>
          </h1>

          <p className="hero-element max-w-2xl text-lg font-medium text-white/50 sm:text-xl" style={{ animationDelay: '200ms' }}>
            A unified intelligence hub for promotion data management, configuration, and analysis. Designed for speed, precision, and efficiency.
          </p>

          <div className="hero-element mt-16 flex flex-wrap justify-center gap-8 md:gap-16" style={{ animationDelay: '300ms' }}>
            {[
              { val: tools.length, label: 'Active Modules' },
              { val: isMounted ? `${activeTasksCount} งาน` : '...', label: 'งานค้าง (Pending)' },
              { val: 'Arm_MosRTC', label: 'Maintainer' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <span className="font-display text-4xl font-black text-white">{s.val}</span>
                <span className="font-mono text-[11px] font-semibold tracking-widest text-emerald-500/60 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── MODULES GRID ── */}
        <section className="relative">
          <div className="hero-element mb-12 flex items-center justify-between" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-emerald-500"></div>
              <h2 className="font-display text-2xl font-bold text-white">System Modules</h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool, idx) => (
              <div key={tool.href} className={idx === 0 || idx === 3 ? "sm:col-span-2 lg:col-span-2" : "col-span-1"}>
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        </section>

        {/* ── CUTENESS ZONE ── */}
        <div className="hero-element relative mt-32 h-32 w-full overflow-hidden rounded-t-3xl border-t border-emerald-500/10 bg-gradient-to-b from-white/[0.02] to-transparent" style={{ animationDelay: '800ms' }}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

          <div className="pet-container pet-1 text-6xl drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]">🐈‍⬛</div>
          <div className="pet-container pet-2 text-5xl drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">🦖</div>
          <div className="pet-container pet-3 text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">🐕</div>
          <div className="pet-container pet-4 text-5xl drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">🐇</div>
          <div className="pet-container pet-5 text-5xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">🦊</div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="hero-element mt-12 flex flex-col items-center justify-between gap-6 border-t border-emerald-500/10 pt-12 md:flex-row" style={{ animationDelay: '900ms' }}>
          <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-mono text-xs font-semibold tracking-wider text-white/60">ALL SYSTEMS NOMINAL</span>
          </div>

          <p className="font-sans text-sm font-medium text-white/40">
            © {new Date().getFullYear()} ARM@MOS · BILLONE INTERNAL ANALYTICS
          </p>

          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/30 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors">
              <Sparkles size={14} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}