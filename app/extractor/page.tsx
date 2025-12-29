"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { 
    FileText, Download, Trash2, Settings, 
    BarChart3, AlertTriangle, CheckCircle, 
    ArrowLeft, Award, Database, Search
} from 'lucide-react';
import Swal from 'sweetalert2';

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

// --- (Keep Logic functions: extractKeyValueData, extractTabSeparatedData, masterExtractor unchanged) ---
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
    const [status, setStatus] = useState<string>('Ready to process promotion data');

    const reviewCount = useMemo(() => extractedDataList.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length, [extractedDataList]);
    const isProcessed = extractedDataList.length > 0;

    const backToHub = () => window.location.href = '/';

    const handleProcess = useCallback(() => {
        setStatus('Processing data...');
        const rawText = rawInput.trim();

        if (!rawText) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Required',
                text: 'กรุณาวางข้อมูลดิบในช่องรับข้อมูลก่อนประมวลผล',
                confirmButtonColor: '#334155',
            });
            setStatus('Ready to process promotion data');
            return;
        }

        const promoChunks = rawText.split(/(?=\d{8}:\s*New|โปรโมชั่น\s\d+\s*:)/).map(c => c.trim()).filter(c => c);
        const newExtractedData = promoChunks.map(chunk => masterExtractor(chunk));
        setExtractedDataList(newExtractedData);

        const currentReviewCount = newExtractedData.filter(d => d['⚠️ ตรวจสอบ?']).length;

        if (currentReviewCount > 0) {
            Swal.fire({
                icon: 'info',
                title: 'Process Complete',
                text: `ประมวลผลสำเร็จ ${newExtractedData.length} รายการ (พบ ${currentReviewCount} รายการที่ต้องตรวจสอบ)`,
                confirmButtonColor: '#334155',
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `สกัดข้อมูลสำเร็จทั้งหมด ${newExtractedData.length} รายการ`,
                timer: 2000,
                showConfirmButton: false
            });
        }
        setStatus(`✓ Processed ${newExtractedData.length} records`);
    }, [rawInput]);

    const handleClear = useCallback(() => {
        Swal.fire({
            title: 'Clear all data?',
            text: "ข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                setRawInput('');
                setExtractedDataList([]);
                setStatus('Ready to process promotion data');
            }
        })
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-gray-800">
            {/* --- HEADER BANNER --- */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-800 to-slate-700 py-12 px-6 text-center shadow-xl">
                <button 
                    onClick={backToHub}
                    className="absolute left-4 top-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Hub
                </button>
                
                <div className="inline-block rounded-full border-2 border-gray-300 bg-white/20 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm mb-4">
                    <Award className="mr-1 inline h-4 w-4" />
                    Data Automation Suite
                </div>

                <h1 className="mb-2 text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
                    Promotion Data Extractor
                </h1>
                <p className="text-gray-200 font-light opacity-90 max-w-2xl mx-auto">
                    สกัดข้อมูลโปรโมชั่นจากข้อความดิบให้กลายเป็นรูปแบบตารางที่พร้อมใช้งานอย่างรวดเร็วและแม่นยำ
                </p>
                <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white/30"></div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="mx-auto max-w-7xl px-6 py-10">
                
                <div className="grid gap-8 lg:grid-cols-12">
                    
                    {/* Left Panel: Input & Controls */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden transition-all hover:border-slate-300">
                            <div className="p-5 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded-lg text-white">
                                        <Database size={20} />
                                    </div>
                                    <h2 className="font-bold text-slate-800">Raw Data Input</h2>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format: Key-Value / Tab</span>
                            </div>
                            
                            <div className="p-6">
                                <textarea
                                    rows={15}
                                    placeholder="วางข้อมูลโปรโมชั่นจาก Email หรือระบบที่นี่..."
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                    className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 font-mono text-xs focus:bg-white focus:border-slate-400 focus:ring-0 transition-all outline-none resize-none shadow-inner"
                                />
                                
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleProcess}
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95"
                                    >
                                        <Settings size={18} /> Process
                                    </button>
                                    <button 
                                        onClick={handleClear}
                                        className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 hover:border-red-200 hover:text-red-600 text-slate-500 font-bold rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} /> Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Widget */}
                        <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-sm ${
                            status.startsWith('✓') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                        }`}>
                            <div className={`p-2 rounded-full ${status.startsWith('✓') ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                {status.startsWith('✓') ? <CheckCircle size={20} /> : <BarChart3 size={20} />}
                            </div>
                            <span className="text-sm font-semibold">{status}</span>
                        </div>
                    </div>

                    {/* Right Panel: Results Table */}
                    <div className="lg:col-span-7">
                        {!isProcessed ? (
                            <div className="h-full min-h-[400px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <Search size={48} strokeWidth={1} />
                                <p className="font-medium">รอกระบวนการสกัดข้อมูล...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="p-5 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-600 rounded-lg text-white">
                                            <FileText size={20} />
                                        </div>
                                        <h2 className="font-bold text-slate-800">Extracted Table</h2>
                                    </div>
                                    <button 
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                                    >
                                        <Download size={14} /> Export CSV
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto relative">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                                            <tr>
                                                {OUTPUT_COLUMNS.map((col) => (
                                                    <th key={col} className="px-4 py-3 border-r border-slate-700 whitespace-nowrap font-bold">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px] font-mono">
                                            {extractedDataList.map((item, idx) => (
                                                <tr key={idx} className={`border-b border-slate-100 transition-colors ${item['⚠️ ตรวจสอบ?'] ? 'bg-amber-50/50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}>
                                                    {OUTPUT_COLUMNS.map((col) => (
                                                        <td key={col} className={`px-4 py-2 border-r border-slate-100 whitespace-nowrap ${item['⚠️ ตรวจสอบ?'] && col === '⚠️ ตรวจสอบ?' ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                                                            {item[col as keyof ExtractedData]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-bold">
                                    <span>RECORDS: {extractedDataList.length}</span>
                                    {reviewCount > 0 && <span className="text-amber-600">⚠ NEEDS REVIEW: {reviewCount}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend / Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Validation System</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">ระบบจะทำเครื่องหมาย "ควรตรวจสอบ" หากข้อมูลสำคัญอย่าง Legacy ID หรือ Offer Name ขาดหายไป</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                        <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Smart Formatting</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">ข้อมูล Rental Fee จะถูกแปลงเป็นทศนิยม 6 ตำแหน่งอัตโนมัติเพื่อให้ตรงตามมาตรฐานระบบ Billing</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                        <Search className="text-blue-500 shrink-0" size={18} />
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Auto-Detection</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">รองรับทั้งรูปแบบ "รหัสโปรโมชั่น:" และรูปแบบตาราง Tab-Separated จาก Excel/Email</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 py-12 text-center text-white mt-10">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute left-0 top-0 h-64 w-64 animate-pulse rounded-full bg-white blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 h-64 w-64 animate-pulse rounded-full bg-white blur-3xl"></div>
                </div>
                <div className="relative mb-4 flex justify-center gap-8 text-4xl font-black tracking-widest opacity-20">
                    <span>EXTRACT</span>
                    <span className="animate-pulse">DATA</span>
                </div>
                <div className="relative text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} Promotion Tools Hub @ Billone</p>
                    <p className="text-[10px] opacity-50 mt-1 uppercase">Arm & Mos Professional Suite</p>
                </div>
            </footer>
        </div>
    );
}