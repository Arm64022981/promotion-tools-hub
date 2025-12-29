"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileText, CheckCircle, GitCompare, Trash2, Download, 
  Upload, AlertTriangle, ArrowLeft, Search, Layers, ChevronRight 
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

// --- CORE LOGIC (คงเดิม) ---
interface DiffLine {
    lineNum: number;
    file1Content: string;
    file2Content: string;
}

interface CompareResult {
    maxLines: number;
    diffCount: number;
    diffLines: DiffLine[];
}

function compareContents(content1: string, content2: string): CompareResult {
    const lines1 = content1.split(/\r?\n/);
    const lines2 = content2.split(/\r?\n/);
    const len1 = lines1.length;
    const len2 = lines2.length;
    const maxLines = Math.max(len1, len2);
    const diffLines: DiffLine[] = [];

    for (let i = 0; i < maxLines; i++) {
        const lineNum = i + 1;
        const line1 = i < len1 ? lines1[i] : "<Missing Line (Document A)>";
        const line2 = i < len2 ? lines2[i] : "<Missing Line (Document B)>";
        if (line1 !== line2) {
            diffLines.push({ lineNum, file1Content: line1, file2Content: line2 });
        }
    }
    return { maxLines, diffCount: diffLines.length, diffLines };
}

interface FileState {
    file: File | null;
    content: string;
}

const INITIAL_FILE_STATE: FileState = { file: null, content: '' };

export default function ComparatorPage() {
    const [fileA, setFileA] = useState<FileState>(INITIAL_FILE_STATE);
    const [fileB, setFileB] = useState<FileState>(INITIAL_FILE_STATE);
    const [result, setResult] = useState<CompareResult | null>(null);
    const [fileNameA, setFileNameA] = useState<string>('Document A');
    const [fileNameB, setFileNameB] = useState<string>('Document B');
    const [status, setStatus] = useState<string>('Ready to compare');

    const isReady = useMemo(() => fileA.file !== null && fileB.file !== null, [fileA.file, fileB.file]);

    const handleFileChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        setFileState: React.Dispatch<React.SetStateAction<FileState>>,
        setFileName: React.Dispatch<React.SetStateAction<string>>,
        defaultName: string
    ) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.txt')) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setFileState({ file, content });
                setResult(null);
            };
            reader.readAsText(file, 'utf-8');
        } else if (file) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Please use .txt files only.',
                confirmButtonColor: '#4f46e5',
            });
            setFileState(INITIAL_FILE_STATE);
            setFileName(defaultName);
        }
    }, []);

    const handleCompare = useCallback(() => {
        if (!isReady) return;
        setStatus('Analyzing differences...');
        setTimeout(() => {
            const res = compareContents(fileA.content, fileB.content);
            setResult(res);
            setStatus(res.diffCount === 0 ? 'Files are identical' : `Found ${res.diffCount} differences`);
            
            if (res.diffCount === 0) {
                Swal.fire({ icon: 'success', title: 'Perfect Match!', text: 'Both files are 100% identical.', confirmButtonColor: '#10b981' });
            }
        }, 500);
    }, [isReady, fileA.content, fileB.content]);

    const handleClear = () => {
        Swal.fire({
            title: 'Reset all data?',
            text: "Uploaded files and results will be removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, reset'
        }).then((val) => {
            if (val.isConfirmed) {
                setFileA(INITIAL_FILE_STATE);
                setFileB(INITIAL_FILE_STATE);
                setFileNameA('Document A');
                setFileNameB('Document B');
                setResult(null);
            }
        });
    };

    const handleDownloadReport = () => {
        if (!result) return;
        let report = `COMPARISON REPORT\nGenerated: ${new Date().toLocaleString()}\n\n`;
        report += `Diff Count: ${result.diffCount}\n\n`;
        result.diffLines.forEach(d => {
            report += `Line ${d.lineNum}:\n[A]: ${d.file1Content}\n[B]: ${d.file2Content}\n\n`;
        });
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${new Date().getTime()}.txt`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header เหมือนหน้า Data Mapper */}
            <nav className="bg-slate-800 text-white shadow-xl border-b border-slate-700 py-5 px-8 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-300" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg">
                                <GitCompare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight">File Comparator <span className="text-amber-400 font-light">Pro</span></h1>
                                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Line-by-Line Content Analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {[
                        { state: fileA, setState: setFileA, name: fileNameA, setName: setFileNameA, label: "Original File", id: "fA", color: "amber" },
                        { state: fileB, setState: setFileB, name: fileNameB, setName: setFileNameB, label: "Target File", id: "fB", color: "indigo" }
                    ].map((item, idx) => (
                        <div key={idx} className={`bg-white rounded-[2rem] p-8 border-2 border-dashed transition-all duration-300 relative overflow-hidden ${item.state.file ? 'border-amber-200 shadow-md bg-amber-50/20' : 'border-slate-200 hover:border-slate-400'}`}>
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`p-4 rounded-2xl mb-4 ${item.state.file ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <FileText className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</h3>
                                <p className="text-lg font-bold text-slate-700 mb-6 truncate max-w-full">{item.name}</p>
                                
                                <input type="file" accept=".txt" onChange={(e) => handleFileChange(e, item.setState, item.setName, idx === 0 ? 'Document A' : 'Document B')} className="hidden" id={item.id} />
                                <button onClick={() => document.getElementById(item.id)?.click()} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> {item.state.file ? 'Change File' : 'Select .txt File'}
                                </button>
                            </div>
                            {item.state.file && <CheckCircle className="absolute top-6 right-6 w-6 h-6 text-emerald-500 animate-in zoom-in" />}
                        </div>
                    ))}
                </div>

                {/* Sticky Action Bar */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-4 sticky top-28 z-40 mb-10">
                    <div className="flex items-center gap-3 px-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleClear} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button onClick={handleDownloadReport} disabled={!result || result.diffCount === 0} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-2 text-sm transition-all">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                        <button onClick={handleCompare} disabled={!isReady} className="px-10 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-500/20 disabled:grayscale disabled:opacity-50 flex items-center gap-2 transition-all">
                            <GitCompare className="w-4 h-4" /> Run Comparison
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                {result && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1 uppercase">Analysis Result</h2>
                                <p className="text-slate-400 text-sm">Found {result.diffCount} discrepancies across {result.maxLines} lines</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center px-6 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <div className="text-[10px] uppercase font-black text-amber-400 tracking-widest">Diffs</div>
                                    <div className="text-2xl font-black">{result.diffCount}</div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-black text-slate-400 tracking-[0.1em]">
                                        <th className="px-8 py-5 w-24">Line #</th>
                                        <th className="px-8 py-5 border-l border-slate-100">{fileNameA}</th>
                                        <th className="px-8 py-5 border-l border-slate-100">{fileNameB}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {result.diffCount > 0 ? (
                                        result.diffLines.map((diff, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4 font-mono text-sm font-bold text-slate-300 group-hover:text-amber-500 transition-colors italic">
                                                    {diff.lineNum.toString().padStart(3, '0')}
                                                </td>
                                                <td className="px-8 py-4 border-l border-slate-100">
                                                    <div className={`p-3 rounded-xl font-mono text-xs border ${diff.file1Content.includes('<Missing') ? 'bg-red-50 border-red-100 text-red-500 italic' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                        {diff.file1Content}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 border-l border-slate-100">
                                                    <div className={`p-3 rounded-xl font-mono text-xs border ${diff.file2Content.includes('<Missing') ? 'bg-red-50 border-red-100 text-red-500 italic' : 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold'}`}>
                                                        {diff.file2Content}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-32 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
                                                    <h3 className="text-xl font-bold">No Differences Found</h3>
                                                    <p className="text-sm">These documents are perfectly synchronized.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-20 text-center opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.3em]">Precision Integrity Suite • Billone Analytics</p>
            </footer>
        </div>
    );
}