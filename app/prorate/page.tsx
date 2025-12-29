"use client";

import { useState } from 'react';
import { 
  Calculator, RotateCcw, DollarSign, Award, 
  TrendingUp, Receipt, ArrowLeft 
} from 'lucide-react';

export default function ProrateCalculatorPage() {
    // --- States สำหรับ Unit Prorate ---
    const [totalUnit, setTotalUnit] = useState('');
    const [totalDays, setTotalDays] = useState('31');
    const [currentDay, setCurrentDay] = useState('1');
    const [prorateOutput, setProrateOutput] = useState('0.00');
    const [finalCalculationDisplay, setFinalCalculationDisplay] = useState('N/A');
    const [hasCalculated, setHasCalculated] = useState(false);

    // --- States สำหรับ Price Prorate ---
    const [priceBase, setPriceBase] = useState('');
    const [priceTotalDays, setPriceTotalDays] = useState('31');
    const [priceActiveDays, setPriceActiveDays] = useState('');
    const [priceOutput, setPriceOutput] = useState('0.00');
    const [priceStepDisplay, setPriceStepDisplay] = useState('N/A');
    const [hasCalculatedPrice, setHasCalculatedPrice] = useState(false);

    const handleCalculateUnit = () => {
        const unit = parseFloat(totalUnit) || 0;
        const days = parseInt(totalDays) || 0;
        const current = parseInt(currentDay) || 0;
        if (unit <= 0 || days <= 0 || current <= 0 || current > days) {
            alert('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'); return;
        }
        const daysRemaining = days - current + 1; 
        const ratio = daysRemaining / days;
        const finalAmount = unit * ratio;
        setFinalCalculationDisplay(`${unit.toLocaleString()} × (${daysRemaining}/${days})`);
        setProrateOutput(finalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
        setHasCalculated(true);
    };

    const handleCalculatePrice = () => {
        const price = parseFloat(priceBase) || 0;
        const total = parseInt(priceTotalDays) || 0;
        const active = parseInt(priceActiveDays) || 0;
        if (price <= 0 || total <= 0 || active <= 0 || active > total) {
            alert('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'); return;
        }
        const finalPrice = (price / total) * active;
        setPriceStepDisplay(`(฿${price.toLocaleString()} ÷ ${total} วัน) × ${active} วันที่ใช้จริง`);
        setPriceOutput(finalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setHasCalculatedPrice(true);
    };

    const handleResetAll = () => {
        setTotalUnit(''); setTotalDays('31'); setCurrentDay('1'); setHasCalculated(false);
        setPriceBase(''); setPriceTotalDays('31'); setPriceActiveDays(''); setHasCalculatedPrice(false);
    };

    const backToHub = () => window.location.href = '/';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-gray-800">
            {/* --- HEADER BANNER (Same as Hub) --- */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-800 to-slate-700 py-12 px-6 text-center shadow-xl">
                <button 
                    onClick={backToHub}
                    className="absolute left-4 top-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Hub
                </button>
                
                <div className="inline-block rounded-full border-2 border-gray-300 bg-white/20 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm mb-4">
                    <Award className="mr-1 inline h-4 w-4" />
                    Prorate Calculator
                </div>

                <h1 className="mb-2 text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
                    Billing Prorate Tools
                </h1>
                <p className="text-gray-200 font-light opacity-90">
                    เครื่องมือคำนวณสัดส่วนเฉลี่ยสำหรับงาน Billing Professional
                </p>
                <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white/30"></div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
                
                <div className="grid gap-10 lg:grid-cols-2">
                    
                    {/* SECTION 1: Unit Prorate (Card Style like Hub) */}
                    <section className="group flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-slate-400">
                        <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 shadow-md">
                                    <TrendingUp className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Unit Prorate</h2>
                                    <p className="text-xs font-medium text-gray-500">คำนวณปริมาณโควตาที่ควรได้รับ</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Free Unit ทั้งหมด</label>
                                    <input type="number" value={totalUnit} onChange={(e)=>setTotalUnit(e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">วันในรอบบิล</label>
                                    <input type="number" value={totalDays} onChange={(e)=>setTotalDays(e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่เริ่มใช้งาน (นับวันที่ 1 เป็นวันแรก)</label>
                                <input type="number" value={currentDay} onChange={(e)=>setCurrentDay(e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" />
                            </div>

                            <button onClick={handleCalculateUnit} className="w-full py-4 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                <Calculator size={18} /> คำนวณ Unit
                            </button>

                            {hasCalculated && (
                                <div className="mt-4 p-6 bg-slate-800 rounded-2xl text-center text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">ผลลัพธ์ที่คำนวณได้</p>
                                    <div className="text-4xl font-black text-white mb-2">{prorateOutput}</div>
                                    <div className="text-[10px] font-mono bg-white/10 py-1 px-3 rounded-full inline-block text-slate-300">
                                        Formula: {finalCalculationDisplay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SECTION 2: Price Prorate */}
                    <section className="group flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-slate-400">
                        <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 shadow-md">
                                    <DollarSign className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Price Prorate</h2>
                                    <p className="text-xs font-medium text-gray-500">คำนวณค่าบริการตามวันใช้งานจริง</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ราคาเต็มรายเดือน</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                                    <input type="number" value={priceBase} onChange={(e)=>setPriceBase(e.target.value)} className="w-full p-3 pl-8 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">วันในรอบบิล</label>
                                    <input type="number" value={priceTotalDays} onChange={(e)=>setPriceTotalDays(e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่ใช้จริง</label>
                                    <input type="number" value={priceActiveDays} onChange={(e)=>setPriceActiveDays(e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all font-bold text-lg outline-none" placeholder="เช่น 10" />
                                </div>
                            </div>

                            <button onClick={handleCalculatePrice} className="w-full py-4 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                <Receipt size={18} /> คำนวณราคา
                            </button>

                            {hasCalculatedPrice && (
                                <div className="mt-4 p-6 bg-slate-800 rounded-2xl text-center text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">ราคาที่ต้องจ่ายจริง</p>
                                    <div className="text-4xl font-black text-white mb-2">฿{priceOutput}</div>
                                    <div className="text-[10px] font-mono bg-white/10 py-1 px-3 rounded-full inline-block text-slate-300 italic">
                                        {priceStepDisplay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="flex flex-col items-center gap-4 py-6">
                    <button onClick={handleResetAll} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-semibold text-sm">
                        <RotateCcw size={16} /> Reset All Data
                    </button>
                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Professional Billing Suite V1.2</p>
                </div>
            </main>

            {/* --- FOOTER (Same Style as Hub) --- */}
            <footer className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 py-12 text-center text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute left-0 top-0 h-64 w-64 animate-pulse rounded-full bg-white blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 h-64 w-64 animate-pulse rounded-full bg-white blur-3xl"></div>
                </div>
                <div className="relative mb-4 flex justify-center gap-8 text-4xl font-black tracking-widest opacity-20">
                    <span>PRORATE</span>
                    <span className="animate-pulse">SYSTEM</span>
                </div>
                <div className="relative text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} Promotion Tools Hub @ Billone</p>
                    <p className="text-[10px] opacity-50 mt-1 uppercase">Arm@Mos Management Suite</p>
                </div>
            </footer>
        </div>
    );
}