"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    FileText, Download, Trash2, Settings,
    AlertTriangle, CheckCircle, ArrowLeft,
    Database, Search, Terminal, FileSpreadsheet, Filter, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

import {
    OUTPUT_COLUMNS,
    EXPORT_COLUMNS,
    ColKey,
    ExtractedData,
    masterExtractor
} from './utils';

export default function PromotionExtractor() {
    const [rawInput, setRawInput] = useState('');
    const [dataList, setDataList] = useState<ExtractedData[]>([]);
    const [status, setStatus] = useState('Awaiting input');
    const [editCell, setEditCell] = useState<{ row: number; col: ColKey } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'review' | 'ok'>('all');

    const editRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const reviewCount = useMemo(() => dataList.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length, [dataList]);
    const isProcessed = dataList.length > 0;

    // Filtered data list based on search term & filter tab
    const filteredDataList = useMemo(() => {
        return dataList.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
            // Tab filter
            if (filterTab === 'review' && item['⚠️ ตรวจสอบ?'] !== 'ควรตรวจสอบ') return false;
            if (filterTab === 'ok' && item['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ') return false;

            // Search query filter
            if (searchTerm.trim()) {
                const query = searchTerm.toLowerCase();
                const legacyId = (item['Legacy ID'] || '').toLowerCase();
                const offeringName = (item['Offering Name'] || '').toLowerCase();
                const notifEng = (item['Notification Name (Eng)'] || '').toLowerCase();
                const notifThai = (item['Notification Name (Thai)'] || '').toLowerCase();
                return legacyId.includes(query) || offeringName.includes(query) || notifEng.includes(query) || notifThai.includes(query);
            }
            return true;
        });
    }, [dataList, filterTab, searchTerm]);

    // Background Canvas Dot Animation
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize(); window.addEventListener('resize', resize);
        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const sp = 40, cols = Math.ceil(canvas.width / sp), rows = Math.ceil(canvas.height / sp);
            for (let x = 0; x <= cols; x++) for (let y = 0; y <= rows; y++) {
                const p = Math.sin(frame * 0.008 + x * 0.3 + y * 0.2) * 0.5 + 0.5;
                ctx.beginPath(); ctx.arc(x * sp, y * sp, 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52,211,153,${0.04 + p * 0.06})`; ctx.fill();
            }
            frame++; requestAnimationFrame(draw);
        };
        draw(); return () => window.removeEventListener('resize', resize);
    }, []);

    const handleProcess = useCallback(() => {
        setStatus('Processing...');
        const raw = rawInput.trim();
        if (!raw) {
            Swal.fire({ icon: 'warning', title: 'Data Required', text: 'กรุณาวางข้อมูลดิบก่อนประมวลผล', confirmButtonColor: '#0a0c0f' });
            setStatus('Awaiting input'); return;
        }

        // Improved chunking regex to handle various promotion header formats
        const chunks = raw.split(/(?=\d{8}:\s*New|โปรโมชั่น\s*\d{8}\s*:|โปรโมชั่น\s*\d+\s*:)/).map(c => c.trim()).filter(Boolean);
        const result = chunks.map(chunk => masterExtractor(chunk));

        setDataList(result);
        const rc = result.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length;

        if (rc > 0) Swal.fire({ icon: 'info', title: 'Process Complete', text: `พบ ${rc} รายการที่ต้องตรวจสอบ`, confirmButtonColor: '#0a0c0f' });
        else Swal.fire({ icon: 'success', title: 'Success', text: `สกัดข้อมูลสำเร็จ ${result.length} รายการ`, timer: 2000, showConfirmButton: false });

        setStatus(`✓ Processed ${result.length} records`);
    }, [rawInput]);

    const handleClear = useCallback(() => {
        setRawInput('');
        setDataList([]);
        setStatus('Awaiting input');
        setEditCell(null);
        setSearchTerm('');
        setFilterTab('all');
    }, []);

    const handleDeleteRow = useCallback((originalIdx: number) => {
        setDataList(prev => prev.filter((_, i) => i !== originalIdx));
    }, []);

    const handleCellEdit = useCallback((originalIdx: number, col: ColKey, value: string) => {
        setDataList(prev => {
            const next = [...prev];
            next[originalIdx] = { ...next[originalIdx], [col]: value };
            const missing = (['Legacy ID', 'Offering Name'] as ColKey[]).filter(f => !next[originalIdx][f]?.trim());
            next[originalIdx]['⚠️ ตรวจสอบ?'] = missing.length > 0 ? 'ควรตรวจสอบ' : '';
            return next;
        });
    }, []);

    const handleDownloadCSV = useCallback(() => {
        if (!dataList.length) return;
        let csv = '\uFEFF' + EXPORT_COLUMNS.map(c => `"${c}"`).join(',') + '\r\n';
        dataList.forEach(item => {
            csv += EXPORT_COLUMNS.map(col => `"${String(item[col] || '').replace(/"/g, '""')}"`).join(',') + '\r\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        a.href = url;
        a.download = `Extracted_Promo_${today}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }, [dataList]);

    const handleDownloadXLSX = useCallback(() => {
        if (!dataList.length) return;
        const wb = XLSX.utils.book_new();
        const rows = dataList.map(item => EXPORT_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: item[col] || '' }), {} as Record<string, string>));
        const ws = XLSX.utils.json_to_sheet(rows, { header: [...EXPORT_COLUMNS] });

        // Set cell types & number formats
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const legacyColIdx = EXPORT_COLUMNS.indexOf('Legacy ID');
            if (legacyColIdx >= 0) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: legacyColIdx });
                if (ws[cellRef]) ws[cellRef].t = 's'; // Force string so leading 0 isn't stripped
            }

            const feeColIdx = EXPORT_COLUMNS.indexOf('Rental Fee without tax');
            if (feeColIdx >= 0) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: feeColIdx });
                if (ws[cellRef] && ws[cellRef].v) {
                    const num = parseFloat(ws[cellRef].v);
                    if (!isNaN(num)) {
                        ws[cellRef].v = num;
                        ws[cellRef].t = 'n';
                        ws[cellRef].z = '0.000000';
                    }
                }
            }
        }

        ws['!cols'] = EXPORT_COLUMNS.map(col => ({ wch: Math.max(col.length + 2, 14) }));
        XLSX.utils.book_append_sheet(wb, ws, 'Promotions');
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        XLSX.writeFile(wb, `Extracted_Promo_${today}.xlsx`);
    }, [dataList]);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0a0c0f] pb-24">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono-custom { font-family: 'Space Mono', monospace; }
        @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity:0; animation: fade-up 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes scan { 0%{transform:translateY(-100%);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(100vh);opacity:0} }
        .scan-line { animation: scan 8s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.2); border-radius:10px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(52,211,153,0.4); }
      `}</style>

            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
            <div className="scan-line pointer-events-none fixed left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent)]" />

            <div className="relative z-10 mx-auto max-w-[1480px] px-6 py-10">

                {/* ── HEADER ── */}
                <header className="fade-up mb-12" style={{ animationDelay: '0ms' }}>
                    <div className="mb-8 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/[0.06]" />
                        <span className="font-mono-custom text-[10px] tracking-[0.3em] text-white/25">BILLONE · OCS TOOLS</span>
                        <div className="h-px flex-1 bg-white/[0.06]" />
                    </div>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <Link
                                href="/mainocs"
                                className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono-custom text-[11px] tracking-widest text-white/40 transition-all hover:border-white/20 hover:text-white/70"
                            >
                                <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
                                BACK TO HUB
                            </Link>
                            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white">
                                Promotion Data{' '}
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                                    Extractor
                                </span>
                            </h1>
                            <p className="mt-2 font-mono-custom text-[11px] text-white/30">
                                สกัดข้อมูลโปรโมชั่นจากข้อความดิบ · export CSV / XLSX สำหรับ config OCS
                            </p>
                        </div>

                        {/* Status pill */}
                        <div className="mt-1 flex shrink-0 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                            <div className={`pulse-dot h-2 w-2 rounded-full ${status.startsWith('✓') ? 'bg-emerald-400' : status === 'Processing...' ? 'bg-amber-400' : 'bg-white/20'}`} />
                            <span className="font-mono-custom text-[11px] text-white/50">{status}</span>
                        </div>
                    </div>
                </header>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT — Input */}
                    <div className="fade-up lg:col-span-4 space-y-4" style={{ animationDelay: '80ms' }}>
                        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <Database size={15} className="text-emerald-400" />
                                    <span className="font-mono-custom text-[11px] tracking-[0.2em] text-white/50">SOURCE DATA</span>
                                </div>
                                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono-custom text-[10px] text-white/25">
                                    Auto-detect
                                </span>
                            </div>
                            <div className="p-5">
                                <textarea
                                    rows={18}
                                    placeholder="วางข้อมูลโปรโมชั่นที่นี่..."
                                    value={rawInput}
                                    onChange={e => setRawInput(e.target.value)}
                                    className="w-full rounded-xl border border-white/[0.08] bg-[#0d0f12] p-4 font-mono-custom text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-emerald-500/30 focus:bg-[#0f1114] transition-all resize-none"
                                />
                                <div className="mt-4 flex flex-col gap-2.5">
                                    <button
                                        onClick={handleProcess}
                                        className="relative w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3.5 font-mono-custom text-xs font-bold tracking-[0.2em] text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-center gap-2"
                                    >
                                        <Settings size={14} /> PROCESS INTELLIGENCE
                                        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 font-mono-custom text-[11px] tracking-widest text-white/25 transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> CLEAR ALL
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Review badge */}
                        {isProcessed && reviewCount > 0 && (
                            <div className="fade-up rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <p className="font-mono-custom text-[10px] tracking-[0.2em] text-amber-400/60">NEEDS REVIEW</p>
                                    <p className="font-display text-2xl font-extrabold text-amber-400 leading-none mt-0.5">
                                        {reviewCount} <span className="text-sm font-normal text-amber-400/60">รายการ</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Legend cards */}
                        {[
                            { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/15', bg: 'bg-amber-500/5', title: 'Validation', desc: 'ตรวจสอบหาก Legacy ID หรือ Offering Name หาย' },
                            { icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/15', bg: 'bg-emerald-500/5', title: 'Smart Format', desc: 'Rental Fee 6 ตำแหน่ง · วันที่ไทย → DD/MM/YYYY' },
                            { icon: Search, color: 'text-sky-400', border: 'border-sky-500/15', bg: 'bg-sky-500/5', title: 'Editable', desc: 'ดับเบิ้ลคลิกเซลล์เพื่อแก้ไขข้อมูลก่อน export' },
                        ].map((item, i) => (
                            <div key={i} className={`rounded-xl border ${item.border} ${item.bg} p-4 flex items-start gap-3`}>
                                <item.icon size={14} className={`${item.color} mt-0.5 shrink-0`} />
                                <div>
                                    <p className={`font-mono-custom text-[10px] font-bold tracking-widest ${item.color}`}>{item.title.toUpperCase()}</p>
                                    <p className="mt-0.5 font-mono-custom text-[11px] text-white/30 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT — Results */}
                    <div className="fade-up lg:col-span-8" style={{ animationDelay: '140ms' }}>
                        {!isProcessed ? (
                            <div className="flex h-[680px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/20">
                                    <Terminal size={24} strokeWidth={1.5} />
                                </div>
                                <p className="font-display text-lg font-bold text-white/25">No Data Processed</p>
                                <p className="mt-1 font-mono-custom text-[11px] text-white/15">วางข้อมูลแล้วกด Process Intelligence</p>
                            </div>
                        ) : (
                            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 h-[680px]">
                                {/* Table topbar */}
                                <div className="flex items-center justify-between bg-[#0d0f12] px-6 py-4 border-b border-white/[0.06] flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="font-mono-custom text-[11px] tracking-widest text-white/60">EXTRACTED DATASET</p>
                                            <p className="font-mono-custom text-[10px] text-white/25">{dataList.length} รายการ · ดับเบิ้ลคลิกเซลล์เพื่อแก้ไข</p>
                                        </div>
                                    </div>

                                    {/* Controls: Search & Filter Tabs & Export */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Search Input */}
                                        <div className="relative flex items-center">
                                            <Search size={12} className="absolute left-3 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="ค้นหา ID/ชื่อโปร..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-40 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 font-mono-custom text-[11px] text-white/70 placeholder:text-white/25 outline-none focus:border-emerald-500/40"
                                            />
                                        </div>

                                        {/* Filter Tab buttons */}
                                        <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
                                            <button
                                                onClick={() => setFilterTab('all')}
                                                className={`px-3 py-1 font-mono-custom text-[10px] rounded-lg transition-all ${filterTab === 'all' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-white/40 hover:text-white/70'}`}
                                            >
                                                ทั้งหมด ({dataList.length})
                                            </button>
                                            <button
                                                onClick={() => setFilterTab('review')}
                                                className={`px-3 py-1 font-mono-custom text-[10px] rounded-lg transition-all ${filterTab === 'review' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-white/40 hover:text-white/70'}`}
                                            >
                                                ต้องตรวจสอบ ({reviewCount})
                                            </button>
                                            <button
                                                onClick={() => setFilterTab('ok')}
                                                className={`px-3 py-1 font-mono-custom text-[10px] rounded-lg transition-all ${filterTab === 'ok' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-white/40 hover:text-white/70'}`}
                                            >
                                                ผ่าน ({dataList.length - reviewCount})
                                            </button>
                                        </div>

                                        {/* Export Buttons */}
                                        <button
                                            onClick={handleDownloadCSV}
                                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono-custom text-[11px] tracking-widest text-white/40 transition-all hover:border-white/20 hover:text-white/70"
                                        >
                                            <Download size={12} /> CSV
                                        </button>
                                        <button
                                            onClick={handleDownloadXLSX}
                                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono-custom text-[11px] tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/20"
                                        >
                                            <FileSpreadsheet size={12} /> XLSX
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="flex-1 overflow-auto bg-[#0a0c0f]">
                                    <table className="w-full border-collapse text-left">
                                        <thead className="sticky top-0 z-10 bg-[#0d0f12]">
                                            <tr className="border-b border-white/[0.06]">
                                                <th className="px-3 py-3 font-mono-custom text-[10px] tracking-[0.15em] text-white/20 w-10">#</th>
                                                {OUTPUT_COLUMNS.map(col => (
                                                    <th key={col} className="px-4 py-3 font-mono-custom text-[10px] tracking-[0.12em] text-white/30 whitespace-nowrap">
                                                        {col}
                                                    </th>
                                                ))}
                                                <th className="px-3 py-3 font-mono-custom text-[10px] text-white/20">DEL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDataList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={OUTPUT_COLUMNS.length + 2} className="py-12 text-center font-mono-custom text-xs text-white/20">
                                                        ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredDataList.map(({ item, originalIndex }, idx) => (
                                                    <tr
                                                        key={originalIndex}
                                                        className={`group border-b border-white/[0.04] transition-colors ${item['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ' ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.07]' : 'hover:bg-white/[0.025]'}`}
                                                    >
                                                        <td className="px-3 py-2.5 font-mono-custom text-[10px] text-white/20 text-center">{originalIndex + 1}</td>
                                                        {OUTPUT_COLUMNS.map(col => {
                                                            const val = item[col] || '';
                                                            const isEditing = editCell?.row === originalIndex && editCell?.col === col;
                                                            const needsReview = col === '⚠️ ตรวจสอบ?' && val === 'ควรตรวจสอบ';
                                                            return (
                                                                <td
                                                                    key={col}
                                                                    className={`px-4 py-2.5 font-mono-custom text-[11px] whitespace-nowrap border-r border-white/[0.03] cursor-pointer transition-colors
                                      ${needsReview ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-white/40 group-hover:text-white/70'}`}
                                                                    onDoubleClick={() => {
                                                                        if (col !== '⚠️ ตรวจสอบ?') {
                                                                            setEditCell({ row: originalIndex, col });
                                                                            setTimeout(() => editRef.current?.focus(), 50);
                                                                        }
                                                                    }}
                                                                    title={col !== '⚠️ ตรวจสอบ?' ? 'ดับเบิ้ลคลิกเพื่อแก้ไข' : undefined}
                                                                >
                                                                    {isEditing ? (
                                                                        <input
                                                                            ref={editRef}
                                                                            defaultValue={val}
                                                                            className="min-w-[120px] w-full rounded-lg border border-emerald-500/40 bg-[#0d0f12] px-2 py-1 text-[11px] text-emerald-300 outline-none ring-1 ring-emerald-500/20"
                                                                            onBlur={e => { handleCellEdit(originalIndex, col, e.target.value); setEditCell(null); }}
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') { handleCellEdit(originalIndex, col, (e.target as HTMLInputElement).value); setEditCell(null); }
                                                                                if (e.key === 'Escape') setEditCell(null);
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        val || <span className="text-white/15">—</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="px-3 py-2.5 text-center">
                                                            <button
                                                                onClick={() => handleDeleteRow(originalIndex)}
                                                                className="rounded-lg p-1 text-white/15 transition-all hover:bg-red-500/10 hover:text-red-400"
                                                            >
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer bar */}
                                <div className="flex items-center justify-between bg-[#0d0f12] px-6 py-3 border-t border-white/[0.06]">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        <span className="font-mono-custom text-[10px] tracking-[0.2em] text-white/25">DATA INTEGRITY CHECK: PASSED</span>
                                    </div>
                                    {reviewCount > 0 && (
                                        <span className="flex items-center gap-1.5 font-mono-custom text-[10px] tracking-widest text-amber-400/70">
                                            <AlertTriangle size={10} /> NEEDS REVIEW: {reviewCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <footer className="mt-20 border-t border-white/[0.05] pt-8 text-center">
                    <p className="font-mono-custom text-[10px] tracking-[0.3em] text-white/15">
                        ARM@MOS · BILLONE INTERNAL ANALYTICS SYSTEMS · © {new Date().getFullYear()}
                    </p>
                </footer>
            </div>
        </div>
    );
}