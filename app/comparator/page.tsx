"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { FileText, CheckCircle, GitCompare, Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

// --- CORE LOGIC ---
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

/**
 * Compares two strings line-by-line and returns the differences.
 * @param content1 Content of the first file.
 * @param content2 Content of the second file.
 * @returns Comparison result object.
 */
function compareContents(content1: string, content2: string): CompareResult {
    // Split content into lines, handling both \r\n (Windows) and \n (Unix/Mac) line endings.
    const lines1 = content1.split(/\r?\n/);
    const lines2 = content2.split(/\r?\n/);

    const len1 = lines1.length;
    const len2 = lines2.length;
    const maxLines = Math.max(len1, len2);
    const diffLines: DiffLine[] = [];

    for (let i = 0; i < maxLines; i++) {
        const lineNum = i + 1;
        // Use a placeholder for lines that only exist in one file (insertion/deletion).
        const line1 = i < len1 ? lines1[i] : "<Missing Line (Document A)>";
        const line2 = i < len2 ? lines2[i] : "<Missing Line (Document B)>";

        if (line1 !== line2) {
            diffLines.push({
                lineNum,
                file1Content: line1,
                file2Content: line2,
            });
        }
    }

    return {
        maxLines,
        diffCount: diffLines.length,
        diffLines,
    };
}

// --- COMPONENT ---
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
    const [status, setStatus] = useState<string>('Please upload two text files to begin comparison');

    const isReady = useMemo(() => fileA.file !== null && fileB.file !== null, [fileA.file, fileB.file]);

    const handleFileChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        setFileState: React.Dispatch<React.SetStateAction<FileState>>,
        setFileName: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.txt')) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setFileState({ file, content });
                setStatus(`File "${file.name}" uploaded successfully`);
                setResult(null); // Reset result on new file upload
            };
            // Read file content as text using UTF-8 encoding
            reader.readAsText(file, 'utf-8');
        } else if (file) {
            // Replaced alert() with Swal
            Swal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: 'Please select a .txt file only.',
                confirmButtonColor: '#f59e0b',
            });
            setFileState(INITIAL_FILE_STATE);
            setFileName(setFileName === setFileNameA ? 'Document A' : 'Document B');
        }
    }, [setFileNameA, setFileNameB]);

    const handleCompare = useCallback(() => {
        if (!isReady) {
            // Replaced alert() with Swal
            Swal.fire({
                icon: 'warning',
                title: 'Missing Files',
                text: 'Please upload both .txt files before comparison.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        setStatus('Processing comparison...');

        try {
            const compareResult = compareContents(fileA.content, fileB.content);
            setResult(compareResult);

            if (compareResult.diffCount === 0) {
                setStatus(`✓ Comparison complete: Files are identical (${compareResult.maxLines} lines)`);
                Swal.fire({
                    icon: 'success',
                    title: 'Files are Identical!',
                    text: `No differences found across ${compareResult.maxLines} lines.`,
                    confirmButtonColor: '#10b981',
                });
            } else {
                setStatus(`✓ Comparison complete: ${compareResult.diffCount} differences found`);
                Swal.fire({
                    icon: 'info',
                    title: 'Comparison Complete',
                    text: `${compareResult.diffCount} differences found across ${compareResult.maxLines} lines.`,
                    confirmButtonColor: '#f59e0b',
                });
            }
        } catch (error) {
            console.error(error);
            setStatus('⚠ An error occurred during processing');
            Swal.fire({
                icon: 'error',
                title: 'Comparison Error',
                text: 'An unexpected error occurred during the comparison process.',
                confirmButtonColor: '#ef4444',
            });
        }
    }, [isReady, fileA.content, fileB.content]);

    const handleClear = useCallback(() => {
        // Replaced window.confirm() with Swal
        Swal.fire({
            title: 'Are you sure?',
            text: "This will clear both uploaded documents and the comparison results.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, clear all!'
        }).then((result) => {
            if (result.isConfirmed) {
                setFileA(INITIAL_FILE_STATE);
                setFileB(INITIAL_FILE_STATE);
                setFileNameA('Document A');
                setFileNameB('Document B');
                setResult(null);
                setStatus('Please upload two text files to begin comparison');
                Swal.fire(
                    'Cleared!',
                    'All data has been reset.',
                    'success'
                );
            }
        });
    }, []);

    const handleDownloadReport = useCallback(() => {
        if (!result || result.diffCount === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Report to Export',
                text: 'There are no differences to report, or the comparison hasn\'t been run.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        let reportContent = "FILE COMPARISON REPORT\n";
        reportContent += "═══════════════════════════════════════════════\n";
        reportContent += `Document 1: ${fileNameA} (${fileA.content.split(/\r?\n/).length} lines)\n`;
        reportContent += `Document 2: ${fileNameB} (${fileB.content.split(/\r?\n/).length} lines)\n`;
        reportContent += `Total Differences: ${result.diffCount}\n`;
        reportContent += "═══════════════════════════════════════════════\n\n";

        result.diffLines.forEach(diff => {
            reportContent += `Line ${diff.lineNum}:\n`;
            reportContent += `  [${fileNameA}] ${diff.file1Content}\n`;
            reportContent += `  [${fileNameB}] ${diff.file2Content}\n\n`;
        });

        // Create a downloadable blob
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        link.setAttribute("href", url);
        link.setAttribute("download", `comparison_report_${today}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'Report Exported!',
            text: 'Comparison report downloaded as a .txt file.',
            confirmButtonColor: '#f59e0b',
        });

    }, [result, fileNameA, fileNameB, fileA.content, fileB.content]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200 p-6">
            {/* Classic Header */}
            <header className="max-w-5xl mx-auto mb-10">
                <div className="text-center py-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg shadow-lg border-b-4 border-amber-600">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <GitCompare className="w-10 h-10 text-amber-500" strokeWidth={2} />
                        <h1 className="text-4xl font-serif font-bold text-white tracking-wide">
                            File Comparator @ Billone
                        </h1>
                    </div>
                    <p className="text-slate-300 text-lg font-serif italic">
                        Line-by-Line Text Document Analysis Tool
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                {/* Main Content Card */}
                <div className="bg-white rounded-b-lg shadow-2xl border-4 border-slate-300">

                    {/* Upload Section */}
                    <div className="p-8 bg-gradient-to-b from-slate-50 to-white border-b-2 border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* File A */}
                            <div className={`relative border-3 rounded-lg transition-all duration-300 ${fileA.file
                                    ? 'border-emerald-600 bg-emerald-50 shadow-lg'
                                    : 'border-slate-400 bg-slate-50 hover:border-slate-600 hover:shadow-md'
                                }`}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                        <h3 className="text-lg font-serif font-bold text-slate-800">{fileNameA}</h3>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".txt"
                                        onChange={(e) => handleFileChange(e, setFileA, setFileNameA)}
                                        className="hidden"
                                        id="fileA-upload"
                                    />
                                    <button
                                        onClick={() => document.getElementById('fileA-upload')?.click()}
                                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded border-2 border-slate-900 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {fileA.file ? 'Change File' : 'Select Document'}
                                    </button>
                                    {fileA.file && (
                                        <div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-medium">File loaded: **{fileA.file.name}**</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File B */}
                            <div className={`relative border-3 rounded-lg transition-all duration-300 ${fileB.file
                                    ? 'border-emerald-600 bg-emerald-50 shadow-lg'
                                    : 'border-slate-400 bg-slate-50 hover:border-slate-600 hover:shadow-md'
                                }`}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                        <h3 className="text-lg font-serif font-bold text-slate-800">{fileNameB}</h3>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".txt"
                                        onChange={(e) => handleFileChange(e, setFileB, setFileNameB)}
                                        className="hidden"
                                        id="fileB-upload"
                                    />
                                    <button
                                        onClick={() => document.getElementById('fileB-upload')?.click()}
                                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded border-2 border-slate-900 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {fileB.file ? 'Change File' : 'Select Document'}
                                    </button>
                                    {fileB.file && (
                                        <div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-medium">File loaded: **{fileB.file.name}**</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel */}
                    <div className="p-6 bg-slate-100 border-b-2 border-slate-200">
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={handleCompare}
                                disabled={!isReady}
                                className={`px-6 py-3 font-serif font-bold rounded border-2 shadow-md transition-all duration-200 flex items-center gap-2 ${isReady
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800'
                                        : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <GitCompare className="w-5 h-5" />
                                Compare Documents
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 font-serif font-bold rounded border-2 shadow-md transition-all duration-200 bg-red-600 hover:bg-red-700 text-white border-red-800 flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Clear All
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                disabled={!result || result.diffCount === 0}
                                className={`px-6 py-3 font-serif font-bold rounded border-2 shadow-md transition-all duration-200 flex items-center gap-2 ${result && result.diffCount > 0
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-800'
                                        : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Download className="w-5 h-5" />
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="p-5 bg-white border-b-2 border-slate-200">
                        <div className={`p-4 rounded border-l-4 font-serif ${status.startsWith('✓') ? 'bg-emerald-50 border-emerald-600 text-emerald-800' :
                                status.startsWith('⚠') ? 'bg-amber-50 border-amber-600 text-amber-800' :
                                    'bg-slate-50 border-slate-600 text-slate-800'
                            }`}>
                            <p className="text-center font-medium">{status}</p>
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="p-8 bg-white">
                            <div className="mb-6 pb-4 border-b-2 border-slate-300">
                                <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-amber-600 rounded"></div>
                                    Comparison Results
                                    <span className="text-lg font-normal text-slate-600">
                                        ({result.diffCount} of {result.maxLines} lines differ)
                                    </span>
                                </h2>
                            </div>

                            {result.diffCount > 0 ? (
                                <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-inner">
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-700 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-serif font-bold text-white w-24 border-r border-slate-600">Line</th>
                                                    <th className="px-4 py-3 text-left text-sm font-serif font-bold text-white border-r border-slate-600">{fileNameA}</th>
                                                    <th className="px-4 py-3 text-left text-sm font-serif font-bold text-white">{fileNameB}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                {result.diffLines.map((diff, index) => (
                                                    <tr key={index} className="border-b border-slate-200 hover:bg-amber-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 bg-slate-100 border-r border-slate-300">
                                                            {diff.lineNum}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-mono text-slate-700 border-r border-slate-200">
                                                            <span className={diff.file1Content.startsWith('<Missing Line') ? 'text-red-600 italic font-serif' : ''}>
                                                                {diff.file1Content.replace('<Missing Line (Document A)>', '**<DELETED LINE>**')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-mono text-slate-700">
                                                            <span className={diff.file2Content.startsWith('<Missing Line') ? 'text-red-600 italic font-serif' : ''}>
                                                                {diff.file2Content.replace('<Missing Line (Document B)>', '**<INSERTED LINE>**')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                                    <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                                    <p className="text-xl font-serif font-bold text-emerald-800">
                                        Documents are identical
                                    </p>
                                    <p className="text-slate-600 mt-2">No differences found between the files</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pb-6">
                    <p className="text-slate-600 text-sm font-serif italic">
                        Professional Document Comparison Tool
                    </p>
                </div>
            </main>
        </div>
    );
}