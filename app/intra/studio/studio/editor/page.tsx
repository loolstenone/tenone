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
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/intra/studio/studio" className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-xl font-bold text-white focus:outline-none placeholder-zinc-600"
                            placeholder="Enter title..."
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-zinc-500">Draft</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-xs text-zinc-500">Last saved just now</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${isAiPanelOpen ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'}`}
                    >
                        <Wand2 className="h-4 w-4" />
                        AI Assistant
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
                        <Save className="h-4 w-4" />
                        Save Draft
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
                    {/* Formatting Toolbar (Mock) */}
                    <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/50">
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><Type className="h-4 w-4" /></button>
                        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white font-bold">B</button>
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white italic">I</button>
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white underline">U</button>
                        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><ImageIcon className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><Video className="h-4 w-4" /></button>
                    </div>

                    <textarea
                        className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-zinc-200 leading-relaxed custom-scrollbar"
                        placeholder="Start planning your content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>

                {/* AI Sidebar */}
                {isAiPanelOpen && (
                    <div className="w-80 flex flex-col bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden animate-slide-in-right">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                AI Tools
                            </h3>
                            <button className="text-zinc-500 hover:text-white">
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Feature 1: Idea Generator */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Idea Generator</label>
                                <div className="space-y-2">
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500">
                                        <option>LUKI (AI Idol)</option>
                                        <option>RooK (Creator)</option>
                                        <option>Ten:One™ Corporate</option>
                                    </select>
                                    <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-md border border-zinc-700 transition-colors">
                                        Generate Concepts
                                    </button>
                                </div>
                            </div>

                            <hr className="border-zinc-800" />

                            {/* Feature 2: Draft Writer */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Smart Writer</label>
                                <textarea
                                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 placeholder-zinc-600 resize-none"
                                    placeholder="Describe what you want to write about..."
                                ></textarea>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-medium rounded-md border border-indigo-500/20 transition-colors">
                                        Write Draft
                                    </button>
                                    <button className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-md border border-zinc-700 transition-colors">
                                        Expand Text
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-xs text-center text-zinc-600">
                            Powered by Ten:One™ Intelligence
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
