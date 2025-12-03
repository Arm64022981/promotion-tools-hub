"use client";

import React, { useState } from 'react';
import { User, Lock, LogIn, Award, X } from 'lucide-react';
import Swal from 'sweetalert2';

// Main Login Page Component
export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // ข้อมูลรับรองความถูกต้อง
    const CORRECT_USERNAME = 'billoneteam';
    const CORRECT_PASSWORD = 'billone12341';

    // Handle form submission (Mock Authentication)
    const handleSubmit = async (e: React.FormEvent) => { // ใช้ async/await สำหรับ SweetAlert2
        e.preventDefault();

        console.log(`Login attempt with Username: ${username}`);

        // ตรวจสอบความถูกต้องของชื่อผู้ใช้และรหัสผ่าน
        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            await Swal.fire({
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: 'ยินดีต้อนรับกลับ BilloneTeam',
                icon: 'success',
                showConfirmButton: false, 
                timer: 1500, 
                timerProgressBar: true,
                customClass: {
                    container: 'font-serif',
                    popup: 'shadow-2xl',
                }
            });

            window.location.href = '/mainocs';

        } else {
            // แสดง SweetAlert2 สำหรับแจ้งเตือนผิดพลาด
            Swal.fire({
                title: 'เข้าสู่ระบบล้มเหลว',
                text: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'ลองอีกครั้ง',
                confirmButtonColor: '#f59e0b', 
                customClass: {
                    container: 'font-serif',
                    popup: 'shadow-2xl',
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex flex-col items-center justify-center p-4">

            {/* Header Section - ปรับให้ดู Premium ขึ้น */}
            <header className="w-full max-w-md mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 rounded-full border-2 border-amber-500 shadow-2xl shadow-amber-300/50 mb-4 animate-pulse-slow">
                    <Award className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-sans font-extrabold text-white uppercase tracking-widest">
                        Access Required
                    </span>
                </div>

                <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tighter font-sans">
                    Billone Team Login
                </h1>

                <p className="text-lg text-slate-600 font-serif italic">
                    กรุณาเข้าสู่ระบบเพื่อใช้งาน Promotion Tools Hub
                </p>
            </header>

            {/* Login Form Card - เพิ่มความโค้งมนและเงา */}
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-amber-400 hover:shadow-amber-500/50">

                {/* ข้อความแจ้งเตือนถูกย้ายไปใช้ SweetAlert2 แทน */}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-sans font-medium text-slate-700 mb-2">
                            <User className="inline w-4 h-4 mr-2 text-amber-500" />
                            ชื่อผู้ใช้งาน (Username)
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:ring-amber-500/50 transition-colors duration-200 text-lg font-sans text-slate-800 focus:shadow-md"
                                placeholder="ป้อนชื่อผู้ใช้งานของคุณ"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-sans font-medium text-slate-700 mb-2">
                            <Lock className="inline w-4 h-4 mr-2 text-amber-500" />
                            รหัสผ่าน (Password)
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:ring-amber-500/50 transition-colors duration-200 text-lg font-sans text-slate-800 focus:shadow-md"
                                placeholder="ป้อนรหัสผ่านของคุณ"
                            />
                        </div>
                    </div>

                    {/* Login Button - เน้นสีให้โดดเด่นและมี Animation */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 px-4 py-4 border border-transparent text-xl font-sans font-bold rounded-xl shadow-lg text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl"
                    >
                        <LogIn className="w-6 h-6" />
                        เข้าสู่ระบบ (Sign In)
                    </button>
                </form>

                {/* Footer Link/Info */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs font-serif text-slate-500">
                        สำหรับพนักงาน Billone ที่ได้รับอนุญาตเท่านั้น
                    </p>
                    <a href="/" className="text-sm font-sans font-extrabold text-amber-600 hover:text-amber-700 transition-colors mt-1 block">
                        <span>BilloneTeam Portal</span>
                    </a>
                </div>
            </div>

            {/* Footer Branding */}
            <footer className="mt-10">
                <p className="text-sm font-sans text-slate-600 font-bold tracking-wider">
                    © 2025 Promotion Tools Hub
                </p>
            </footer>
        </div>
    );
}