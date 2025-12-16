"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { FileText, Download, Trash2, Settings, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2'; // <--- Swal ถูก Import แล้ว

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

// --- EXTRACTION LOGIC (UNCHANGED) ---

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

// --- COMPONENT (MODIFIED HANDLERS) ---

export default function PromotionExtractor() {
    const [rawInput, setRawInput] = useState<string>('');
    const [extractedDataList, setExtractedDataList] = useState<ExtractedData[]>([]);
    const [status, setStatus] = useState<string>('Ready to process promotion data');

    const reviewCount = useMemo(() => extractedDataList.filter(d => d['⚠️ ตรวจสอบ?'] === 'ควรตรวจสอบ').length, [extractedDataList]);
    const isProcessed = extractedDataList.length > 0;

    const handleProcess = useCallback(() => {
        setStatus('Processing data...');
        const rawText = rawInput.trim();

        if (!rawText) {
            // ใช้ Swal แทน alert()
            Swal.fire({
                icon: 'warning',
                title: 'ข้อผิดพลาด',
                text: 'กรุณาวางข้อมูลดิบก่อน',
                confirmButtonText: 'ตกลง',
            });
            setStatus('Ready to process promotion data');
            return;
        }

        const promoChunks = rawText.split(/(?=\d{8}:\s*New|โปรโมชั่น\s\d+\s*:)/).map(c => c.trim()).filter(c => c);
        const newExtractedData = promoChunks.map(chunk => masterExtractor(chunk));
        setExtractedDataList(newExtractedData);

        const currentReviewCount = newExtractedData.filter(d => d['⚠️ ตรวจสอบ?']).length;

        let statusMessage = `✓ Processing complete: ${newExtractedData.length} records found`;
        if (currentReviewCount > 0) {
            statusMessage += ` (${currentReviewCount} records require review)`;
            // ใช้ Swal แทน alert()
            Swal.fire({
                icon: 'warning',
                title: 'การตรวจสอบข้อมูล',
                text: `พบ ${currentReviewCount} รายการที่ข้อมูลสำคัญอาจขาดหาย กรุณาตรวจสอบในตาราง`,
                confirmButtonText: 'ตกลง',
            });
        }
        setStatus(statusMessage);
    }, [rawInput]);

    const handleClear = useCallback(() => {
        // ใช้ Swal.fire() พร้อมยืนยันแทน window.confirm()
        Swal.fire({
            title: 'ยืนยันการล้างข้อมูล?',
            text: "ข้อมูลดิบและข้อมูลที่แยกออกมาจะถูกล้างทั้งหมด",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ล้างข้อมูล',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                setRawInput('');
                setExtractedDataList([]);
                setStatus('Ready to process promotion data');
                Swal.fire(
                    'ล้างข้อมูลแล้ว!',
                    'ระบบพร้อมสำหรับข้อมูลใหม่',
                    'success'
                );
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
        link.setAttribute("download", `Promotions_Data_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: 'success',
            title: 'ดาวน์โหลดสำเร็จ!',
            text: `ส่งออกข้อมูล ${extractedDataList.length} รายการไปยังไฟล์ CSV แล้ว`,
            timer: 3000,
            showConfirmButton: false
        });
    }, [extractedDataList]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200 p-4 md:p-6">
            {/* Classic Header */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="text-center py-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg shadow-xl border-b-4 border-amber-600">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500 rounded-lg shadow-lg">
                            <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">
                            Promotion Data Extractor Arm Parin Khamthep And Mosy Thanakrit Chimplipak
                        </h1>
                    </div>
                    <p className="text-slate-300 text-lg font-serif italic">
                        Professional Marketing Data Processing Tool
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="bg-white rounded-b-lg shadow-2xl border-4 border-slate-300">

                    {/* Input Section */}
                    <div className="p-8 bg-gradient-to-b from-slate-50 to-white border-b-2 border-slate-200">
                        <label htmlFor="raw-input" className="flex items-center gap-2 text-lg font-serif font-bold text-slate-800 mb-4">
                            <FileText className="w-5 h-5 text-slate-600" />
                            Raw Data Input:
                        </label>
                        <textarea
                            id="raw-input"
                            rows={12}
                            placeholder="Paste raw promotion data here..."
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                            className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-white shadow-inner focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition outline-none resize-y"
                        />
                    </div>

                    {/* Control Panel */}
                    <div className="p-6 bg-slate-100 border-b-2 border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleProcess}
                                className="flex items-center justify-center gap-2 p-4 font-serif font-bold text-white rounded-lg shadow-lg 
                                        bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-800
                                        hover:from-blue-700 hover:to-blue-800
                                        transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <Settings className="w-5 h-5" />
                                <span>Process Data</span>
                            </button>

                            <button
                                onClick={handleDownload}
                                disabled={!isProcessed}
                                className={`flex items-center justify-center gap-2 p-4 font-serif font-bold rounded-lg shadow-lg transition-all duration-200 ${isProcessed
                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-2 border-emerald-800 hover:from-emerald-700 hover:to-emerald-800 transform hover:scale-[1.02]'
                                        : 'bg-slate-300 text-slate-500 border-2 border-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Download className="w-5 h-5" />
                                <span>Download CSV</span>
                            </button>

                            <button
                                onClick={handleClear}
                                className="flex items-center justify-center gap-2 p-4 font-serif font-bold text-white rounded-lg shadow-lg 
                                        bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-800
                                        hover:from-red-700 hover:to-red-800
                                        transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>Clear Data</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="p-5 bg-white border-b-2 border-slate-200">
                        <div className={`p-4 rounded border-l-4 font-serif ${status.startsWith('✓') ? 'bg-emerald-50 border-emerald-600 text-emerald-800' :
                                status.startsWith('Processing') ? 'bg-blue-50 border-blue-600 text-blue-800' :
                                    'bg-slate-50 border-slate-600 text-slate-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                {status.startsWith('✓') ? <CheckCircle className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                                <p className="font-medium">{status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    {isProcessed && (
                        <div className="p-8 bg-white">
                            <div className="mb-6 pb-4 border-b-2 border-slate-300">
                                <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-amber-600 rounded"></div>
                                    Extraction Results
                                    {reviewCount > 0 && (
                                        <span className="text-base font-normal text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                            {reviewCount} require review
                                        </span>
                                    )}
                                </h2>
                            </div>

                            <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-lg">
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full border-collapse">
                                        <thead className="bg-slate-700 sticky top-0">
                                            <tr>
                                                {OUTPUT_COLUMNS.map((col) => (
                                                    <th
                                                        key={col}
                                                        className="px-4 py-3 text-left text-sm font-serif font-bold text-white border-r border-slate-600 whitespace-nowrap"
                                                    >
                                                        {col === '⚠️ ตรวจสอบ?' && <AlertTriangle className="inline w-4 h-4 mr-1" />}
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {extractedDataList.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-slate-200 transition-colors ${item['⚠️ ตรวจสอบ?']
                                                            ? 'bg-amber-50 hover:bg-amber-100'
                                                            : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {OUTPUT_COLUMNS.map((col) => (
                                                        <td
                                                            key={col}
                                                            className="px-4 py-3 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap font-mono"
                                                        >
                                                            {item[col as keyof ExtractedData]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pb-6">
                    <p className="text-slate-600 text-sm font-serif italic">
                        Professional Data Extraction System • Supports Multiple Input Formats
                    </p>
                </div>
            </main>
        </div>
    );
}