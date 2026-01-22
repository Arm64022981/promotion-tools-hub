"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  RotateCcw, DollarSign, TrendingUp, ArrowLeft, 
  Calculator, Info, Calendar, Percent
} from 'lucide-react';

export default function ProrateCalculatorPage() {
    // States สำหรับ Unit Prorate
    const [totalUnit, setTotalUnit] = useState('');
    const [totalDays, setTotalDays] = useState('31');
    const [currentDay, setCurrentDay] = useState('1');
    const [prorateOutput, setProrateOutput] = useState('0.00');
    const [finalCalculationDisplay, setFinalCalculationDisplay] = useState('N/A');
    const [hasCalculated, setHasCalculated] = useState(false);

    // States สำหรับ Price Prorate
    const [priceBase, setPriceBase] = useState('');
    const [priceTotalDays, setPriceTotalDays] = useState('31');
    const [priceStartDay, setPriceStartDay] = useState('1'); 
    const [priceOutput, setPriceOutput] = useState('0.00');
    const [priceStepDisplay, setPriceStepDisplay] = useState('N/A');
    const [hasCalculatedPrice, setHasCalculatedPrice] = useState(false);

    interface ProrateResult {
        daysRemaining: number;
        result: number;
    }

    const calculateProrate = (value: number, total: number, start: number): ProrateResult => {
        const daysRemaining = total - start + 1;
        const result = (value / total) * daysRemaining;
        return { daysRemaining, result };
    };

    const handleCalculateUnit = () => {
        const unit = parseFloat(totalUnit) || 0;
        const days = parseInt(totalDays) || 0;
        const current = parseInt(currentDay) || 0;
        if (unit <= 0 || days <= 0 || current <= 0 || current > days) {
            return;
        }
        const { daysRemaining, result } = calculateProrate(unit, days, current);
        setFinalCalculationDisplay(`${unit.toLocaleString()} × (${daysRemaining}/${days})`);
        setProrateOutput(result.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
        setHasCalculated(true);
    };

    const handleCalculatePrice = () => {
        const price = parseFloat(priceBase) || 0;
        const total = parseInt(priceTotalDays) || 0;
        const start = parseInt(priceStartDay) || 0;
        if (price <= 0 || total <= 0 || start <= 0 || start > total) {
            return;
        }
        const { daysRemaining, result } = calculateProrate(price, total, start);
        setPriceStepDisplay(`${price.toLocaleString()} × (${daysRemaining}/${total})`);
        setPriceOutput(result.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setHasCalculatedPrice(true);
    };

    const handleResetAll = () => {
        setTotalUnit(''); setTotalDays('31'); setCurrentDay('1'); setHasCalculated(false);
        setPriceBase(''); setPriceTotalDays('31'); setPriceStartDay('1'); setHasCalculatedPrice(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
            {/* --- HEADER --- */}
            <div className="bg-slate-800 py-14 px-6 relative shadow-xl overflow-hidden">
                <div className="absolute top-8 left-8">
                    <Link 
                        href="/mainocs" 
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-all text-white">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Back to Hub</span>
                    </Link>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
                        <Calculator size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Billing Prorate <span className="text-blue-400 font-light">Calculator</span>
                    </h1>
                    <p className="opacity-70 mt-3 text-white font-light max-w-lg mx-auto">
                        คำนวณสัดส่วนเฉลี่ย (Prorate) ของ Unit และ Price ตามมาตรฐานระบบ Billing
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1200px] mx-auto px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Unit Prorate Section */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                    <TrendingUp size={20} />
                                </div>
                                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Unit Prorate</h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white border rounded-lg uppercase">Capacity Based</span>
                        </div>

                        <div className="p-8 space-y-6 flex-grow">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Free Unit ทั้งหมด</label>
                                    <input 
                                        type="number" 
                                        value={totalUnit} 
                                        onChange={(e)=>setTotalUnit(e.target.value)} 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                        placeholder="0.00" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">วันในรอบบิล</label>
                                    <input 
                                        type="number" 
                                        value={totalDays} 
                                        onChange={(e)=>setTotalDays(e.target.value)} 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">วันที่เริ่มใช้งาน (ลำดับวันที่ในรอบ)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={currentDay} 
                                        onChange={(e)=>setCurrentDay(e.target.value)} 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                        placeholder="1" 
                                    />
                                    <Calendar className="absolute right-4 top-4 text-slate-300" size={20} />
                                </div>
                            </div>

                            <button 
                                onClick={handleCalculateUnit} 
                                className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                <Percent size={18} /> คำนวณ Unit
                            </button>

                            {hasCalculated && (
                                <div className="p-6 bg-slate-900 rounded-[1.5rem] text-center text-white animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl border-t-4 border-blue-500">
                                    <p className="text-[10px] font-black opacity-50 mb-1 uppercase tracking-[0.2em]">Prorated Output</p>
                                    <div className="text-4xl font-black mb-2 text-blue-400">{prorateOutput}</div>
                                    <div className="text-[9px] font-mono bg-white/10 py-1.5 px-4 rounded-full inline-block text-white/70 uppercase tracking-wider">
                                        Logic: {finalCalculationDisplay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Price Prorate Section */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                    <DollarSign size={20} />
                                </div>
                                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Price Prorate</h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white border rounded-lg uppercase">Revenue Based</span>
                        </div>

                        <div className="p-8 space-y-6 flex-grow">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ราคาเต็มรายเดือน (บาท)</label>
                                <input 
                                    type="number" 
                                    value={priceBase} 
                                    onChange={(e)=>setPriceBase(e.target.value)} 
                                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                    placeholder="0.00" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">วันในรอบบิล</label>
                                    <input 
                                        type="number" 
                                        value={priceTotalDays} 
                                        onChange={(e)=>setPriceTotalDays(e.target.value)} 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">วันที่เริ่มใช้งาน</label>
                                    <input 
                                        type="number" 
                                        value={priceStartDay} 
                                        onChange={(e)=>setPriceStartDay(e.target.value)} 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono font-bold text-xl shadow-inner" 
                                        placeholder="1" 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleCalculatePrice} 
                                className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                <DollarSign size={18} /> คำนวณราคา
                            </button>

                            {hasCalculatedPrice && (
                                <div className="p-6 bg-slate-900 rounded-[1.5rem] text-center text-white animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl border-t-4 border-emerald-500">
                                    <p className="text-[10px] font-black opacity-50 mb-1 uppercase tracking-[0.2em]">Final Charge (Excl. VAT)</p>
                                    <div className="text-4xl font-black mb-2 text-emerald-400">฿{priceOutput}</div>
                                    <div className="text-[9px] font-mono bg-white/10 py-1.5 px-4 rounded-full inline-block text-white/70 uppercase tracking-wider">
                                        Logic: {priceStepDisplay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col items-center mt-12 space-y-6">
                    <button 
                        onClick={handleResetAll} 
                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm"
                    >
                        <RotateCcw size={14} /> Reset All Data
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Info size={16} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                <span className="text-slate-900">สูตรการคำนวณ:</span> (Value ÷ Total Days) × Days Remaining โดยที่ Days Remaining = (Total Days - Start Day + 1)
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Info size={16} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                <span className="text-slate-900">หมายเหตุ:</span> การคำนวณนี้เป็นแบบเบื้องต้นตามมาตรฐานสัดส่วนวัน ผลลัพธ์จริงอาจต่างกันเล็กน้อยตามเงื่อนไขเฉพาะของแต่ละแพ็กเกจ
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="py-12 text-center opacity-30">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Internal Engineering Unit • Billone Professional Suite</p>
            </footer>
        </div>
    );
}