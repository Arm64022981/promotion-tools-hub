"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileText, CheckCircle, GitCompare, Trash2, Download, 
  Upload, ArrowLeft, Table as TableIcon, Settings2, AlertTriangle, Search, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// --- TYPES ---
interface DiffLine {
    lineNum: number;
    file1Content: string;
    file2Content: string;
}

interface CompareResult {
    maxLines: number;
    diffCount: number;
    diffLines: DiffLine[];
    isTruncated: boolean;
}

interface FileState {
    file: File | null;
    content: any[][]; 
    headers: string[];
    isExcel: boolean;
}

const INITIAL_FILE_STATE: FileState = { file: null, content: [], headers: [], isExcel: false };
const MAX_DISPLAY_DIFFS = 1000;

export default function ComparatorPage() {
    const [fileA, setFileA] = useState<FileState>(INITIAL_FILE_STATE);
    const [fileB, setFileB] = useState<FileState>(INITIAL_FILE_STATE);
    const [selectedColA, setSelectedColA] = useState<string>('');
    const [selectedColB, setSelectedColB] = useState<string>('');
    const [result, setResult] = useState<CompareResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('Ready to compare');

    // --- NEW SETTINGS STATE ---
    const [settings, setSettings] = useState({
        caseSensitive: false,
        trimWhitespace: true,
        ignoreEmptyRows: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    const isReady = useMemo(() => fileA.file !== null && fileB.file !== null, [fileA.file, fileB.file]);

    // --- FILTERED RESULTS ---
    const filteredDiffs = useMemo(() => {
        if (!result) return [];
        if (!searchTerm) return result.diffLines;
        return result.diffLines.filter(d => 
            d.file1Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.file2Content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [result, searchTerm]);

    const handleCompare = async () => {
        if (!isReady) return;
        setIsProcessing(true);
        setStatus('Processing...');

        setTimeout(() => {
            const dataA = fileA.content;
            const dataB = fileB.content;
            const maxLines = Math.max(dataA.length, dataB.length);
            
            const idxA = fileA.isExcel && selectedColA ? fileA.headers.indexOf(selectedColA) : -1;
            const idxB = fileB.isExcel && selectedColB ? fileB.headers.indexOf(selectedColB) : -1;

            const allDiffs: DiffLine[] = [];
            let count = 0;

            for (let i = 0; i < maxLines; i++) {
                let valA = i < dataA.length ? (idxA !== -1 ? String(dataA[i][idxA] ?? "") : dataA[i].join("|")) : "[Missing]";
                let valB = i < dataB.length ? (idxB !== -1 ? String(dataB[i][idxB] ?? "") : dataB[i].join("|")) : "[Missing]";

                let compareA = valA;
                let compareB = valB;

                // Apply Logic Settings
                if (settings.trimWhitespace) {
                    compareA = compareA.trim();
                    compareB = compareB.trim();
                }
                if (!settings.caseSensitive) {
                    compareA = compareA.toLowerCase();
                    compareB = compareB.toLowerCase();
                }

                if (compareA !== compareB) {
                    count++;
                    if (allDiffs.length < MAX_DISPLAY_DIFFS) {
                        allDiffs.push({ lineNum: i + 1, file1Content: valA, file2Content: valB });
                    }
                }
            }

            setResult({ maxLines, diffCount: count, diffLines: allDiffs, isTruncated: count > MAX_DISPLAY_DIFFS });
            setStatus(count === 0 ? 'Perfect Match' : `Found ${count.toLocaleString()} differences`);
            setIsProcessing(false);
        }, 100);
    };

    const exportDifferences = () => {
        if (!result) return;
        const ws = XLSX.utils.json_to_sheet(result.diffLines);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Differences");
        XLSX.writeFile(wb, "comparison_report.xlsx");
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, side: 'A' | 'B') => {
        const file = event.target.files?.[0];
        if (!file) return;
        const isExcel = /\.(xlsx|xls|csv)$/.test(file.name);
        const reader = new FileReader();
        setStatus(`Loading ${file.name}...`);
        
        reader.onload = (e) => {
            let content: any[][] = [];
            let headers: string[] = [];
            if (isExcel) {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                content = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                headers = (content[0] || []).map(h => String(h));
            } else {
                content = (e.target?.result as string).split(/\r?\n/).map(line => [line]);
            }
            const state = { file, content, headers, isExcel };
            if (side === 'A') setFileA(state); else setFileB(state);
            setResult(null);
            setStatus('File loaded');
        };
        if (isExcel) reader.readAsArrayBuffer(file); else reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <header className="bg-slate-900 py-8 px-6 text-white shadow-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                        <ArrowLeft size={20} /> <span className="font-bold">Back</span>
                    </Link>
                    <h1 className="text-2xl font-black tracking-tighter uppercase">Data <span className="text-amber-400">Validator Pro</span></h1>
                    <div className="flex gap-4">
                         <Settings2 size={20} className="text-slate-500" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 -mt-8">
                {/* Configuration Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* File Inputs */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[fileA, fileB].map((f, i) => (
                                <div key={i} className={`p-4 rounded-2xl border-2 border-dashed transition-all ${f.file ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-white shadow-sm rounded-lg">
                                            {f.isExcel ? <TableIcon size={20} className="text-amber-600" /> : <FileText size={20} />}
                                        </div>
                                        <input type="file" id={`f-${i}`} className="hidden" onChange={(e) => handleFileChange(e, i === 0 ? 'A' : 'B')} />
                                        <button onClick={() => document.getElementById(`f-${i}`)?.click()} className="text-[10px] font-black uppercase bg-slate-800 text-white px-3 py-1.5 rounded-md">
                                            {f.file ? 'Change' : 'Upload'}
                                        </button>
                                    </div>
                                    <p className="text-sm font-bold truncate mb-2">{f.file ? f.file.name : `Select File ${i === 0 ? 'A' : 'B'}`}</p>
                                    {f.isExcel && (
                                        <select 
                                            className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 ring-amber-400 outline-none"
                                            onChange={(e) => i === 0 ? setSelectedColA(e.target.value) : setSelectedColB(e.target.value)}
                                        >
                                            <option value="">Full Row Comparison</option>
                                            {f.headers.map((h, idx) => <option key={idx} value={h}>{h}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Advanced Settings */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Settings2 size={14} /> Compare Settings
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={settings.trimWhitespace} onChange={e => setSettings({...settings, trimWhitespace: e.target.checked})} className="w-4 h-4 accent-amber-500" />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Auto-Trim Spaces</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={settings.caseSensitive} onChange={e => setSettings({...settings, caseSensitive: e.target.checked})} className="w-4 h-4 accent-amber-500" />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Case Sensitive</span>
                                </label>
                                <button 
                                    onClick={handleCompare} 
                                    disabled={!isReady || isProcessing}
                                    className="w-full mt-4 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 text-slate-900 font-black rounded-xl transition-all shadow-lg shadow-amber-100"
                                >
                                    {isProcessing ? 'COMPUTING...' : 'RUN ANALYTICS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results UI */}
                {result && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search in differences..." 
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none ring-2 ring-transparent focus:ring-amber-400 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={exportDifferences} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 border border-emerald-100 transition-all">
                                    <Download size={16} /> Export Report
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                             {/* ... Header ตารางเหมือนเดิมแต่เปลี่ยนสีให้ดู Pro ขึ้น ... */}
                             <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">DISCREPANCY LOG</h2>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Found {result.diffCount} issues across {result.maxLines} rows</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full font-black text-sm ${result.diffCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {result.diffCount === 0 ? 'STATUS: SECURE' : 'STATUS: ACTION REQUIRED'}
                                </div>
                             </div>

                             <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4 w-24">Row</th>
                                            <th className="px-6 py-4">Source A</th>
                                            <th className="px-6 py-4">Source B</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredDiffs.map((diff, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-300 group-hover:text-amber-500">#{diff.lineNum}</td>
                                                <td className="px-6 py-4">
                                                    <div className="bg-red-50/50 text-red-700 p-2 rounded-lg border border-red-100/50 text-xs font-mono break-all line-clamp-2 hover:line-clamp-none transition-all">
                                                        {diff.file1Content}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="bg-slate-50 text-slate-700 p-2 rounded-lg border border-slate-200 text-xs font-mono break-all line-clamp-2 hover:line-clamp-none transition-all">
                                                        {diff.file2Content}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredDiffs.length === 0 && (
                                    <div className="py-20 text-center text-slate-400 font-bold italic">No matching differences found.</div>
                                )}
                             </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}