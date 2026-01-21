"use client";

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2, Shuffle, X, Database,
  Filter, Download, RefreshCw, AlertCircle, 
  BarChart3, Search, ArrowLeft, Layers, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function SuperDataMapper() {
  const [file1Data, setFile1Data] = useState<any[]>([]);
  const [file2Data, setFile2Data] = useState<any[]>([]);
  const [fileName1, setFileName1] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [availableCols, setAvailableCols] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<any[] | null>(null);
  const [stats, setStats] = useState({ total: 0, matched: 0 });

  // LOGIC
  const normalizeMSISDN = (val: any) => {
    let str = String(val || "").trim();
    if (!str) return "";
    return str.replace(/^66|^0/, "");
  };

  const isValidColumn = (colName: string) => {
    return colName && !colName.startsWith('__EMPTY') && colName.trim() !== "";
  };

  const handleFileUpload = async (file: File, isPrimary: boolean) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'xlsx' || ext === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
        updateDataState(json, file.name, isPrimary);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: any[] }) => updateDataState(results.data, file.name, isPrimary),
        });
      }
    } catch (err) {
      Swal.fire("Error", "ไม่สามารถอ่านไฟล์ได้", "error");
    }
  };

  const updateDataState = (data: any[], name: string, isPrimary: boolean) => {
    if (isPrimary) {
      setFile1Data(data);
      setFileName1(name);
      setResultData(null);
    } else {
      setFile2Data(data);
      setFileName2(name);
      if (data.length > 0) {
        const cols = Object.keys(data[0]).filter(k =>
          k.toUpperCase() !== 'MSISDN' && isValidColumn(k)
        );
        setAvailableCols(cols);
      }
      setResultData(null);
    }
  };

  const handleProcess = () => {
    if (file1Data.length === 0 || file2Data.length === 0) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const refMap = new Map();
        let matchCount = 0;

        file2Data.forEach(row => {
          const msisdnKey = Object.keys(row).find(k => k.toUpperCase() === 'MSISDN');
          const key = normalizeMSISDN(msisdnKey ? row[msisdnKey] : "");
          if (key) refMap.set(key, row);
        });

        const merged = file1Data.map(row1 => {
          const msisdnKeyName = Object.keys(row1).find(k => k.toUpperCase() === 'MSISDN');
          const msisdnVal = normalizeMSISDN(msisdnKeyName ? row1[msisdnKeyName] : "");
          const match = refMap.get(msisdnVal);
          if (match) matchCount++;

          const newRow: any = { ...row1 };
          selectedColumns.forEach(col => {
            newRow[col] = match ? match[col] : "N/A";
          });
          return newRow;
        });

        setStats({ total: merged.length, matched: matchCount });
        setResultData(merged);
        Swal.fire({ icon: 'success', title: 'Mapping Complete', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire("Error", "เกิดข้อผิดพลาดในการรวมข้อมูล", "error");
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  const downloadResult = () => {
    if (!resultData) return;
    const ws = XLSX.utils.json_to_sheet(resultData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mapped_Data");
    XLSX.writeFile(wb, `Mapped_${fileName1.split('.')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* --- HEADER --- */}
      <header className="bg-slate-800 py-14 px-6 relative shadow-xl overflow-hidden">
        <div className="absolute top-8 left-8">
          <Link href="/mainocs" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 text-white"><ArrowLeft size={18} /></div>
            <span className="font-bold text-sm tracking-wide">Back to Hub</span>
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4 text-white">
            <Shuffle size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Data Mapper <span className="text-indigo-400 font-light">Automation</span>
          </h1>
          <p className="opacity-70 mt-3 text-white font-light max-w-lg mx-auto italic">
            "Smart VLookup based on MSISDN normalization logic"
          </p>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Config */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Step 1: Upload */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">File Configuration</h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Main File */}
                <div className={`p-5 rounded-2xl border-2 border-dashed transition-all ${file1Data.length ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Main Base File</p>
                   {file1Data.length === 0 ? (
                      <label className="flex flex-col items-center py-2 cursor-pointer group">
                        <Database className="text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-slate-400">Select Base File</span>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} />
                      </label>
                   ) : (
                      <div className="flex items-center justify-between font-bold text-xs text-slate-700 bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="truncate max-w-[180px]">{fileName1}</span>
                        <X className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500" onClick={() => setFile1Data([])} />
                      </div>
                   )}
                </div>

                {/* Ref File */}
                <div className={`p-5 rounded-2xl border-2 border-dashed transition-all ${file2Data.length ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Reference File</p>
                   {file2Data.length === 0 ? (
                      <label className="flex flex-col items-center py-2 cursor-pointer group">
                        <Filter className="text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-slate-400">Select Ref File</span>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)} />
                      </label>
                   ) : (
                      <div className="flex items-center justify-between font-bold text-xs text-slate-700 bg-white p-2 rounded-xl border border-blue-100">
                        <span className="truncate max-w-[180px]">{fileName2}</span>
                        <X className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500" onClick={() => { setFile2Data([]); setAvailableCols([]); setSelectedColumns([]); }} />
                      </div>
                   )}
                </div>
              </div>
            </section>

            {/* Step 2: Column Selection */}
            <section className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-opacity ${availableCols.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Map Columns</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                  {availableCols.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                        selectedColumns.includes(col) ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                      }`}
                    >
                      <span className="truncate">{col}</span>
                      {selectedColumns.includes(col) && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Process Button */}
            <button 
              disabled={file1Data.length === 0 || selectedColumns.length === 0 || isProcessing}
              onClick={handleProcess}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <><Shuffle size={18} /> Start Mapping Process</>}
            </button>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-8">
             {!resultData ? (
                <div className="h-[700px] bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <div className="p-6 bg-slate-50 rounded-full mb-4">
                    <FileSpreadsheet size={48} strokeWidth={1} />
                  </div>
                  <p className="font-bold text-slate-600">Waiting for Configuration</p>
                  <p className="text-xs mt-2 opacity-60">อัปโหลดไฟล์และเลือกคอลัมน์ที่ต้องการดึงข้อมูลเพื่อเริ่มการประมวลผล</p>
                </div>
             ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl"><Layers size={20} /></div>
                         <div>
                            <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest leading-none">Mapping Preview</h2>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">Total Processed: {stats.total.toLocaleString()} rows</p>
                         </div>
                      </div>
                      <button onClick={downloadResult} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                        <Download size={14} /> Export Excel
                      </button>
                   </div>

                   <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                      <table className="w-full text-left border-separate border-spacing-0">
                         <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                               {Object.keys(resultData[0]).map(col => (
                                  <th key={col} className="px-5 py-4 border-r border-slate-700 whitespace-nowrap font-bold">{col}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody className="text-[11px] font-mono">
                            {resultData.slice(0, 50).map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  {Object.values(item).map((val: any, i) => (
                                     <td key={i} className={`px-5 py-3 border-b border-r border-slate-100 whitespace-nowrap ${val === 'N/A' ? 'text-red-400' : 'text-slate-500'}`}>
                                        {val}
                                     </td>
                                  ))}
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {resultData.length > 50 && (
                         <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                            Showing first 50 records. Download full file to see all data.
                         </div>
                      )}
                   </div>

                   <div className="p-4 bg-slate-900 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Match Accuracy</span>
                           <span className="text-sm font-black text-emerald-400 leading-none">
                              {Math.round((stats.matched / stats.total) * 100)}%
                           </span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${(stats.matched / stats.total) * 100}%` }}></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Data Processor Active</span>
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Legend / Info */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'MSISDN Normalization', desc: 'ระบบตัดเลข 0 และ 66 อัตโนมัติเพื่อให้การ Match แม่นยำที่สุด' },
              { icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Multi-Format Support', desc: 'รองรับไฟล์ .xlsx, .xls และ .csv ทั้งแบบ Comma และ Tab Delimited' },
              { icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50', title: 'O(n) Performance', desc: 'ใช้ Hash Map ในการประมวลผล สามารถรองรับข้อมูลหลักแสนแถวได้ในเสี้ยววินาที' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}><item.icon size={20} /></div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold opacity-70">{item.desc}</p>
                  </div>
              </div>
            ))}
        </div>
      </main>

      <footer className="py-12 text-center opacity-30 mt-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Internal Engineering Unit • Billone Professional Suite</p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}