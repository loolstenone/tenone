"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ImportPage() {
    const [dragOver, setDragOver] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Import</h2>
                <p className="mt-2 text-zinc-400">외부 데이터를 대량으로 가져옵니다.</p>
            </div>

            {/* Upload Area */}
            <div
                className={`rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                    dragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-700 bg-zinc-900/30'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
            >
                <Upload className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">파일을 드래그하거나 클릭하여 업로드</h3>
                <p className="text-sm text-zinc-500 mt-2">CSV, XLSX 파일 지원 (최대 10,000건)</p>
                <button className="mt-4 px-6 py-2.5 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                    파일 선택
                </button>
            </div>

            {/* Import Guide */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">데이터 형식 가이드</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs text-indigo-400 mb-2">필수 컬럼</h4>
                        <ul className="space-y-1 text-sm text-zinc-400">
                            <li>• name (이름)</li>
                            <li>• email (이메일)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs text-indigo-400 mb-2">선택 컬럼</h4>
                        <ul className="space-y-1 text-sm text-zinc-400">
                            <li>• phone (연락처)</li>
                            <li>• company (회사/소속)</li>
                            <li>• type (유형: Student, Professional, Mentor...)</li>
                            <li>• status (상태: Active, Lead, Inactive)</li>
                            <li>• tags (태그, 쉼표 구분)</li>
                            <li>• source (유입 경로)</li>
                            <li>• notes (메모)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recent Imports (Mock) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h3 className="text-sm font-semibold text-white">최근 Import 이력</h3>
                </div>
                <ul className="divide-y divide-zinc-800/50">
                    <li className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                            <div>
                                <p className="text-sm text-white">badak_members_2025.xlsx</p>
                                <p className="text-xs text-zinc-500">234건 · 2025-09-01</p>
                            </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </li>
                    <li className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                            <div>
                                <p className="text-sm text-white">madleague_alumni.csv</p>
                                <p className="text-xs text-zinc-500">128건 · 2025-08-15</p>
                            </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </li>
                </ul>
            </div>
        </div>
    );
}
