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
    const [priceStartDay, setPriceStartDay] = useState('1'); // เปลี่ยนจาก Active เป็น Start Day
    const [priceOutput, setPriceOutput] = useState('0.00');
    const [priceStepDisplay, setPriceStepDisplay] = useState('N/A');
    const [hasCalculatedPrice, setHasCalculatedPrice] = useState(false);

    // ฟังก์ชันคำนวณหลัก (Logic เดียวกันทั้ง 2 ฝั่ง)
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
            alert('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'); return;
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
            alert('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'); return;
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
        <div className="min-h-screen bg-slate-50 text-gray-800">
            {/* --- HEADER --- */}
            <div className="bg-slate-800 py-12 px-6 text-center text-white shadow-xl">
                <h1 className="text-3xl font-extrabold">Professional Billing Prorate</h1>
                <p className="opacity-80 mt-2">คำนวณสัดส่วน Unit และ Price ด้วยมาตรฐานเดียวกัน</p>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid gap-10 lg:grid-cols-2">
                    
                    {/* Unit Prorate */}
                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <TrendingUp className="text-slate-600" />
                            <h2 className="text-xl font-bold">Unit Prorate</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Free Unit ทั้งหมด</label>
                                    <input type="number" value={totalUnit} onChange={(e)=>setTotalUnit(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">วันในรอบบิล</label>
                                    <input type="number" value={totalDays} onChange={(e)=>setTotalDays(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">วันที่เริ่มใช้งาน (ลำดับวันที่)</label>
                                <input type="number" value={currentDay} onChange={(e)=>setCurrentDay(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" placeholder="5" />
                            </div>
                            <button onClick={handleCalculateUnit} className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">
                                คำนวณ Unit
                            </button>
                            {hasCalculated && (
                                <div className="p-6 bg-slate-900 rounded-2xl text-center text-white">
                                    <p className="text-xs opacity-60 mb-1">ผลลัพธ์ที่คำนวณได้</p>
                                    <div className="text-4xl font-black mb-2">{prorateOutput}</div>
                                    <div className="text-[10px] font-mono bg-white/10 py-1 px-3 rounded-full inline-block">Formula: {finalCalculationDisplay}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Price Prorate (แก้ไขให้เหมือน Unit ทุกจุด) */}
                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <DollarSign className="text-slate-600" />
                            <h2 className="text-xl font-bold">Price Prorate</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">ราคาเต็มรายเดือน</label>
                                <input type="number" value={priceBase} onChange={(e)=>setPriceBase(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" placeholder="0.00" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">วันในรอบบิล</label>
                                    <input type="number" value={priceTotalDays} onChange={(e)=>setPriceTotalDays(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">วันที่เริ่มใช้งาน</label>
                                    <input type="number" value={priceStartDay} onChange={(e)=>setPriceStartDay(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-400 font-bold text-lg" placeholder="5" />
                                </div>
                            </div>
                            <button onClick={handleCalculatePrice} className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">
                                คำนวณราคา
                            </button>
                            {hasCalculatedPrice && (
                                <div className="p-6 bg-slate-900 rounded-2xl text-center text-white">
                                    <p className="text-xs opacity-60 mb-1">ราคาที่ต้องจ่ายจริง</p>
                                    <div className="text-4xl font-black mb-2">฿{priceOutput}</div>
                                    <div className="text-[10px] font-mono bg-white/10 py-1 px-3 rounded-full inline-block">Formula: {priceStepDisplay}</div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="text-center mt-12">
                    <button onClick={handleResetAll} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-red-500 transition-colors font-bold text-sm">
                        <RotateCcw size={16} /> Reset All Data
                    </button>
                </div>
            </main>
        </div>
    );
}