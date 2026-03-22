"use client";

import { useState } from "react";
import { Send, Upload, User, ArrowRight } from "lucide-react";

const approvalLine = [
    { role: "기안자", name: "나 (Cheonil Jeon)" },
    { role: "1차 결재", name: "Sarah Kim" },
    { role: "최종 결재", name: "Cheonil Jeon" },
];

export default function ApprovalDraftPage() {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("기안");
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("기안이 제출되었습니다.");
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">기안하기</h1>
                <p className="text-sm text-neutral-500">새로운 기안 문서를 작성합니다</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 결재유형 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">기안 유형</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    >
                        <option value="기안">기안</option>
                        <option value="품의">품의</option>
                        <option value="보고">보고</option>
                    </select>
                </div>

                {/* 제목 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="기안 제목을 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 결재라인 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-2">결재라인</label>
                    <div className="flex items-center gap-1.5">
                        {approvalLine.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                                    <User className="w-3.5 h-3.5 text-neutral-400" />
                                    <div>
                                        <div className="text-xs text-neutral-400">{step.role}</div>
                                        <div className="text-xs text-neutral-700">{step.name}</div>
                                    </div>
                                </div>
                                {idx < approvalLine.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 내용 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        placeholder="기안 내용을 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 첨부파일 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">첨부파일</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">클릭하여 파일을 첨부하세요</span>
                    </div>
                </div>

                {/* 제출 */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                        <Send className="w-3.5 h-3.5" />
                        기안 제출
                    </button>
                </div>
            </form>
        </div>
    );
}
