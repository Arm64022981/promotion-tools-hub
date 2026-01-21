"use client";

import React, { useState, useMemo } from 'react';
import { 
  Copy, Database, ArrowLeft, 
  Settings2, Hash, AlignLeft, AlignCenter, Terminal, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function SQLPhoneProPage() {
    const [inputData, setInputData] = useState<string>('');
    const [prefixMode, setPrefixMode] = useState<'66' | '0' | 'none'>('66');
    const [formatType, setFormatType] = useState<'normal' | 'sql'>('sql');
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
            return formatType === 'sql' ? `${quoteType}${result}${quoteType}` : result;
        });
    }, [inputData, prefixMode, formatType, quoteType]);

    const finalResult = useMemo(() => {
        if (processedList.length === 0) return '';
        
        if (layout === 'horizontal') {
            return processedList.join(formatType === 'sql' ? ', ' : ' ');
        } else {
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
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Copied to clipboard',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
            {/* --- HEADER (Consistent with other pages) --- */}
            <div className="bg-slate-800 py-14 px-6 relative shadow-xl overflow-hidden">
                {/* Back to Hub */}
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
                        <Terminal size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Data Integrity <span className="text-blue-400 font-light">Suite</span>
                    </h1>
                    <p className="opacity-70 mt-3 text-white font-light max-w-lg mx-auto">
                        SQL Phone Pro: เครื่องมือจัดการรูปแบบเบอร์โทรศัพท์สำหรับ SQL Query และ Data List
                    </p>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Input */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-4 h-4 text-blue-600" /> Source Data
                            </h3>
                            <button 
                                onClick={() => setInputData('')} 
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-tighter"
                            >
                                Clear Input
                            </button>
                        </div>
                        <textarea 
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                            placeholder="วางรายการเบอร์โทรศัพท์ที่นี่ (คั่นด้วยเว้นวรรค, บรรทัด หรือ Comma)..."
                            className="w-full h-[650px] p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed"
                        />
                    </div>

                    {/* Right Side: Configuration & Output */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 space-y-8">
                                
                                {/* 1. Format Mode Selection */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Output Mode</h4>
                                    <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                                        <button onClick={() => setFormatType('normal')} 
                                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${formatType === 'normal' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                                            <FileText className="w-4 h-4" /> Normal List
                                        </button>
                                        <button onClick={() => setFormatType('sql')} 
                                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${formatType === 'sql' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                                            <Database className="w-4 h-4" /> SQL Format
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* 2. Numerical Prefix */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Numerical Prefix</label>
                                        <div className="flex bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
                                            {['66', '0', 'none'].map((m) => (
                                                <button key={m} onClick={() => setPrefixMode(m as any)}
                                                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${prefixMode === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                    {m === 'none' ? 'None' : m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Layout Selection */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Layout Direction</label>
                                        <div className="flex bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
                                            <button onClick={() => setLayout('horizontal')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${layout === 'horizontal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                <AlignCenter className="w-3 h-3" /> Horizontal
                                            </button>
                                            <button onClick={() => setLayout('vertical')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${layout === 'vertical' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                <AlignLeft className="w-3 h-3" /> Vertical
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. SQL Quotes (Show only in SQL mode) */}
                                {formatType === 'sql' && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase block mb-3 tracking-widest">SQL Encapsulation</label>
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

                                <div className="w-full h-[250px] overflow-y-auto p-8 bg-slate-900 rounded-[1.5rem] font-mono text-sm text-blue-300 border border-slate-800 shadow-inner">
                                    {processedList.length > 0 ? (
                                        <pre className="whitespace-pre-wrap break-all">{finalResult}</pre>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-600 italic text-xs">Awaiting input stream...</div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleCopy}
                                    disabled={processedList.length === 0}
                                    className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                                >
                                    <Copy className="w-5 h-5" /> Copy Prepared Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center opacity-30">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Internal Data Management System • Billone Analytics</p>
            </footer>
        </div>
    );
}