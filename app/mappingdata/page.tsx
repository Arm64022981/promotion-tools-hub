"use client";

import React, { useState } from 'react';
import {
  CheckCircle2, Shuffle, X, Database,
  Filter, Download, RefreshCw, AlertCircle, ArrowLeft, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Link from 'next/link';

export default function SuperDataMapper() {
  const [file1Data, setFile1Data] = useState<any[]>([]);
  const [file2Data, setFile2Data] = useState<any[]>([]);
  const [fileName1, setFileName1] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [availableCols, setAvailableCols] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<any[] | null>(null);

  // LOGIC FUNCTIONS (คงเดิมเพื่อความถูกต้องของระบบ)
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
          delimiter: "|",
          complete: (results: { data: any[] }) => updateDataState(results.data, file.name, isPrimary),
        });
      }
    } catch (err) {
      alert("ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์");
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
        file2Data.forEach(row => {
          const key = normalizeMSISDN(row.MSISDN);
          if (key) refMap.set(key, row);
        });

        const merged = file1Data.map(row1 => {
          const msisdnKey = normalizeMSISDN(row1.MSISDN);
          const match = refMap.get(msisdnKey);
          const newRow: any = {};
          Object.keys(row1).forEach(key => {
            if (isValidColumn(key)) newRow[key] = row1[key];
          });
          selectedColumns.forEach(col => {
            newRow[col] = match ? match[col] : "N/A";
          });
          return newRow;
        });
        setResultData(merged);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการรวมข้อมูล");
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  const downloadResult = () => {
    if (!resultData) return;
    const ws = XLSX.utils.json_to_sheet(resultData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mapped_Data");
    XLSX.writeFile(wb, `Cleaned_Integrated_${fileName1.split('.')[0]}.xlsx`);
  };

  const handleColumnToggle = (col: string) => {
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans">
      {/* Navbar สไตล์ Slate-700 เหมือนหน้าหลัก */}
      <nav className="bg-slate-800 text-white shadow-xl border-b border-slate-700 py-5 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-300" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
                <Shuffle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Data Mapper <span className="text-purple-400 font-light">Pro Suite</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Vlookup Automation & Cleaning</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ส่วนซ้าย: File Upload & Column Selection */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Upload Section */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Layers className="w-32 h-32" />
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-md">1</div>
                <h2 className="text-lg font-bold text-slate-700">Source Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* File 1 */}
                <div className={`group relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${file1Data.length ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}>
                  <h3 className={`font-bold text-[11px] mb-4 uppercase tracking-widest ${file1Data.length ? 'text-emerald-600' : 'text-slate-400'}`}>Main File (Base)</h3>
                  {file1Data.length === 0 ? (
                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer group">
                      <Database className="w-10 h-10 text-slate-300 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-600 font-bold text-sm">Select Primary File</span>
                      <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="font-bold truncate text-slate-700 text-sm">{fileName1}</span>
                      </div>
                      <button onClick={() => setFile1Data([])} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* File 2 */}
                <div className={`group relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${file2Data.length ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}>
                  <h3 className={`font-bold text-[11px] mb-4 uppercase tracking-widest ${file2Data.length ? 'text-blue-600' : 'text-slate-400'}`}>Reference File</h3>
                  {file2Data.length === 0 ? (
                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer group">
                      <Filter className="w-10 h-10 text-slate-300 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-600 font-bold text-sm">Select Reference File</span>
                      <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="font-bold truncate text-slate-700 text-sm">{fileName2}</span>
                      </div>
                      <button onClick={() => { setFile2Data([]); setAvailableCols([]); setSelectedColumns([]); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Column Picker */}
            {availableCols.length > 0 && (
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-sm border border-purple-200">2</div>
                    <h2 className="text-lg font-bold text-slate-700">Mapping Selection</h2>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {selectedColumns.length} Selected
                  </span>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableCols.map(col => (
                    <button
                      key={col}
                      onClick={() => handleColumnToggle(col)}
                      className={`group px-4 py-3 rounded-xl text-[11px] font-bold border-2 transition-all flex items-center justify-between ${selectedColumns.includes(col)
                          ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-purple-200 hover:bg-purple-50/30'
                        }`}
                    >
                      <span className="truncate mr-2">{col}</span>
                      {selectedColumns.includes(col) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3 h-3 rounded-full border border-slate-300 group-hover:border-purple-400" />}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ส่วนขวา: Control Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 sticky top-28">
              <h3 className="text-sm font-black mb-6 text-slate-400 uppercase tracking-widest border-b pb-4">Execution Panel</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-medium italic">Base Rows Count</span>
                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold">{file1Data.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-medium italic">Additional Columns</span>
                  <span className="font-mono text-sm bg-purple-50 px-2 py-1 rounded text-purple-600 font-bold">+{selectedColumns.length}</span>
                </div>
              </div>

              {!resultData ? (
                <button
                  onClick={handleProcess}
                  disabled={file1Data.length === 0 || file2Data.length === 0 || selectedColumns.length === 0 || isProcessing}
                  className="group w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
                >
                  {isProcessing ? <RefreshCw className="animate-spin w-4 h-4" /> : (
                    <>
                      <span>Run Integration</span>
                      <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <button onClick={downloadResult} className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all">
                    <Download className="w-4 h-4" /> Download Result
                  </button>
                  <button onClick={() => window.location.reload()} className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs underline decoration-dotted">
                    Reset & Start Over
                  </button>
                </div>
              )}

              <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  <b className="block mb-1 underline">Smart Mapping Active</b>
                  ระบบใช้ Hash Map O(n) ประมวลผลได้รวดเร็วแม้ข้อมูลหลักแสนบรรทัด พร้อมระบบ Auto-Clean ลบคอลัมน์ขยะและจัดฟอร์แมต MSISDN ให้อัตโนมัติ
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer เล็กๆ ให้เข้าชุด */}
      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase italic">Professional Automation Suite • Billone Team</p>
      </footer>
    </div>
  );
}