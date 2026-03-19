"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ImportPage() {
    const [dragOver, setDragOver] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Import</h2>
                <p className="mt-2 text-neutral-500">외부 데이터를 대량으로 가져옵니다.</p>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed p-12 text-center transition-colors ${
                    dragOver ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-300 bg-white'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
            >
                <Upload className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">파일을 드래그하거나 클릭하여 업로드</h3>
                <p className="text-sm text-neutral-400 mt-2">CSV, XLSX 파일 지원 (최대 10,000건)</p>
                <button className="mt-4 px-6 py-2.5 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    파일 선택
                </button>
            </div>

            {/* Import Guide */}
            <div className="border border-neutral-200 bg-white p-6">
                <h3 className="text-sm font-semibold mb-4">데이터 형식 가이드</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs text-neutral-400 mb-2">필수 컬럼</h4>
                        <ul className="space-y-1 text-sm text-neutral-500">
                            <li>• name (이름)</li>
                            <li>• email (이메일)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs text-neutral-400 mb-2">선택 컬럼</h4>
                        <ul className="space-y-1 text-sm text-neutral-500">
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
            <div className="border border-neutral-200 bg-white">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold">최근 Import 이력</h3>
                </div>
                <ul className="divide-y divide-neutral-100">
                    <li className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-neutral-500" />
                            <div>
                                <p className="text-sm">badak_members_2025.xlsx</p>
                                <p className="text-xs text-neutral-400">234건 · 2025-09-01</p>
                            </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                    </li>
                    <li className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-neutral-500" />
                            <div>
                                <p className="text-sm">madleague_alumni.csv</p>
                                <p className="text-xs text-neutral-400">128건 · 2025-08-15</p>
                            </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                    </li>
                </ul>
            </div>
        </div>
    );
}
