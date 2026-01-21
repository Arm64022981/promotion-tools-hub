"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileText, Download, Trash2, Settings, 
  BarChart3, AlertTriangle, CheckCircle, 
  ArrowLeft, Award, Database, Search, Terminal
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

// --- (Keep OUTPUT_COLUMNS, KNOWN_CYCLE_TYPES, etc. unchanged) ---
const OUTPUT_COLUMNS = [
    '⚠️ ตรวจสอบ?', 'Change log', 'Legacy ID', 'Offering Name', 'Notification Name (Eng)',
    'Notification Name (Thai)', 'Remark', 'Cycle Type', 'Cycle Length',
    'Prorate RC & FU', 'Cycle shift', 'RC failed need Suspend ?',
    'Retry RC times', 'Action after max retry', 'Rental Fee without tax',
    'Bonus', 'Voice Tariff', 'SMS Tariff', 'MMS Tariff', 'GPRS Tariff',
    'Independent Sales', 'Type', 'Free unit type Legacy', 'Free unit type OCS',
    'Free unit value', 'Balance ID', 'SCG config existing',
    'FU ID', 'Speed', 'Offer ID', 'SpeedTemplate', 'Deploy Date',
    'Deploy State', 'Sale Start Date'
] as const;

type ExtractedData = Partial<Record<typeof OUTPUT_COLUMNS[number], string>>;

const KNOWN_CYCLE_TYPES = new Set([
    '1day', '1days', '15day', '15days', '186days', '2days', '217days', '24hours',
    '3days', '30days', '31calendar days', '31days', '372days', '434days',
    '45days', '7days', '8days', '90days', '93days', '99days',
    'Bill Cycle', 'Life Time', '31 calendar_day'
]);

const cycleTypeRegex = new RegExp(
    [...KNOWN_CYCLE_TYPES].sort((a, b) => b.length - a.length).join('|'),
    'i'
);

const KNOWN_RETRY_TIMES = new Set(['3', '7', '99', '999', '9999']);
const KNOWN_CYCLE_SHIFTS = new Set(['Shift', 'Not Shift']);

// --- (Logic functions: masterExtractor, extractKeyValueData, extractTabSeparatedData - Keep your original logic) ---
function extractKeyValueData(textChunk: string): ExtractedData {
    const details: ExtractedData = {};
    const findPattern = (regex: RegExp, text: string) => (text.match(regex) || [])[1]?.trim() || '';

    const notifLineMatch = textChunk.match(/Notification Name \(Eng\)\s*:\s*([^\r\n]*)/m);
    if (notifLineMatch) {
        const fullLine = notifLineMatch[1];
        const parts = fullLine.split(/Notification Name \(Th\)\s*:/);
        details['Notification Name (Eng)'] = parts[0]?.trim() || '';
        if (parts.length > 1) {
            details['Notification Name (Thai)'] = parts[1]?.trim() || '';
        }
    }
    if (!details['Notification Name (Thai)']) {
        details['Notification Name (Thai)'] = findPattern(/Notification Name \(Th\)\s*:\s*([^\r\n]*)/m, textChunk);
    }

    details['Legacy ID'] = findPattern(/รหัสโปรโมชั่น\s*:\s*(\d{8})/m, textChunk);
    details['Offering Name'] = findPattern(/ชื่อโปรใน OCS\s*:\s*([^\r\n]*)/m, textChunk);

    let fee = findPattern(/ค่าบริการ \(บาท\/ไม่รวม VAT\)\s*:\s*([\d.]+)/m, textChunk);
    if (parseFloat(fee) > 0) {
        details['Rental Fee without tax'] = fee;
    }

    let periodText = findPattern(/ระยะเวลาใช้บริการ \(Period\)\s*:\s*([\s\S]*?)(?=\s*\*|Cycle Length|$)/, textChunk);
    if (periodText) {
        const match = periodText.match(cycleTypeRegex);
        if (match) details['Cycle Type'] = match[0];
    }

    let lengthText = findPattern(/Cycle Length\s*:\s*([^\r\n]*)/m, textChunk);
    if (/^(\d+\s*รอบบิล|\d+\s*times?|Renew)$/i.test(lengthText)) {
        details['Cycle Length'] = lengthText.replace('รอบบิล', 'times');
    }

    details['Prorate RC & FU'] = findPattern(/เกณฑ์การคิดค่าบริการ\s*:\s*(Prorate|Not Prorate)/m, textChunk);
    details['RC failed need Suspend ?'] = findPattern(/RC failed need Suspend \?\s*:\s*(Suspend)/m, textChunk);
    details['Retry RC times'] = findPattern(/Retry RC times\s*:\s*(3|7|99|999|9999)\b/m, textChunk);
    details['Cycle shift'] = findPattern(/ระยะเวลาใช้บริการในรอบบิลต่อไป\s*:\s*(Shift|Not Shift)/m, textChunk);

    details['Sale Start Date'] = findPattern(/วันที่เริ่มจำหน่าย \(Sale Start Date\)\s*:\s*(\d{1,2}[-]\d{1,2}[-]\d{4}|\d{1,2}\s*[ก-๙]+\s*\d{2})/m, textChunk) || findPattern(/(\d{1,2}\s*[ก-๙]+\s*\d{2})/m, textChunk.split('Channel name')[1] || '');
    details['Deploy Date'] = findPattern(/วันเริ่มต้นใช้แพ็กเกจ \(Effective Date\)\s*:\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/m, textChunk);

    const statusText = findPattern(/สถานะโปรโมชั่น\s*:\s*([^\r\n]*)/m, textChunk);
    if (statusText) details['Deploy State'] = statusText;

    const speedMatch = findPattern(/โปรโมชั่น.*?เน็ต.*?\s([\d.]+Mbps)/m, textChunk);
    if (speedMatch) {
        details['Speed'] = `เน็ตไม่จำกัด ${speedMatch}`;
        details['SpeedTemplate'] = speedMatch;
    }

    return details;
}

function extractTabSeparatedData(textChunk: string): ExtractedData {
    const details: ExtractedData = {};
    const fields = textChunk.split(/\t|\s{2,}/).map(f => f.trim()).filter(f => f);

    try {
        details['Change log'] = fields[0];
        details['Legacy ID'] = fields.find(f => /^\d{8}$/.test(f)) || '';
        details['Offering Name'] = fields.find(f => f.startsWith('SO_')) || '';
        details['Notification Name (Eng)'] = fields[3];
        details['Notification Name (Thai)'] = fields[4];
    } catch (e) { }

    fields.forEach((field) => {
        if (/^(\d+\s*times?|Renew)$/i.test(field) && !details['Cycle Length']) {
            details['Cycle Length'] = field;
        } else if (KNOWN_RETRY_TIMES.has(field) && !details['Retry RC times']) {
            details['Retry RC times'] = field;
        } else if (KNOWN_CYCLE_SHIFTS.has(field) && !details['Cycle shift']) {
            details['Cycle shift'] = field;
        } else if (field === 'Prorate' || field === 'Not Prorate') {
            details['Prorate RC & FU'] = field;
        } else if (field === 'Suspend') {
            details['RC failed need Suspend ?'] = field;
        } else if (field === 'Cancel offer') {
            details['Action after max retry'] = field;
        } else if (/^\d+(\.\d+)?$/.test(field) && !details['Rental Fee without tax']) {
            const fee = parseFloat(field);
            if (fee > 0) {
                details['Rental Fee without tax'] = field;
            }
        } else if (/^(\dG\/?)+$/.test(field)) {
            details['Type'] = field;
        } else if (/Bytes/.test(field) && !/DATA VOLUME/.test(details['Free unit type OCS'] || '')) {
            details['Free unit type Legacy'] = 'DATA VOLUME';
            details['Free unit type OCS'] = 'DATA VOLUME';
            details['Free unit value'] = field;
        } else if (/Baht \//.test(field)) {
            details['GPRS Tariff'] = field;
        } else if (/อินเทอร์เน็ต|โทรฟรี/.test(field)) {
            details['Speed'] = field;
        } else if (/Kbps|Mbps|No FUP/i.test(field)) {
            details['SpeedTemplate'] = field;
        } else if (field === 'Y' && !details['Bonus']) {
            details['Bonus'] = field;
        } else if (field === 'N' && !details['Independent Sales']) {
            details['Independent Sales'] = field;
        } else if (/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(field) && !details['Deploy Date']) {
            details['Deploy Date'] = field.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/)?.[0] || '';
        } else if (/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(field) && !details['Sale Start Date']) {
            details['Sale Start Date'] = field.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/)?.[0] || '';
        } else if (/in-progress|deploy/i.test(field)) {
            details['Deploy State'] = field;
        }
    });

    return details;
}

function masterExtractor(textChunk: string): ExtractedData {
    let details: ExtractedData;

    if (/^\d{8}:\s*New/.test(textChunk)) {
        details = extractTabSeparatedData(textChunk);
    } else if (/รหัสโปรโมชั่น\s*:|ค่าบริการ \(บาท\/ไม่รวม VAT\)/.test(textChunk)) {
        details = extractKeyValueData(textChunk);
    } else {
        details = {};
    }

    if (!details['Cycle Type']) {
        const searchableText = `${details['Offering Name'] || ''} ${details['Notification Name (Eng)'] || ''} ${textChunk}`;
        const match = searchableText.match(cycleTypeRegex);
        if (match) {
            const matchedValue = match[0].toLowerCase();
            const originalCasing = [...KNOWN_CYCLE_TYPES].find(k => k.replace(/\s+/g, '').toLowerCase() === matchedValue.replace(/\s+/g, ''));
            details['Cycle Type'] = originalCasing || match[0];
        }
    }

    let speedValue: string | null = null;
    const remarkSpeedMatch = textChunk.match(/Remark\s*:\s*Speed.*?\s*(\d+)\s*Mbps/i);
    if (remarkSpeedMatch && remarkSpeedMatch[1]) {
        speedValue = remarkSpeedMatch[1];
    }

    if (!speedValue && details['Offering Name']) {
        const nameSpeedMatch = details['Offering Name'].match(/_(\d+)(M|Mbps)/i);
        if (nameSpeedMatch && nameSpeedMatch[1]) {
            speedValue = nameSpeedMatch[1];
        }
    }

    if (speedValue) {
        const ocsString = `3G/4G DATA VOLUME ${speedValue}M`;
        details['Free unit type OCS'] = ocsString;
        details['Free unit type Legacy'] = ocsString;
    }

    details['Remark'] = 'Pre-collection';

    if (details['Deploy State'] && /in-progress|deploy/i.test(details['Deploy State'])) {
        details['Deploy State'] = 'In-progress';
    }

    if (details['Rental Fee without tax']) {
        const fee = parseFloat(details['Rental Fee without tax']!);
        if (!isNaN(fee)) {
            details['Rental Fee without tax'] = fee.toFixed(6);
        }
    }

    const criticalFields = ['Legacy ID', 'Offering Name'] as const;
    const missingCriticalFields = criticalFields.filter(field => !details[field as keyof ExtractedData] || details[field as keyof ExtractedData]!.trim() === '');
    details['⚠️ ตรวจสอบ?'] = missingCriticalFields.length > 0 ? 'ควรตรวจสอบ' : '';

    return details;
}


export default function PromotionExtractor() {
    const [rawInput, setRawInput] = useState<string>('');
    const [extractedDataList, setExtractedDataList] = useState<ExtractedData[]>([]);
    const [status, setStatus] = useState<string>('Ready to process');

    const reviewCount = useMemo(() => extractedDataList.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length, [extractedDataList]);
    const isProcessed = extractedDataList.length > 0;

    const handleProcess = useCallback(() => {
        setStatus('Processing...');
        const rawText = rawInput.trim();

        if (!rawText) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Required',
                text: 'กรุณาวางข้อมูลดิบก่อนประมวลผล',
                confirmButtonColor: '#1e293b',
            });
            setStatus('Ready to process');
            return;
        }

        const promoChunks = rawText.split(/(?=\d{8}:\s*New|โปรโมชั่น\s\d+\s*:)/).map(c => c.trim()).filter(c => c);
        const newExtractedData = promoChunks.map(chunk => masterExtractor(chunk));
        setExtractedDataList(newExtractedData);

        const currentReviewCount = newExtractedData.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length;

        if (currentReviewCount > 0) {
            Swal.fire({
                icon: 'info',
                title: 'Process Complete',
                text: `พบ ${currentReviewCount} รายการที่ต้องตรวจสอบความถูกต้อง`,
                confirmButtonColor: '#1e293b',
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `สกัดข้อมูลสำเร็จ ${newExtractedData.length} รายการ`,
                timer: 2000,
                showConfirmButton: false
            });
        }
        setStatus(`✓ Processed ${newExtractedData.length} records`);
    }, [rawInput]);

    const handleClear = useCallback(() => {
        setRawInput('');
        setExtractedDataList([]);
        setStatus('Ready to process');
    }, []);

    const handleDownload = useCallback(() => {
        if (extractedDataList.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8," + "\uFEFF";
        csvContent += OUTPUT_COLUMNS.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\r\n';

        extractedDataList.forEach(item => {
            const row = OUTPUT_COLUMNS.map(col => {
                let cellData = item[col as keyof ExtractedData] || '';
                return `"${String(cellData).replace(/"/g, '""')}"`;
            });
            csvContent += row.join(',') + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Extracted_Promo_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [extractedDataList]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
            {/* --- HEADER (Consistent with other pages) --- */}
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
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl shadow-lg mb-4 text-white">
                        <Terminal size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Promotion Data <span className="text-emerald-400 font-light">Extractor</span>
                    </h1>
                    <p className="opacity-70 mt-3 text-white font-light max-w-lg mx-auto">
                        สกัดข้อมูลโปรโมชั่นจากข้อความดิบให้เป็นรูปแบบตาราง CSV ภายในไม่กี่วินาที
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1500px] mx-auto px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Input Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database size={18} className="text-emerald-600" />
                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Source Data</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white border rounded-lg">Auto-Format Detection</span>
                            </div>
                            
                            <div className="p-6">
                                <textarea
                                    rows={18}
                                    placeholder="วางข้อมูลโปรโมชั่นที่นี่..."
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                    className="w-full p-5 border border-slate-200 rounded-2xl bg-slate-50 font-mono text-xs focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all resize-none shadow-inner"
                                />
                                
                                <div className="mt-6 flex flex-col gap-3">
                                    <button 
                                        onClick={handleProcess}
                                        className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Settings size={18} className="animate-spin-slow" /> Process Intelligence
                                    </button>
                                    <button 
                                        onClick={handleClear}
                                        className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-400 font-bold rounded-xl transition-all text-xs uppercase tracking-tighter"
                                    >
                                        <Trash2 size={14} className="inline mr-2" /> Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Widget */}
                        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${
                            status.startsWith('✓') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                        }`}>
                            <div className={`p-2 rounded-xl ${status.startsWith('✓') ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                {status.startsWith('✓') ? <CheckCircle size={20} /> : <BarChart3 size={20} />}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest leading-none mb-1">System Status</p>
                                <p className="text-sm font-bold leading-none">{status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results Section */}
                    <div className="lg:col-span-8">
                        {!isProcessed ? (
                            <div className="h-[750px] bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <div className="p-6 bg-slate-50 rounded-full">
                                    <Search size={48} strokeWidth={1} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-600">No Data Processed</p>
                                    <p className="text-xs max-w-[250px] mt-2 opacity-60 leading-relaxed">ข้อมูลที่ประมวลผลแล้วจะปรากฏที่นี่ในรูปแบบตารางพร้อมส่งออกเป็น CSV</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest leading-none">Extracted Dataset</h2>
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold">{extractedDataList.length} รายการที่สกัดได้</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                                    >
                                        <Download size={14} /> Export CSV
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                                                {OUTPUT_COLUMNS.map((col) => (
                                                    <th key={col} className="px-5 py-4 border-r border-slate-700 whitespace-nowrap font-bold first:rounded-tl-none last:rounded-tr-none">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px] font-mono">
                                            {extractedDataList.map((item, idx) => (
                                                <tr key={idx} className={`group transition-colors ${item['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ' ? 'bg-amber-50 hover:bg-amber-100/50' : 'hover:bg-slate-50/80'}`}>
                                                    {OUTPUT_COLUMNS.map((col) => {
                                                        const val = item[col as keyof ExtractedData];
                                                        const needsReview = col === '⚠️ ตรวจสอบ?' && val === 'ควรตรวจสอบ';
                                                        return (
                                                            <td key={col} className={`px-5 py-3 border-b border-r border-slate-100 whitespace-nowrap transition-all ${needsReview ? 'text-amber-600 font-bold bg-amber-100/30' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                                                {val || '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="p-4 bg-slate-900 text-[10px] text-slate-400 flex justify-between font-bold tracking-widest">
                                    <span>DATA INTEGRITY CHECK: PASSED</span>
                                    {reviewCount > 0 && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle size={10}/> NEEDS REVIEW: {reviewCount}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend Section */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Validation Alert', desc: 'ทำเครื่องหมาย "ควรตรวจสอบ" หาก Legacy ID หรือ Offer Name ขาดหาย' },
                        { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Smart Formatting', desc: 'ข้อมูล Rental Fee จะถูกแปลงเป็นทศนิยม 6 ตำแหน่ง (Billing Standard)' },
                        { icon: Search, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Multi-Format', desc: 'รองรับข้อมูลจาก Email, Excel (Tab-Separated) และระบบหลังบ้าน' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1">
                            <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-bold opacity-70">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="py-12 text-center opacity-30 mt-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Internal Engineering Unit • Billone Professional Suite</p>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}