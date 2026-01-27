"use client";

import React, { useState, useMemo, useCallback, memo } from 'react';
import * as XLSX from 'xlsx';
import {
  Download, ArrowLeft, Search, Filter, Check, Layers, FileUp, RefreshCcw, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const DataRow = memo(({ row, idx }: { row: any, idx: number }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50">
    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{row['Primary Offering']}</td>
    <td className="px-6 py-4 text-xs font-semibold text-slate-600 truncate max-w-[250px]">{row['PO']}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className={`w-1.5 h-1.5 rounded-full ${String(row['PO STATUS']).includes('อนุมัติ') ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{row['PO STATUS']}</span>
      </div>
    </td>
    <td className="px-6 py-4 font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50/20">{row['Attached Offering']}</td>
    <td className="px-6 py-4 text-xs font-bold text-slate-800 truncate max-w-[250px]">{row['SO']}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{row['SO STATUS'] || '-'}</span>
      </div>
    </td>
  </tr>
));
DataRow.displayName = 'DataRow';

export default function RelationshipManagerSmooth() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");

  const columns = useMemo(() => [
    { key: 'Primary Offering', label: 'Primary ID', width: '130px' },
    { key: 'PO', label: 'Primary Name', width: '250px' },
    { key: 'PO STATUS', label: 'PO Status', width: '170px' },
    { key: 'Attached Offering', label: 'Attached ID', width: '130px' },
    { key: 'SO', label: 'Attached Name', width: '250px' },
    { key: 'SO STATUS', label: 'SO Status', width: '170px' }
  ], []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
      const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      setRawData(data);
      setFilters({});
    };
    reader.readAsBinaryString(file);
  }, []);

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return rawData;
    return rawData.filter(row =>
      Object.entries(filters).every(([key, selectedValues]) =>
        selectedValues.length === 0 || selectedValues.includes(String(row[key]))
      )
    );
  }, [rawData, filters]);

  const columnUniqueValues = useMemo(() => {
    const uniqueMap: { [key: string]: string[] } = {};
    if (rawData.length === 0) return uniqueMap;

    columns.forEach(col => {
      const values = new Set<string>();
      for (let i = 0; i < rawData.length; i++) {
        const val = rawData[i][col.key];
        if (val !== undefined && val !== null && val !== "") {
          values.add(String(val));
        }
      }
      uniqueMap[col.key] = Array.from(values).sort();
    });
    return uniqueMap;
  }, [rawData, columns]);

  const toggleFilterValue = useCallback((columnKey: string, value: string) => {
    setFilters(prev => {
      const current = prev[columnKey] || [];
      const isSelected = current.includes(value);
      return {
        ...prev,
        [columnKey]: isSelected ? current.filter(v => v !== value) : [...current, value]
      };
    });
  }, []);

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new();
    
    const primaryId = filters['Primary Offering']?.[0] ||
      (filteredData.length > 0 ? filteredData[0]['Primary Offering'] : 'Data');

    const fileName = `ALLRelations_${primaryId}.xlsx`;

    const attachedData = filteredData.map(row => ({
      'Depended By ID': row['Primary Offering'],
      'Depended By Name': row['PO'],
      'Depend Id': row['Attached Offering'],
      'Depend Name': row['SO'],
      'Relation Type': 'o'
    }));

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Master Id', 'Master Name', 'Slave Id', 'Slave Name', 'Relation Type', 'Control Flag']]), "Dependent");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attachedData), "Attached");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Offering Id', 'Offering Name', 'Replace Offering Id', 'Replace Offering Name', 'Replace Type', 'Replace Rule', 'Effect Mode', 'Contract Continue', 'Plan', 'Replace Mode']]), "Replacement");

    // 2. ใช้ fileName ที่เราตั้งไว้
    XLSX.writeFile(wb, fileName);
  }, [filteredData, filters]); // เพิ่ม filters เข้าไปใน dependency array ด้วย

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-emerald-100">
      <header className="bg-slate-800/95 backdrop-blur-md px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg border-b border-slate-700">
        <div className="flex items-center gap-5">
          <Link href="/mainocs" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-all active:scale-95">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-emerald-400" />
            Relationship Manager
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setFilters({})} className="px-3 py-2 text-slate-400 hover:text-white text-xs font-bold transition-all active:opacity-70">
            <RefreshCcw size={14} className="inline mr-1" /> Reset
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl cursor-pointer transition-all active:scale-95 text-xs font-bold border border-slate-600 shadow-sm">
            <FileUp size={16} /> Import
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
          </label>
          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95 text-xs font-bold shadow-lg shadow-emerald-900/20"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        <div className="flex gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex-1 shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-colors ${rawData.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promotion Logic</p>
              <p className="text-sm font-bold text-slate-700">
                {rawData.length > 0 ? 'ยืนยันการสร้างโปรโมชั่นแล้ว' : 'รอการนำเข้าข้อมูล...'}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded-2xl w-64 shadow-xl text-right flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filtered Items</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tighter">{filteredData.length.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-250px)]">
            <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
              <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm shadow-sm">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={{ width: col.width }} className="px-6 py-4 relative group border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{col.label}</span>
                        <button
                          onClick={() => { setActiveFilterDropdown(activeFilterDropdown === col.key ? null : col.key); setLocalSearch(""); }}
                          className={`p-1.5 rounded-lg transition-all ${filters[col.key]?.length > 0 ? 'bg-emerald-500 text-white scale-110 shadow-md' : 'text-slate-300 hover:text-slate-600'}`}
                        >
                          <Filter size={12} />
                        </button>
                      </div>

                      {activeFilterDropdown === col.key && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 duration-200">
                          <div className="relative mb-3">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              autoFocus type="text" placeholder="Quick search..."
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                            {columnUniqueValues[col.key]?.filter(opt => opt.toLowerCase().includes(localSearch.toLowerCase())).map(val => (
                              <div key={val} onClick={() => toggleFilterValue(col.key, val)} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group/item">
                                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${filters[col.key]?.includes(val) ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-slate-300 group-hover/item:border-emerald-300'}`}>
                                  {filters[col.key]?.includes(val) && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className="text-xs text-slate-600 font-semibold truncate leading-none">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.slice(0, 200).map((row, idx) => (
                    <DataRow key={idx} row={row} idx={idx} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Layers size={48} className="text-slate-400" />
                        <p className="text-sm font-bold italic tracking-widest uppercase">No Records Available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        tr { transition: background-color 0.15s ease-out; }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}