"use client";

import React, { useState, useMemo } from 'react';
import { 
  Copy, Trash2, Database, Check, ArrowLeft, 
  Settings2, Hash, AlignLeft, AlignCenter, Terminal, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function SQLPhoneProPage() {
    const [inputData, setInputData] = useState<string>('');
    const [prefixMode, setPrefixMode] = useState<'66' | '0' | 'none'>('66');
    const [formatType, setFormatType] = useState<'normal' | 'sql'>('sql'); // เลือกโหมดหลัก
    const [quoteType, setQuoteType] = useState<"'" | '"'>("'");
    const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

    const processedList = useMemo(() => {
        if (!inputData.trim()) return [];
        const rawList = inputData.split(/[\s,"]+/).filter(item => item.trim() !== '');
        
        return rawList.map(num => {
            let cleaned = num.replace(/\D/g, ''); 
            if (cleaned.startsWith('66')) cleaned = cleaned.substring(2);
            else if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

            let prefix = '';
            if (prefixMode === '66') prefix = '66';
            else if (prefixMode === '0') prefix = '0';
            
            const result = prefix + cleaned;
            
            // ถ้าเป็น SQL ให้ใส่ Quote
            return formatType === 'sql' ? `${quoteType}${result}${quoteType}` : result;
        });
    }, [inputData, prefixMode, formatType, quoteType]);

    const finalResult = useMemo(() => {
        if (processedList.length === 0) return '';
        
        if (layout === 'horizontal') {
            // SQL แนวนอนคั่นด้วย ", " | Normal แนวนอนคั่นด้วย " "
            return processedList.join(formatType === 'sql' ? ', ' : ' ');
        } else {
            // SQL แนวตั้งมี Comma ต่อท้าย | Normal แนวตั้งเป็นแค่รายการบรรทัดใหม่
            return processedList.map((item, index) => {
                if (formatType === 'sql') {
                    return index === processedList.length - 1 ? item : `${item},`;
                }
                return item;
            }).join('\n');
        }
    }, [processedList, layout, formatType]);

    const handleCopy = () => {
        if (!finalResult) return;
        navigator.clipboard.writeText(finalResult);
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
        Toast.fire({
            icon: 'success',
            title: 'Copied to clipboard'
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
            {/* Header */}
            <nav className="bg-[#0F172A] text-white shadow-2xl py-4 px-10 sticky top-0 z-50 border-b border-slate-700">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg"><Terminal className="w-5 h-5 text-white" /></div>
                            <h1 className="text-lg font-bold tracking-tight">Data Integrity Suite</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Input */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Hash className="w-4 h-4 text-blue-600" /> Source Data
                            </h3>
                            <button onClick={() => setInputData('')} className="text-[10px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase">Reset</button>
                        </div>
                        <textarea 
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                            placeholder="Paste your numbers here..."
                            className="w-full h-[650px] p-8 rounded-3xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed"
                        />
                    </div>

                    {/* Right Side: Configuration & Output */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 space-y-8">
                                
                                {/* 1. Format Mode Selection */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Output Mode</h4>
                                    <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm overflow-hidden">
                                        <button onClick={() => setFormatType('normal')} 
                                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${formatType === 'normal' ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                                            <FileText className="w-4 h-4" /> Normal List
                                        </button>
                                        <button onClick={() => setFormatType('sql')} 
                                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${formatType === 'sql' ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                                            <Database className="w-4 h-4" /> SQL Format
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* 2. Numerical Prefix */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">Numerical Prefix</label>
                                        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                                            {['66', '0', 'none'].map((m) => (
                                                <button key={m} onClick={() => setPrefixMode(m as any)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${prefixMode === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                    {m === 'none' ? 'None' : m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Layout Selection */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">Layout Direction</label>
                                        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                                            <button onClick={() => setLayout('horizontal')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${layout === 'horizontal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                <AlignCenter className="w-3 h-3" /> Horizontal
                                            </button>
                                            <button onClick={() => setLayout('vertical')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${layout === 'vertical' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                <AlignLeft className="w-3 h-3" /> Vertical
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. SQL Quotes (Show only in SQL mode) */}
                                {formatType === 'sql' && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase block mb-3">SQL Encapsulation</label>
                                        <div className="flex gap-4">
                                            <button onClick={() => setQuoteType("'")} className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${quoteType === "'" ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-300 hover:border-slate-200'}`}>'Single Quotes'</button>
                                            <button onClick={() => setQuoteType('"')} className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${quoteType === '"' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-300 hover:border-slate-200'}`}>"Double Quotes"</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Output Preview */}
                            <div className="p-8 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-slate-400" />
                                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Output Buffer ({processedList.length})</h4>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${formatType === 'sql' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {formatType.toUpperCase()} MODE
                                    </span>
                                </div>

                                <div className="w-full h-[250px] overflow-y-auto p-8 bg-[#0F172A] rounded-2xl font-mono text-sm text-blue-300 border border-slate-800 shadow-inner">
                                    {processedList.length > 0 ? (
                                        <pre className="whitespace-pre-wrap">{finalResult}</pre>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-600 italic text-xs">Awaiting input stream...</div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleCopy}
                                    disabled={processedList.length === 0}
                                    className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-10"
                                >
                                    <Copy className="w-5 h-5" /> Copy Prepared Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center opacity-40">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Enterprise Precision Systems • Internal Use Only</p>
            </footer>
        </div>
    );
}