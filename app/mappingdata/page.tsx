"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, Shuffle, X, Settings, Database, 
  Filter, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function SuperDataMapper() {
  const [file1Data, setFile1Data] = useState<any[]>([]); 
  const [file2Data, setFile2Data] = useState<any[]>([]); 
  const [fileName1, setFileName1] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [availableCols, setAvailableCols] = useState<string[]>([]); 
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<any[] | null>(null);

  // ปรับรูปแบบเบอร์โทรให้พร้อมสำหรับการ Match (ตัด 0 และ 66 นำหน้า)
  const normalizeMSISDN = (val: any) => {
    let str = String(val || "").trim();
    if (!str) return "";
    return str.replace(/^66|^0/, "");
  };

  // ตรวจสอบคอลัมน์ขยะและค่าว่างป้องกัน Error ในหัวตาราง
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
        // กรองหัวตารางเฉพาะที่ใช้งานได้และไม่ใช่คีย์หลัก (MSISDN)
        const cols = Object.keys(data[0]).filter(k => 
          k.toUpperCase() !== 'MSISDN' && isValidColumn(k)
        );
        setAvailableCols(cols);
      }
      setResultData(null);
    }
  };

  // ประมวลผลรวมข้อมูลโดยใช้ระบบ Hash Map เพื่อความเร็วสูงสุด (O(n))
  const handleProcess = () => {
    if (file1Data.length === 0 || file2Data.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        // สร้างตารางอ้างอิงสำหรับการค้นหา (Index Mapping)
        const refMap = new Map();
        file2Data.forEach(row => {
          const key = normalizeMSISDN(row.MSISDN);
          if (key) refMap.set(key, row);
        });

        // สร้างชุดข้อมูลใหม่โดยดึงเฉพาะคอลัมน์ที่เลือก
        const merged = file1Data.map(row1 => {
          const msisdnKey = normalizeMSISDN(row1.MSISDN);
          const match = refMap.get(msisdnKey);
          
          const newRow: any = {};
          // เก็บเฉพาะข้อมูลจริงจากไฟล์หลัก (ตัดคอลัมน์ขยะออก)
          Object.keys(row1).forEach(key => {
            if (isValidColumn(key)) {
              newRow[key] = row1[key];
            }
          });

          // เติมข้อมูลใหม่จากไฟล์อ้างอิงเฉพาะคอลัมน์ที่ผู้ใช้กดเลือก
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
    }, 200);
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
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-6 px-8 shadow-sm mb-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
              <Shuffle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Pro Mapper Engine <span className="text-purple-600">v2.5 (Clean)</span></h1>
              <p className="text-slate-500 text-sm font-medium italic underline">Auto-Clean Empty Columns Active</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <header className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">1</div>
                <h2 className="text-xl font-bold">อัปโหลดไฟล์งาน</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className={`p-6 rounded-3xl border-2 border-dashed transition-all ${file1Data.length ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-purple-400'}`}>
                   <h3 className="font-bold text-sm text-slate-400 mb-4 uppercase tracking-widest">ไฟล์หลัก (Base Data)</h3>
                   {file1Data.length === 0 ? (
                     <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                        <Database className="w-12 h-12 text-slate-300 mb-2" />
                        <span className="text-slate-600 font-bold">เลือกไฟล์ 1</span>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} />
                     </label>
                   ) : (
                     <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-emerald-700 max-w-[150px]">{fileName1}</span>
                        <button onClick={() => setFile1Data([])} className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600"><X className="w-5 h-5"/></button>
                     </div>
                   )}
                </div>

                <div className={`p-6 rounded-3xl border-2 border-dashed transition-all ${file2Data.length ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-purple-400'}`}>
                   <h3 className="font-bold text-sm text-slate-400 mb-4 uppercase tracking-widest">ไฟล์อ้างอิง (Reference)</h3>
                   {file2Data.length === 0 ? (
                     <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                        <Filter className="w-12 h-12 text-slate-300 mb-2" />
                        <span className="text-slate-600 font-bold">เลือกไฟล์ 2</span>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)} />
                     </label>
                   ) : (
                     <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-blue-700 max-w-[150px]">{fileName2}</span>
                        <button onClick={() => {setFile2Data([]); setAvailableCols([]); setSelectedColumns([]);}} className="p-2 hover:bg-blue-100 rounded-full text-blue-600"><X className="w-5 h-5"/></button>
                     </div>
                   )}
                </div>
              </div>
            </section>

            {availableCols.length > 0 && (
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-5">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">2</div>
                    <h2 className="text-xl font-bold">เลือกข้อมูลที่จะดึงมาเพิ่ม</h2>
                  </div>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableCols.map(col => (
                    <button key={col} onClick={() => handleColumnToggle(col)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center justify-between ${selectedColumns.includes(col) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}>
                      {col}
                      {selectedColumns.includes(col) && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl sticky top-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400 italic">Execution Panel</h3>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 text-sm">Base Rows</span>
                  <span className="font-mono">{file1Data.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 text-sm">Added Cols</span>
                  <span className="font-mono text-blue-400">{selectedColumns.length}</span>
                </div>
              </div>

              {!resultData ? (
                <button
                  onClick={handleProcess}
                  disabled={file1Data.length === 0 || file2Data.length === 0 || selectedColumns.length === 0 || isProcessing}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : "Run Integration"}
                </button>
              ) : (
                <div className="space-y-4 animate-in zoom-in">
                  <button onClick={downloadResult} className="w-full py-5 rounded-2xl bg-emerald-500 font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                    <Download /> Download Result
                  </button>
                  <button onClick={() => window.location.reload()} className="w-full text-slate-500 font-bold hover:text-white transition-colors text-xs underline">เริ่มใหม่ (Reset)</button>
                </div>
              )}

              <div className="mt-8 p-4 bg-slate-800/40 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  <b>Clean Export Policy:</b> ระบบจะดึงเฉพาะคอลัมน์ที่คุณเลือกจากไฟล์ 2 เท่านั้น และทำการลบคอลัมน์ว่างออกจากไฟล์หลักให้อัตโนมัติ เพื่อให้ได้ไฟล์ Excel ที่สะอาดที่สุด
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}