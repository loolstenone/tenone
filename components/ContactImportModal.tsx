"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx"; // Needs npm install xlsx
import { Contact } from "@/types/contact";
import { Upload, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (newContacts: Contact[]) => void;
}

export function ContactImportModal({ isOpen, onClose, onImport }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet);

                if (json.length === 0) {
                    setError("The file appears to be empty.");
                    return;
                }

                setPreview(json);
            } catch (err) {
                console.error(err);
                setError("Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const mapDataToContacts = () => {
        // Basic mapping logic - assumes headers are roughly matching
        const newContacts: Contact[] = preview.map((row: any, index) => ({
            id: `imported-${Date.now()}-${index}`,
            name: row['Name'] || row['name'] || row['이름'] || 'Unknown',
            role: row['Role'] || row['role'] || row['직군'] || 'Partner', // Default to Partner
            company: row['Company'] || row['company'] || row['회사'] || '',
            email: row['Email'] || row['email'] || row['이메일'] || '',
            phone: row['Phone'] || row['phone'] || row['전화번호'] || '',
            status: 'Active', // Default status
            brandAssociation: [], // Default empty
            notes: row['Notes'] || row['notes'] || row['비고'] || '',
        }));

        onImport(newContacts);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-bold text-white">Import Contacts</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={clsx(
                                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                                isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50"
                            )}
                        >
                            <FileSpreadsheet className="h-12 w-12 text-zinc-500 mb-4" />
                            <p className="text-lg font-medium text-white mb-1">Upload Excel File</p>
                            <p className="text-sm text-zinc-400">Drag & drop or click to browse (.xlsx, .csv)</p>
                            <input ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                        <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB • {preview.length} rows detected</p>
                                    </div>
                                </div>
                                <button onClick={() => { setFile(null); setPreview([]); }} className="text-xs text-zinc-400 hover:text-white underline">
                                    Change File
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {preview.length > 0 && (
                                <div className="max-h-60 overflow-y-auto border border-zinc-800 rounded-lg">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-zinc-900 text-zinc-400 sticky top-0">
                                            <tr>
                                                {Object.keys(preview[0]).map((key) => (
                                                    <th key={key} className="px-3 py-2 border-b border-zinc-800 font-medium">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                                            {preview.slice(0, 5).map((row, i) => (
                                                <tr key={i}>
                                                    {Object.values(row).map((val: any, j) => (
                                                        <td key={j} className="px-3 py-2 text-zinc-300 truncate max-w-[150px]">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {preview.length > 5 && (
                                        <div className="p-2 text-center text-xs text-zinc-500 bg-zinc-900/50 border-t border-zinc-800">
                                            ...and {preview.length - 5} more rows
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/30">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        disabled={!file || preview.length === 0}
                        onClick={mapDataToContacts}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
                    >
                        Import {preview.length} Contacts
                    </button>
                </div>
            </div>
        </div>
    );
}
