"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, X, Pencil, RotateCcw } from "lucide-react";
import { trackPlanners } from "@/lib/myverse/analytics";

const AI_TARGETS = [
    { key: "claude", label: "Claude", url: "https://claude.ai/new?q=" },
    { key: "chatgpt", label: "ChatGPT", url: "https://chatgpt.com/?q=" },
    { key: "gemini", label: "Gemini", url: "https://gemini.google.com/app?q=" },
];

interface Props {
    title?: string;
    payload: string;
    hint?: string;
}

export function CopyToAiButton({ title, payload, hint }: Props) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState("");

    const fullPrompt = [
        title ? `# ${title}` : "",
        hint ? `\n${hint}\n` : "",
        "\n---\n",
        payload,
        "\n---\n",
        "\n위 내용에 대해 비판적으로 검토하고, 빠진 관점이나 개선할 점을 구체적으로 제시해 주세요.",
    ].filter(Boolean).join("\n");

    const activePrompt = editedPrompt || fullPrompt;

    useEffect(() => {
        if (open) setEditedPrompt("");
    }, [open]);

    async function copyToClipboard() {
        await navigator.clipboard.writeText(activePrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function openExternal(url: string, target: string) {
        const encoded = encodeURIComponent(activePrompt);
        navigator.clipboard.writeText(activePrompt).catch(() => {});
        trackPlanners("myverse_copy_to_ai", { target });
        window.open(url + encoded.slice(0, 4000), "_blank");
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#6366F1]/30 text-[#6366F1] rounded-lg text-xs hover:bg-[#6366F1]/5 transition-colors"
            >
                <Sparkles className="h-3.5 w-3.5" /> Copy to AI
            </button>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="font-semibold text-neutral-900">심층 검증 — 외부 AI에게 위임</h3>
                            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                현재 내용을 원하는 AI로 보내 비판적 검증을 받으세요. 아래 버튼은 프롬프트를
                                자동 복사한 후 해당 AI로 이동합니다. 긴 내용은 AI 화면에서 붙여넣기 해주세요.
                            </p>

                            <div className="relative">
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    {editing && editedPrompt && (
                                        <button
                                            onClick={() => { setEditedPrompt(""); setEditing(false); }}
                                            className="flex items-center gap-0.5 px-2 py-1 bg-white border border-neutral-200 text-neutral-500 rounded text-[10px] hover:text-neutral-900"
                                        >
                                            <RotateCcw className="h-2.5 w-2.5" /> 초기화
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className={`flex items-center gap-0.5 px-2 py-1 border rounded text-[10px] transition-colors ${
                                            editing
                                                ? "bg-[#6366F1] border-[#6366F1] text-white"
                                                : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-900"
                                        }`}
                                    >
                                        <Pencil className="h-2.5 w-2.5" /> {editing ? "완료" : "편집"}
                                    </button>
                                </div>
                                {editing ? (
                                    <textarea
                                        value={editedPrompt || fullPrompt}
                                        onChange={(e) => setEditedPrompt(e.target.value)}
                                        rows={10}
                                        className="w-full bg-neutral-50 border border-[#6366F1]/30 rounded-lg p-3 text-[10px] text-neutral-700 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#6366F1]"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="bg-neutral-50 rounded-lg p-3 pt-8 max-h-40 overflow-y-auto">
                                        <pre className="text-[10px] text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed">
                                            {activePrompt.slice(0, 500)}
                                            {activePrompt.length > 500 && "\n..."}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {AI_TARGETS.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => openExternal(t.url, t.key)}
                                        className="px-3 py-2 bg-[#6366F1] text-white rounded-lg text-sm hover:bg-[#4F46E5] transition-colors"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                {copied ? <><Check className="h-4 w-4 text-green-600" /> 복사됨</> : <><Copy className="h-4 w-4" /> 프롬프트만 복사</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
