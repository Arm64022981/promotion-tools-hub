"use client";

import React, { useState, useCallback } from 'react';
import { 
  Upload, FileCode, FileSpreadsheet, CheckCircle2, 
  AlertCircle, Shuffle, X, Settings, Database, 
  Filter, Download, RefreshCw 
} from 'lucide-react';

export default function SuperDataMapper() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // จำลองคอลัมน์ที่ตรวจพบจากไฟล์อ้างอิง (ในระบบจริงจะมาจากการอ่านไฟล์ Preview)
  const mockDetectedColumns = ['IMSI', 'PREFIX_IMSI', 'PAYMENT_MODE', 'STATUS', 'NETWORK_TYPE', 'C_PORT_IN_FLAG'];

  const handleColumnToggle = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleProcess = () => {
    if (!file1 || !file2) return;
    setIsProcessing(true);
    // ส่งข้อมูลไปประมวลผลที่ Backend
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  const FileBox = ({ file, setFile, title, type }: any) => (
    <div className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 bg-white shadow-sm
      ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-purple-400 border-dashed'}`}>
      
      {file && (
        <button onClick={() => setFile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${file ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
          {type === 'main' ? <Database className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{file ? file.name : 'รองรับ XLSX, CSV, TXT, JSON'}</p>
        </div>
        {!file && (
          <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800">
            เลือกไฟล์
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
              <Shuffle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pro Mapper Engine v2</h1>
              <p className="text-slate-500 text-sm">Advanced MSISDN Data Integration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            Auto-detecting separators
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: File Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold italic">
                <Settings className="w-5 h-5 text-purple-600" />
                Step 1: อัปโหลดไฟล์ที่ต้องการจัดการ
              </div>
              <div className="space-y-4">
                <FileBox title="ไฟล์หลัก (Primary Source)" file={file1} setFile={setFile1} type="main" />
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                    <Shuffle className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
                <FileBox title="ไฟล์ข้อมูลอ้างอิง (Reference Data)" file={file2} setFile={setFile2} type="ref" />
              </div>
            </div>

            {/* Middle: Configuration */}
            {file2 && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-slate-800 font-bold italic">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Step 2: เลือกคอลัมน์ที่ต้องการเพิ่ม (Custom Columns)
                  </div>
                  <button 
                    onClick={() => setSelectedColumns(mockDetectedColumns)}
                    className="text-xs text-purple-600 font-bold hover:underline"
                  >
                    เลือกทั้งหมด
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mockDetectedColumns.map((col) => (
                    <button
                      key={col}
                      onClick={() => handleColumnToggle(col)}
                      className={`px-4 py-3 rounded-2xl text-sm font-bold border-2 transition-all text-left flex justify-between items-center
                        ${selectedColumns.includes(col) 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                    >
                      {col}
                      {selectedColumns.includes(col) && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions & Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl sticky top-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                <Download className="w-6 h-6" />
                Execution Panel
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-serif italic">Matching Key:</span>
                  <span className="font-mono text-emerald-400">MSISDN</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-serif italic">Additional Cols:</span>
                  <span className="font-mono">{selectedColumns.length} items</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-serif italic">Merge Method:</span>
                  <span className="font-mono">Left Join</span>
                </div>
              </div>

              {!isSuccess ? (
                <button
                  onClick={handleProcess}
                  disabled={!file1 || !file2 || selectedColumns.length === 0 || isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
                    ${!file1 || !file2 || selectedColumns.length === 0 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] shadow-lg shadow-purple-500/20 active:scale-95'}`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Shuffle className="w-5 h-5" />
                      Run Integration
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3 animate-in zoom-in duration-300">
                  <button className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                    <Download className="w-6 h-6" />
                    Download XLSX
                  </button>
                  <button 
                    onClick={() => {setFile1(null); setFile2(null); setIsSuccess(false); setSelectedColumns([]);}}
                    className="w-full bg-slate-800 py-3 rounded-2xl font-bold text-slate-400 text-sm"
                  >
                    เริ่มการทำงานใหม่
                  </button>
                </div>
              )}

              <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-slate-400 leading-relaxed font-serif italic">
                    ระบบจะทำ <b>Data Normalization</b> ให้โดยอัตโนมัติ (เช่น ตัดช่องว่าง, แปลงรูปแบบเบอร์โทร) เพื่อเพิ่มอัตราการ Match ให้สูงสุด
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}