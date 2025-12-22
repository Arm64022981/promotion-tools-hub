import { Calculator, FileText, GitCompare, ArrowRight, Award, Shuffle } from 'lucide-react';
import React from 'react';

// --- TYPE DEFINITIONS ---
type ToolCardProps = {
  title: string;
  titleThai: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: 'blue' | 'emerald' | 'amber' | 'purple'; // เพิ่ม purple
};

// --- DATA FOR TOOL CARDS ---
const tools: ToolCardProps[] = [
  {
    title: 'Promotion Data Extractor',
    titleThai: 'โปรแกรมสกัดข้อมูลโปรโมชัน',
    description: 'เครื่องมืออัตโนมัติสำหรับประมวลผลข้อมูลโปรโมชันดิบจากทีมการตลาด และจัดรูปแบบให้พร้อมใช้งานในรูปแบบตารางที่เป็นระเบียบ',
    href: '/extractor',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Prorate Calculator',
    titleThai: 'เครื่องมือคำนวณ Prorate',
    description: 'คำนวณอัตราส่วนค่าบริการหรือ Free Unit ที่เหมาะสมตามจำนวนวันที่เหลืออยู่ในรอบบิล พร้อมแสดงขั้นตอนการคำนวณอย่างละเอียด',
    href: '/prorate',
    icon: Calculator,
    color: 'emerald'
  },
  {
    title: 'File Comparator',
    titleThai: 'เครื่องมือเปรียบเทียบไฟล์',
    description: 'เปรียบเทียบความแตกต่างระหว่างข้อมูลโปรโมชันสองชุดแบบทีละบรรทัด เพื่อหาจุดที่เปลี่ยนแปลงไปอย่างรวดเร็วและแม่นยำ',
    href: '/comparator',
    icon: GitCompare,
    color: 'amber'
  },
  {
    title: 'Data Mapper',
    titleThai: 'เครื่องมือจับคู่ข้อมูล (Mapping)',
    description: 'อัปโหลดไฟล์ต้นทางและไฟล์อ้างอิง เพื่อดึงข้อมูลจากไฟล์หนึ่งไปเติมลงในอีกไฟล์หนึ่งโดยอัตโนมัติผ่าน Key ที่กำหนด (VLOOKUP Automation)',
    href: '/mappingdata',
    icon: Shuffle,
    color: 'purple'
  },
];

// --- COMPONENT: ToolCard ---
const ToolCard = ({ title, titleThai, description, href, icon: Icon, color }: ToolCardProps) => {
  const colors = {
    blue: 'border-blue-300 hover:border-blue-600 hover:shadow-blue-200',
    emerald: 'border-emerald-300 hover:border-emerald-600 hover:shadow-emerald-200',
    amber: 'border-amber-300 hover:border-amber-600 hover:shadow-amber-200',
    purple: 'border-purple-300 hover:border-purple-600 hover:shadow-purple-200'
  };

  const iconColors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    purple: 'bg-purple-600'
  };

  return (
    <a
      href={href}
      className={`group block p-8 bg-white rounded-lg border-3 ${colors[color]} shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Icon */}
      <div className="mb-6">
        <div className={`inline-flex p-4 rounded-lg ${iconColors[color]} shadow-md`}>
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-sm font-serif font-medium text-slate-600 mb-4 italic">
        {titleThai}
      </p>
      <p className="text-slate-700 leading-relaxed mb-6 font-serif h-20 overflow-hidden">
        {description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-2 text-slate-800 font-serif font-semibold border-t-2 border-slate-200 pt-4 group-hover:text-slate-900 transition-colors">
        <span>Enter Tool</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </a>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200">

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-amber-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 rounded border-2 border-amber-700 shadow-lg mb-8">
            <Award className="w-5 h-5 text-white" />
            <span className="text-sm font-serif font-bold text-white uppercase tracking-wider">Professional Suite</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-wide">
            Promotion Tools Hub @ Billone
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 font-serif italic max-w-3xl mx-auto leading-relaxed">
            ศูนย์รวมเครื่องมือสำหรับการจัดการข้อมูลโปรโมชัน
            <br />
          </p>

          {/* Decorative Line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-1 w-24 bg-amber-500 rounded"></div>
            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
            <div className="h-1 w-24 bg-amber-500 rounded"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">

        {/* Tools Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
              <div className="w-2 h-8 bg-amber-600 rounded"></div>
              Available Tools
              <div className="w-2 h-8 bg-amber-600 rounded"></div>
            </h2>
            <p className="text-lg font-serif text-slate-600 italic">
              เลือกเครื่องมือที่คุณต้องการใช้งาน
            </p>
          </div>

          {/* Grid Layout - ปรับเป็น 2 คอลัมน์บน Tablet และ 2x2 หรือ 4 บน Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>
        
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-slate-800 to-slate-700 border-t-4 border-amber-600 overflow-hidden">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Giant Animated Tech Icons */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <div className="group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-125 hover:rotate-12 animate-bounce" style={{ animationDuration: '3s' }}>
                <Calculator className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-center mt-3">
                <p className="text-xs font-serif text-blue-300 font-bold">CALC</p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-125 hover:-rotate-12 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.2s' }}>
                <FileText className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-center mt-3">
                <p className="text-xs font-serif text-emerald-300 font-bold">DATA</p>
              </div>
            </div>

            {/* เพิ่มไอคอน Mapping ใน Footer */}
            <div className="group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-125 hover:rotate-12 animate-bounce" style={{ animationDuration: '3.3s', animationDelay: '0.3s' }}>
                <Shuffle className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-center mt-3">
                <p className="text-xs font-serif text-purple-300 font-bold">MAPPER</p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-125 hover:rotate-180 animate-bounce border-4 border-amber-300" style={{ animationDuration: '3s', animationDelay: '0.4s' }}>
                <Award className="w-20 h-20 text-white drop-shadow-2xl" strokeWidth={3} />
              </div>
              <div className="text-center mt-3">
                <p className="text-sm font-serif text-amber-300 font-bold">PRO SUITE</p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-125 hover:rotate-12 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.6s' }}>
                <GitCompare className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-center mt-3">
                <p className="text-xs font-serif text-slate-300 font-bold">COMPARE</p>
              </div>
            </div>
          </div>

          {/* Copyright Badge */}
          <div className="text-center mb-8">
            <div className="inline-block px-10 py-4 bg-slate-900 rounded-xl border-4 border-amber-500 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative">
              <div className="absolute inset-0 bg-amber-500 opacity-20 rounded-xl blur-xl animate-pulse"></div>
              <p className="relative text-base font-serif text-slate-200 font-bold">
                © {new Date().getFullYear()} Promotion Tools Hub
              </p>
              <p className="relative text-sm font-serif text-amber-400 font-bold mt-1">
                ARM@MOS BILLONE
              </p>
              <p className="relative text-xs font-serif text-slate-400 italic mt-2">
                สงวนสิทธิ์ให้ทีม
              </p>
            </div>
          </div>

          {/* Animated Bottom Wave Line */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded animate-pulse"></div>
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="h-1.5 w-32 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="h-1.5 w-32 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}