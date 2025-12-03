"use client";

import React, { useState } from 'react';
import { User, Lock, LogIn, Award, AlertTriangle, X } from 'lucide-react';
// import { useRouter } from 'next/navigation'; // แก้ไข: ลบ import ที่ทำให้เกิดข้อผิดพลาด

// Main Login Page Component
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'info', text: string } | null>(null);
  
  // const router = useRouter(); // แก้ไข: ลบการ Initialize useRouter

  // กำหนดค่าชื่อผู้ใช้และรหัสผ่านที่ถูกต้อง
  const CORRECT_USERNAME = 'billoneteam';
  const CORRECT_PASSWORD = 'billone12341';

  // Handle form submission (Mock Authentication)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(`Login attempt with Username: ${username}`);

    // ตรวจสอบความถูกต้องของชื่อผู้ใช้และรหัสผ่าน
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        setMessage({
            type: 'info',
            text: 'เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทาง...',
        });
        
        // แก้ไข: เปลี่ยนมาใช้ window.location.href สำหรับการเปลี่ยนเส้นทาง
        setTimeout(() => {
            window.location.href = '/mainocs'; 
        }, 500); // หน่วงเวลา 0.5 วินาที ก่อนเปลี่ยนหน้า

    } else {
        setMessage({
            type: 'error',
            text: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
        });

        // ตั้งเวลาซ่อนข้อความแจ้งเตือนสำหรับกรณีผิดพลาด (3 วินาที)
        setTimeout(() => setMessage(null), 3000); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200 flex flex-col items-center justify-center p-4">

      {/* Header Section */}
      <header className="w-full max-w-md mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 rounded border-2 border-amber-600 shadow-xl mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-serif font-bold text-white uppercase tracking-wider">Authentication Required</span>
        </div>

        <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2 tracking-wide">
          ยินดีต้อนรับกลับ
        </h1>

        <p className="text-lg text-slate-600 font-serif italic">
          เข้าสู่ระบบเพื่อใช้งาน Promotion Tools Hub
        </p>
      </header>

      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl border-4 border-slate-300 shadow-2xl transition-all duration-300 hover:border-amber-500 hover:shadow-amber-200/50">
        
        {/* Message Box */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg font-serif flex items-start justify-between 
            ${message.type === 'error' 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3" />
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            {/* Close button */}
            <button onClick={() => setMessage(null)} className="ml-4 p-1 text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-serif font-medium text-slate-700 mb-2">
              <User className="inline w-4 h-4 mr-2 text-slate-500" />
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200 text-lg font-serif text-slate-800"
                placeholder="ป้อนชื่อผู้ใช้งานของคุณ"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-serif font-medium text-slate-700 mb-2">
              <Lock className="inline w-4 h-4 mr-2 text-slate-500" />
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200 text-lg font-serif text-slate-800"
                placeholder="ป้อนรหัสผ่านของคุณ"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-lg font-serif font-bold rounded-lg shadow-lg text-white bg-slate-800 hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 transform hover:scale-[1.01]"
          >
            <LogIn className="w-6 h-6" />
            เข้าสู่ระบบ (Sign In)
          </button>
        </form>

        {/* Footer Link/Info */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs font-serif text-slate-500">
            สำหรับพนักงาน Billone ที่ได้รับอนุญาตเท่านั้น
          </p>
          <a href="/" className="text-sm font-serif font-medium text-amber-600 hover:text-amber-700 transition-colors mt-1 block">
            <span className="underline">BilloneTeam</span>
          </a>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="mt-10">
        <p className="text-sm font-serif text-slate-600 font-bold">Promotion Tools Hub @ Billone</p>
      </footer>
    </div>
  );
}