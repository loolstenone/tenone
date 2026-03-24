"use client";

import { useState } from "react";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Video, Type, Settings, Wand2 } from "lucide-react";
import Link from "next/link";

export default function ContentEditorPage() {
    const [title, setTitle] = useState("Untitled Project");
    const [content, setContent] = useState("");
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/intra/studio/studio" className="text-neutral-500 hover:text-neutral-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-xl font-bold focus:outline-none placeholder-neutral-300"
                            placeholder="Enter title..."
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-400">Draft</span>
                            <span className="text-neutral-300">•</span>
                            <span className="text-xs text-neutral-400">Last saved just now</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border ${isAiPanelOpen ? 'bg-neutral-100 text-neutral-900 border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-900'}`}
                    >
                        <Wand2 className="h-4 w-4" />
                        AI Assistant
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">
                        <Save className="h-4 w-4" />
                        Save Draft
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col bg-white border border-neutral-200 overflow-hidden">
                    {/* Formatting Toolbar (Mock) */}
                    <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900" aria-label="텍스트 서식"><Type className="h-4 w-4" /></button>
                        <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 font-bold" aria-label="굵게">B</button>
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 italic" aria-label="기울임">I</button>
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 underline" aria-label="밑줄">U</button>
                        <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900" aria-label="이미지 삽입"><ImageIcon className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900" aria-label="동영상 삽입"><Video className="h-4 w-4" /></button>
                    </div>

                    <textarea
                        className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none leading-relaxed custom-scrollbar"
                        placeholder="Start planning your content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>

                {/* AI Sidebar */}
                {isAiPanelOpen && (
                    <div className="w-80 flex flex-col bg-white border border-neutral-200 overflow-hidden animate-slide-in-right">
                        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-neutral-400" />
                                AI Tools
                            </h3>
                            <button className="text-neutral-400 hover:text-neutral-900">
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Feature 1: Idea Generator */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Idea Generator</label>
                                <div className="space-y-2">
                                    <select className="w-full bg-white border border-neutral-200 p-2 text-sm focus:outline-none focus:border-neutral-900">
                                        <option>LUKI (AI Idol)</option>
                                        <option>RooK (Creator)</option>
                                        <option>Ten:One™ Corporate</option>
                                    </select>
                                    <button className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium border border-neutral-200 transition-colors">
                                        Generate Concepts
                                    </button>
                                </div>
                            </div>

                            <hr className="border-neutral-200" />

                            {/* Feature 2: Draft Writer */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Smart Writer</label>
                                <textarea
                                    className="w-full h-24 bg-white border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-900 placeholder-neutral-300 resize-none"
                                    placeholder="Describe what you want to write about..."
                                ></textarea>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">
                                        Write Draft
                                    </button>
                                    <button className="py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium border border-neutral-200 transition-colors">
                                        Expand Text
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-center text-neutral-300">
                            Powered by Ten:One™ Intelligence
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
