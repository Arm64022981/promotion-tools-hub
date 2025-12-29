"use client";

import { Calculator, FileText, GitCompare, ArrowRight, Award, Shuffle, Hash } from 'lucide-react';
import React from 'react';

// --- TYPE DEFINITIONS ---
type ToolCardProps = {
  title: string;
  titleThai: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
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
    title: 'Phone & SQL Formatter',
    titleThai: 'เครื่องมือจัดรูปแบบเบอร์โทรศัพท์และ SQL',
    description: 'ปรับแต่งรูปแบบเบอร์โทรศัพท์ (ใส่ 66, ใส่ 0) และแปลงเป็นรูปแบบ SQL IN Clause สำหรับการ Query ข้อมูลอย่างรวดเร็วและแม่นยำ',
    href: '/phonenumberreformatter',
    icon: Hash,
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
    blue: 'border-slate-200 hover:border-slate-400 hover:shadow-slate-200',
    emerald: 'border-slate-200 hover:border-slate-400 hover:shadow-slate-200',
    amber: 'border-slate-200 hover:border-slate-400 hover:shadow-slate-200',
    purple: 'border-slate-200 hover:border-slate-400 hover:shadow-slate-200'
  };

  const iconColors = {
    blue: 'bg-slate-700',
    emerald: 'bg-slate-700',
    amber: 'bg-slate-700',
    purple: 'bg-slate-700'
  };

  const handleClick = () => {
    window.location.href = href;
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 ${colors[color]} bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}>
      {/* Icon */}
      <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${iconColors[color]} shadow-md transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="text-white" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="mb-1 text-xl font-bold text-gray-800">
          {title}
        </h3>
        <p className="mb-3 text-sm font-medium text-gray-500">
          {titleThai}
        </p>
        <p className="text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
        <span>Enter Tool</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  return (
    <div className="relative">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-gray-800">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-800 to-slate-700 py-16 px-6 text-center shadow-xl">
          {/* Badge */}
          <div className="inline-block rounded-full border-2 border-gray-300 bg-white/20 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm mb-4">
            <Award className="mr-1 inline h-4 w-4" />
            Professional Suite
          </div>

          {/* Main Title */}
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Promotion Tools Hub @ Billone
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-light text-gray-200">
            ศูนย์รวมเครื่องมือสำหรับการจัดการข้อมูลโปรโมชันและระบบคัดกรองข้อมูล
          </p>

          {/* Decorative Line */}
          <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-white/40"></div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Tools Section */}
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              Available Tools
            </h2>
            <p className="text-gray-600">
              เลือกเครื่องมือที่คุณต้องการใช้งานเพื่อเพิ่มประสิทธิภาพการจัดการข้อมูล
            </p>
          </div>

          {/* Grid Layout - ปรับให้รองรับ 5 เมนูอย่างสวยงาม */}
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 py-12 text-center text-white">
          <div className="relative mb-6 flex justify-center gap-8 text-6xl font-black tracking-widest opacity-20">
            <span className="animate-pulse">OCS</span>
            <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>SQL</span>
          </div>

          <div className="relative space-y-2 text-sm text-gray-300">
            <p className="font-semibold">
              © {new Date().getFullYear()} Promotion Tools Hub
            </p>
            <p className="text-xs">
              ARM@MOS BILLONE<br />
              INTERNAL ANALYTICS SYSTEMS
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}