"use client";

import { useState } from 'react';
import { Calculator, RotateCcw, DollarSign, ListChecks, Award, TrendingUp } from 'lucide-react';

export default function ProrateCalculatorPage() {
    const [totalUnit, setTotalUnit] = useState('');
    const [totalDays, setTotalDays] = useState('31');
    const [currentDay, setCurrentDay] = useState('1');
    
    const [prorateOutput, setProrateOutput] = useState('0.00');
    const [daysRemainingDisplay, setDaysRemainingDisplay] = useState('N/A');
    const [prorateRatioDisplay, setProrateRatioDisplay] = useState('N/A');
    const [finalCalculationDisplay, setFinalCalculationDisplay] = useState('N/A');
    const [hasCalculated, setHasCalculated] = useState(false);

    const handleCalculate = () => {
        const unit = parseFloat(totalUnit) || 0;
        const days = parseInt(totalDays) || 0;
        const current = parseInt(currentDay) || 0;

        if (unit <= 0) {
            alert('กรุณากรอก Free Unit/ค่าบริการที่มากกว่า 0');
            return;
        }

        if (days <= 0) {
            alert('กรุณากรอกจำนวนวันทั้งหมดที่มากกว่า 0');
            return;
        }

        if (current <= 0 || current > days) {
            alert(`วันที่ปัจจุบันต้องอยู่ระหว่าง 1 ถึง ${days}`);
            return;
        }

        const daysRemaining = days - current + 1; 
        const ratio = daysRemaining / days;
        const finalAmount = unit * ratio;
        
        setDaysRemainingDisplay(`${days} - ${current} + 1 = ${daysRemaining} วัน`);
        setProrateRatioDisplay(`${daysRemaining} / ${days} = ${ratio.toFixed(5)}`);
        setFinalCalculationDisplay(`${unit.toLocaleString('th-TH', { maximumFractionDigits: 6 })} × ${ratio.toFixed(5)} = ${finalAmount.toLocaleString('th-TH', { maximumFractionDigits: 6 })}`);
        
        setProrateOutput(finalAmount.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 6 
        }));
        
        setHasCalculated(true);
    };

    const handleReset = () => {
        setTotalUnit('');
        setTotalDays('31');
        setCurrentDay('1');
        setProrateOutput('0.00');
        setDaysRemainingDisplay('N/A');
        setProrateRatioDisplay('N/A');
        setFinalCalculationDisplay('N/A');
        setHasCalculated(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCalculate();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200 p-4 md:p-8">
            {/* Classic Header */}
            <header className="max-w-5xl mx-auto mb-8">
                <div className="text-center py-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg shadow-xl border-b-4 border-amber-600">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500 rounded-full shadow-lg">
                            <Calculator className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wide">
                            Prorate Calculator @ Billone
                        </h1>
                    </div>
                    <p className="text-slate-300 text-lg font-serif italic">
                        Professional Billing Calculation Tool
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                {/* Main Card */}
                <div className="bg-white rounded-b-lg shadow-2xl border-4 border-slate-300">
                    
                    {/* Formula Section */}
                    <div className="p-6 bg-gradient-to-r from-slate-700 to-slate-600 border-b-4 border-amber-500">
                        <div className="flex items-start gap-4">
                            <Award className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-serif font-semibold text-slate-300 mb-2">สูตรการคำนวณ</p>
                                <p className="text-white font-serif font-bold text-lg leading-relaxed">
                                    Free Unit ทั้งหมด × (จำนวนวันที่เหลือ ÷ จำนวนวันทั้งหมด)
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Input Section */}
                    <div className="p-8 bg-gradient-to-b from-slate-50 to-white border-b-2 border-slate-200">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                            
                            {/* Input 1 */}
                            <div className="border-3 border-slate-400 rounded-lg bg-slate-50 hover:border-slate-600 hover:shadow-lg transition-all duration-300">
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-serif font-bold text-sm text-slate-700">ขั้นตอนที่ 1</span>
                                    </div>
                                    <label htmlFor="free-unit-total" className="block text-sm font-serif font-semibold text-slate-800">
                                        Free Unit / ค่าบริการทั้งหมด
                                    </label>
                                    <input 
                                        type="number" 
                                        id="free-unit-total" 
                                        placeholder="1299.00" 
                                        value={totalUnit} 
                                        onChange={(e) => setTotalUnit(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        min="0"
                                        step="any"
                                        className="w-full p-4 border-2 border-slate-300 rounded-lg text-right font-bold text-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none bg-white shadow-inner" 
                                    />
                                    <p className="text-xs font-serif text-slate-600 italic">เช่น: 75161927680 หรือ 1299.00</p>
                                </div>
                            </div>
                            
                            {/* Input 2 */}
                            <div className="border-3 border-slate-400 rounded-lg bg-slate-50 hover:border-slate-600 hover:shadow-lg transition-all duration-300">
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-serif font-bold text-sm text-slate-700">ขั้นตอนที่ 2</span>
                                    </div>
                                    <label htmlFor="days-in-cycle" className="block text-sm font-serif font-semibold text-slate-800">
                                        จำนวนวันทั้งหมดในรอบบิล
                                    </label>
                                    <input 
                                        type="number" 
                                        id="days-in-cycle" 
                                        placeholder="31" 
                                        value={totalDays} 
                                        onChange={(e) => setTotalDays(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        min="1" 
                                        className="w-full p-4 border-2 border-slate-300 rounded-lg text-right font-bold text-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition outline-none bg-white shadow-inner" 
                                    />
                                    <p className="text-xs font-serif text-slate-600 italic">เช่น: 30 หรือ 31 วัน</p>
                                </div>
                            </div>
                            
                            {/* Input 3 */}
                            <div className="border-3 border-slate-400 rounded-lg bg-slate-50 hover:border-slate-600 hover:shadow-lg transition-all duration-300">
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                                            <ListChecks className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-serif font-bold text-sm text-slate-700">ขั้นตอนที่ 3</span>
                                    </div>
                                    <label htmlFor="current-day" className="block text-sm font-serif font-semibold text-slate-800">
                                        วันที่เริ่มใช้งาน
                                    </label>
                                    <input 
                                        type="number" 
                                        id="current-day" 
                                        placeholder="1" 
                                        value={currentDay} 
                                        onChange={(e) => setCurrentDay(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        min="1" 
                                        className="w-full p-4 border-2 border-slate-300 rounded-lg text-right font-bold text-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition outline-none bg-white shadow-inner" 
                                    />
                                    <p className="text-xs font-serif text-slate-600 italic">นับวันที่ 1 เป็นวันแรก</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel */}
                    <div className="p-6 bg-slate-100 border-b-2 border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button 
                                onClick={handleCalculate}
                                className="flex items-center justify-center gap-3 px-8 py-4 font-serif font-bold text-white rounded-lg shadow-lg 
                                           bg-gradient-to-r from-emerald-600 to-emerald-700 border-2 border-emerald-800
                                           hover:from-emerald-700 hover:to-emerald-800
                                           transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <Calculator className="w-5 h-5" />
                                <span className="text-lg">คำนวณ Prorate</span>
                            </button>
                            <button 
                                onClick={handleReset}
                                className="flex items-center justify-center gap-3 px-8 py-4 font-serif font-bold text-slate-800 rounded-lg shadow-lg 
                                           bg-white border-2 border-slate-400
                                           hover:bg-slate-50 hover:border-slate-600
                                           transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <RotateCcw className="w-5 h-5" />
                                <span className="text-lg">ล้างค่า</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Result Section */}
                    {hasCalculated && (
                        <div className="p-8 bg-white">
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-8 shadow-2xl border-4 border-amber-700">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                                <div className="relative text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm mb-2 border-2 border-white/50">
                                        <Award className="w-8 h-8 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="text-white/90 text-lg font-serif font-semibold">ผลลัพธ์สุดท้าย</div>
                                    <div className="text-white font-black text-6xl md:text-7xl tracking-tight drop-shadow-lg">
                                        {prorateOutput}
                                    </div>
                                    <div className="text-white/80 text-sm font-serif font-medium uppercase tracking-wider">Prorated Amount</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Calculation Steps */}
                    {hasCalculated && (
                        <div className="p-8 bg-gradient-to-b from-white to-slate-50 border-t-2 border-slate-200">
                            <div className="mb-6 pb-4 border-b-2 border-slate-300">
                                <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-amber-600 rounded"></div>
                                    ขั้นตอนการคำนวณ
                                </h2>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Step 1 */}
                                <div className="p-6 bg-white rounded-lg border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="text-sm font-serif font-semibold text-blue-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                                        จำนวนวันที่เหลือ
                                    </div>
                                    <div className="font-mono font-bold text-slate-800 text-lg border-l-4 border-blue-600 pl-3">{daysRemainingDisplay}</div>
                                </div>
                                
                                {/* Step 2 */}
                                <div className="p-6 bg-white rounded-lg border-2 border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="text-sm font-serif font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                                        อัตราส่วน (Ratio)
                                    </div>
                                    <div className="font-mono font-bold text-slate-800 text-lg border-l-4 border-indigo-600 pl-3">{prorateRatioDisplay}</div>
                                </div>
                                
                                {/* Step 3 */}
                                <div className="p-6 bg-white rounded-lg border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="text-sm font-serif font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                                        การคำนวณ
                                    </div>
                                    <div className="font-mono font-bold text-slate-800 text-base break-all border-l-4 border-purple-600 pl-3">{finalCalculationDisplay}</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="text-center mt-6 pb-6">
                    <p className="text-slate-600 text-sm font-serif italic">
                        กด Enter เพื่อคำนวณอย่างรวดเร็ว • Professional Calculation Tool
                    </p>
                </div>
            </main>
        </div>
    );
}